import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const GET_CUSTOMER_PROFILE = `
  query GetCustomerProfile($accessToken: String!) {
    customer(customerAccessToken: $accessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        company
        address1
        address2
        city
        province
        zip
        country
      }
    }
  }
`;

const UPDATE_CUSTOMER = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
        defaultAddress {
          company
          address1
          address2
          city
          province
          zip
          country
        }
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const UPDATE_CUSTOMER_ADDRESS = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer { id }
      customerUserErrors { code field message }
    }
  }
`;

const CREATE_ADDRESS = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress { id }
      customerUserErrors { code field message }
    }
  }
`;

const UPDATE_ADDRESS = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress { id }
      customerUserErrors { code field message }
    }
  }
`;

async function storefrontRequest(query: string, variables: Record<string, any>) {
  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_ADMIN_API_VERSION ?? '2026-01'}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  return response.json();
}

// ─── GET /api/customer/profile ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = (session.user as any).accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    const { data, errors } = await storefrontRequest(GET_CUSTOMER_PROFILE, { accessToken });

    if (errors?.length) {
      return NextResponse.json({ error: errors[0].message }, { status: 400 });
    }

    const customer = data?.customer;
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        firstName: customer.firstName ?? '',
        lastName: customer.lastName ?? '',
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        company: customer.defaultAddress?.company ?? '',
        address1: customer.defaultAddress?.address1 ?? '',
        address2: customer.defaultAddress?.address2 ?? '',
        city: customer.defaultAddress?.city ?? '',
        state: customer.defaultAddress?.province ?? '',
        zip: customer.defaultAddress?.zip ?? '',
        country: customer.defaultAddress?.country ?? '',
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

// ─── PUT /api/customer/profile ────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = (session.user as any).accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  const body = await req.json();
  const { firstName, lastName, email, phone, company, address1, address2, city, state, zip, country } = body;

  try {
    // Step 1: Update customer basic info
    const { data, errors } = await storefrontRequest(UPDATE_CUSTOMER, {
      customerAccessToken: accessToken,
      customer: { firstName, lastName, email, phone },
    });

    if (errors?.length) {
      return NextResponse.json({ error: errors[0].message }, { status: 400 });
    }

    const userErrors = data?.customerUpdate?.customerUserErrors ?? [];
    if (userErrors.length > 0) {
      return NextResponse.json({ error: userErrors[0].message }, { status: 400 });
    }

    const customer = data?.customerUpdate?.customer;

    // Step 2: Update default address
    const addressData = {
      company: company ?? '',
      address1,
      address2: address2 ?? '',
      city,
      province: state,
      zip,
      country,
      firstName,
      lastName,
    };

    const defaultAddressId = customer?.defaultAddress?.id;

    if (defaultAddressId) {
      // Update existing address
      await storefrontRequest(UPDATE_ADDRESS, {
        customerAccessToken: accessToken,
        id: defaultAddressId,
        address: addressData,
      });
    } else if (address1) {
      // Create new address
      const { data: addrData } = await storefrontRequest(CREATE_ADDRESS, {
        customerAccessToken: accessToken,
        address: addressData,
      });
      // Set as default
      const newAddressId = addrData?.customerAddressCreate?.customerAddress?.id;
      if (newAddressId) {
        await storefrontRequest(UPDATE_CUSTOMER_ADDRESS, {
          customerAccessToken: accessToken,
          addressId: newAddressId,
        });
      }
    }

    return NextResponse.json({
      profile: {
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        email: email ?? '',
        phone: phone ?? '',
        company: company ?? '',
        address1: address1 ?? '',
        address2: address2 ?? '',
        city: city ?? '',
        state: state ?? '',
        zip: zip ?? '',
        country: country ?? '',
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}