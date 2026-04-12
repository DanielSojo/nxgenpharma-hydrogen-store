import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { shopifyClient } from '@/lib/shopify/client';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(7, 'Enter a valid phone number'),
  company: z.string().trim().optional(),
  address1: z.string().trim().min(1, 'Street address is required'),
  address2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State / Province is required'),
  zip: z.string().trim().min(1, 'ZIP / Postal code is required'),
  country: z.string().trim().min(1, 'Country is required'),
});

const GET_CUSTOMER_PROFILE = `
  query GetCustomerProfile($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
    }
  }
`;

const UPDATE_CUSTOMER = `
  mutation UpdateCustomerProfile($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
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
  mutation UpdateCustomerAddress(
    $customerAccessToken: String!
    $id: ID!
    $address: MailingAddressInput!
  ) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CREATE_CUSTOMER_ADDRESS = `
  mutation CreateCustomerAddress(
    $customerAccessToken: String!
    $address: MailingAddressInput!
  ) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const SET_DEFAULT_CUSTOMER_ADDRESS = `
  mutation SetDefaultCustomerAddress($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

type CustomerProfileData = {
  customer: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    defaultAddress?: {
      id?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      company?: string | null;
      address1?: string | null;
      address2?: string | null;
      city?: string | null;
      province?: string | null;
      zip?: string | null;
      country?: string | null;
      phone?: string | null;
    } | null;
  } | null;
};

function getProfilePayload(customer: CustomerProfileData['customer']) {
  const address = customer?.defaultAddress;

  return {
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? address?.phone ?? '',
    company: address?.company ?? '',
    address1: address?.address1 ?? '',
    address2: address?.address2 ?? '',
    city: address?.city ?? '',
    state: address?.province ?? '',
    zip: address?.zip ?? '',
    country: address?.country ?? '',
  };
}

async function getCustomerAccessToken(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.accessToken as string | undefined;
}

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerAccessToken = await getCustomerAccessToken(req);

  if (!customerAccessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    const { data, errors } = await shopifyClient.request<CustomerProfileData>(
      GET_CUSTOMER_PROFILE,
      {
        variables: { customerAccessToken },
      }
    );

    if (errors || !data?.customer) {
      return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: getProfilePayload(data.customer) });
  } catch (error) {
    console.error('[Customer Profile] Failed to load profile:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerAccessToken = await getCustomerAccessToken(req);

  if (!customerAccessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const profile = profileSchema.parse(body);

    const { data: currentData, errors: currentErrors } = await shopifyClient.request<CustomerProfileData>(
      GET_CUSTOMER_PROFILE,
      {
        variables: { customerAccessToken },
      }
    );

    if (currentErrors || !currentData?.customer) {
      return NextResponse.json({ error: 'Failed to load current profile' }, { status: 500 });
    }

    const { data: customerResult, errors: customerErrors } = await shopifyClient.request(
      UPDATE_CUSTOMER,
      {
        variables: {
          customerAccessToken,
          customer: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
          },
        },
      }
    );

    if (customerErrors) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    const customerUserErrors = customerResult?.customerUpdate?.customerUserErrors ?? [];
    if (customerUserErrors.length > 0) {
      return NextResponse.json(
        { error: customerUserErrors[0].message ?? 'Failed to update profile' },
        { status: 400 }
      );
    }

    const addressInput = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      company: profile.company || undefined,
      address1: profile.address1,
      address2: profile.address2 || undefined,
      city: profile.city,
      province: profile.state,
      zip: profile.zip,
      country: profile.country,
      phone: profile.phone,
    };

    const currentAddressId = currentData.customer.defaultAddress?.id;

    if (currentAddressId) {
      const { data: addressResult, errors: addressErrors } = await shopifyClient.request(
        UPDATE_CUSTOMER_ADDRESS,
        {
          variables: {
            customerAccessToken,
            id: currentAddressId,
            address: addressInput,
          },
        }
      );

      if (addressErrors) {
        return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
      }

      const addressUserErrors = addressResult?.customerAddressUpdate?.customerUserErrors ?? [];
      if (addressUserErrors.length > 0) {
        return NextResponse.json(
          { error: addressUserErrors[0].message ?? 'Failed to update address' },
          { status: 400 }
        );
      }
    } else {
      const { data: addressResult, errors: addressErrors } = await shopifyClient.request(
        CREATE_CUSTOMER_ADDRESS,
        {
          variables: {
            customerAccessToken,
            address: addressInput,
          },
        }
      );

      if (addressErrors) {
        return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
      }

      const addressUserErrors = addressResult?.customerAddressCreate?.customerUserErrors ?? [];
      if (addressUserErrors.length > 0) {
        return NextResponse.json(
          { error: addressUserErrors[0].message ?? 'Failed to save address' },
          { status: 400 }
        );
      }

      const newAddressId = addressResult?.customerAddressCreate?.customerAddress?.id;

      if (newAddressId) {
        const { data: defaultResult, errors: defaultErrors } = await shopifyClient.request(
          SET_DEFAULT_CUSTOMER_ADDRESS,
          {
            variables: {
              customerAccessToken,
              addressId: newAddressId,
            },
          }
        );

        if (defaultErrors) {
          return NextResponse.json(
            { error: 'Address saved, but failed to set it as default' },
            { status: 500 }
          );
        }

        const defaultUserErrors =
          defaultResult?.customerDefaultAddressUpdate?.customerUserErrors ?? [];
        if (defaultUserErrors.length > 0) {
          return NextResponse.json(
            {
              error:
                defaultUserErrors[0].message ??
                'Address saved, but failed to set it as default',
            },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error('[Customer Profile] Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
