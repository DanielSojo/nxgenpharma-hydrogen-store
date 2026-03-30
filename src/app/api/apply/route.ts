import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify/client';
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
  taxId: z.string().optional(),
  website: z.string().optional(),
  message: z.string().optional(),
});

function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  return Array.from({ length: 20 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

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

    const tempPassword = generateTempPassword();

    // ── Step 1: Create customer ──────────────────────────────────────────────
    const { data: createResult, errors: createErrors } = await shopifyClient.request(
      CREATE_CUSTOMER,
      {
        variables: {
          input: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            password: tempPassword,
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
      if (err.code === 'TAKEN' || err.code === 'CUSTOMER_DISABLED') {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const customerId = createResult?.customerCreate?.customer?.id;

    // ── Step 2: Login to get access token ────────────────────────────────────
    const { data: tokenResult } = await shopifyClient.request(GET_ACCESS_TOKEN, {
      variables: {
        input: { email: data.email, password: tempPassword },
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
          data.taxId ? `Tax ID: ${data.taxId}` : '',
          data.website ? `Website: ${data.website}` : '',
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
            `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/graphql.json`,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
