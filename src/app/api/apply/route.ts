import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify/client';
import { getShopifyStoreDomain } from '@/lib/shopify/env';
import { z } from 'zod';

const applicationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  businessType: z.string().min(1),
  taxId: z.string().regex(/^\d{10}$/),
  website: z.string().optional(),
  referralSource: z.string().min(1),
  message: z.string().optional(),
  // Shopify's own floor is 5 characters; 8 is the minimum we accept. Shopify
  // also rejects passwords padded with whitespace, so catch that here and give
  // a useful message instead of letting customerCreate fail opaquely.
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer')
    .refine((value) => value.trim() === value, {
      message: 'Password cannot start or end with a space',
    }),
});

// Step 1: Create customer
const CREATE_CUSTOMER = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email }
      customerUserErrors { code field message }
    }
  }
`;

// Step 2: Login to get access token
const GET_ACCESS_TOKEN = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code message }
    }
  }
`;

// Step 3: Save address using access token
const CREATE_ADDRESS = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress { id }
      customerUserErrors { code message }
    }
  }
`;

// Step 4: Update customer with extra info in lastName as note workaround
// Storefront API customerUpdate supports: firstName, lastName, email, phone, password, acceptsMarketing
const UPDATE_CUSTOMER = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer { id }
      customerUserErrors { code message }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = applicationSchema.parse(body);

    // ── Step 1: Create customer ──────────────────────────────────────────────
    // The applicant sets this password themselves, so once an admin approves
    // the account they can sign in directly — no invite or reset mail needed.
    const { data: createResult, errors: createErrors } = await shopifyClient.request(
      CREATE_CUSTOMER,
      {
        variables: {
          input: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            password: data.password,
            acceptsMarketing: false,
          },
        },
      }
    );

    if (createErrors) {
      const msg = (createErrors as any)?.graphQLErrors?.[0]?.message ?? 'Failed to create account';
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const customerErrors = createResult?.customerCreate?.customerUserErrors ?? [];
    if (customerErrors.length > 0) {
      const err = customerErrors[0];

      // Codes and field paths only — never the submitted values. Without this
      // the route collapsed every Shopify rejection into a generic message and
      // there was no way to tell a duplicate email from a store-configuration
      // problem.
      console.warn(
        '[Apply] customerCreate rejected:',
        customerErrors.map((e: any) => `${e.code} @ ${JSON.stringify(e.field)}: ${e.message}`).join(' | ')
      );
      // `field` arrives as a path, e.g. ['input', 'password'].
      const field: string = Array.isArray(err.field) ? err.field[err.field.length - 1] : '';

      if (field === 'password') {
        const passwordMessages: Record<string, string> = {
          TOO_SHORT: 'Password is too short. Use at least 8 characters.',
          TOO_LONG: 'Password is too long. Use 72 characters or fewer.',
          PASSWORD_STARTS_OR_ENDS_WITH_WHITESPACE:
            'Password cannot start or end with a space.',
          CONTAINS_HTML_TAGS: 'Password cannot contain HTML tags.',
          CONTAINS_URL: 'Password cannot contain a web address.',
          INVALID: 'That password is not accepted. Please choose a different one.',
        };
        return NextResponse.json(
          { error: passwordMessages[err.code] ?? err.message, field: 'password' },
          { status: 400 }
        );
      }

      // Shopify enforces uniqueness on phone as well as email, and reports which
      // one in `field`. Assuming TAKEN always meant "email" made a duplicate
      // phone number surface as an error on the email input.
      if (err.code === 'TAKEN') {
        if (field === 'phone') {
          return NextResponse.json(
            {
              error:
                'This phone number is already registered to another account. Use a different number, or sign in if the account is yours.',
              field: 'phone',
              code: 'TAKEN',
            },
            { status: 409 }
          );
        }

        if (field === 'email') {
          return NextResponse.json(
            {
              error:
                'An account with this email already exists. Sign in with your password, or use "Forgot your password?" if you don\'t have it.',
              field: 'email',
              code: 'TAKEN',
            },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { error: err.message, field: field || undefined, code: 'TAKEN' },
          { status: 409 }
        );
      }

      if (err.code === 'CUSTOMER_DISABLED') {
        return NextResponse.json(
          {
            error:
              'An account with this email exists but is not active yet. Reset your password to activate it, or contact us and we\'ll help.',
            field: 'email',
            code: 'CUSTOMER_DISABLED',
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: err.message, field: field || undefined }, { status: 400 });
    }

    const customerId = createResult?.customerCreate?.customer?.id;

    // ── Step 2: Login to get access token ────────────────────────────────────
    const { data: tokenResult } = await shopifyClient.request(GET_ACCESS_TOKEN, {
      variables: {
        input: { email: data.email, password: data.password },
      },
    });

    const accessToken =
      tokenResult?.customerAccessTokenCreate?.customerAccessToken?.accessToken;

    if (!accessToken) {
      // Customer was created but we can't get token — still return success
      console.warn('Could not get access token after customer creation');
      return NextResponse.json({ success: true });
    }

    // ── Step 3: Save address ─────────────────────────────────────────────────
    const { data: addressResult, errors: addressApiErrors } = await shopifyClient.request(CREATE_ADDRESS, {
      variables: {
        customerAccessToken: accessToken,
        address: {
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          address1: data.address,
          city: data.city,
          province: data.state,
          zip: data.zipCode,
          country: data.country,
          phone: data.phone,
        },
      },
    });

    if (addressApiErrors) {
      console.error('Address API errors:', JSON.stringify(addressApiErrors, null, 2));
    }

    const addressErrors = addressResult?.customerAddressCreate?.customerUserErrors ?? [];
    if (addressErrors.length > 0) {
      console.error('Address user errors:', JSON.stringify(addressErrors, null, 2));
    } else {
      console.log('Address saved successfully:', addressResult?.customerAddressCreate?.customerAddress?.id);
    }

    // ── Step 4: Tag customer via Admin API if available ──────────────────────
    const hasAdminOAuth =
      process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
    const hasAdminToken = process.env.SHOPIFY_ADMIN_TOKEN;

    if ((hasAdminOAuth || hasAdminToken) && customerId) {
      try {
        const note = [
          `Company: ${data.company}`,
          `Business Type: ${data.businessType}`,
          `NPI: ${data.taxId}`,
          data.website ? `Website: ${data.website}` : '',
          `How did you hear about us: ${data.referralSource}`,
          data.message ? `Message: ${data.message}` : '',
        ].filter(Boolean).join('\n');

        const UPDATE_CUSTOMER = `
          mutation UpdateCustomer($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer { id tags }
              userErrors { field message }
            }
          }
        `;

        if (hasAdminOAuth) {
          const { shopifyAdminRequest } = await import('@/lib/shopify/admin');
          await shopifyAdminRequest(UPDATE_CUSTOMER, {
            input: { id: customerId, tags: ['b2b-pending'], note },
          });
        } else {
          await fetch(
            `https://${getShopifyStoreDomain()}/admin/api/2025-04/graphql.json`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
              },
              body: JSON.stringify({
                query: UPDATE_CUSTOMER,
                variables: { input: { id: customerId, tags: ['b2b-pending'], note } },
              }),
            }
          );
        }
      } catch (e) {
        console.warn('Could not tag customer:', e);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.log({ error })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    // Deliberately narrow: this request carries a password, so only the error's
    // own message and stack are logged — never the thrown object, which could
    // grow a reference to the request payload in a future client version.
    console.error(
      'Application submission error:',
      error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error',
      error instanceof Error ? error.stack : undefined
    );
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
