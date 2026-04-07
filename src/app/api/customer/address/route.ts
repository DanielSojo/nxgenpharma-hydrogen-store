import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { shopifyAdminRequest } from '@/lib/shopify/admin';

const GET_CUSTOMER_DEFAULT_ADDRESS = `
  query GetCustomerDefaultAddress($id: ID!) {
    customer(id: $id) {
      defaultEmailAddress {
        emailAddress
      }
      defaultAddress {
        firstName
        lastName
        address1
        city
        province
        zip
        country
      }
    }
  }
`;

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await shopifyAdminRequest<{
      customer: {
        defaultEmailAddress?: { emailAddress?: string | null } | null;
        defaultAddress?: {
          firstName?: string | null;
          lastName?: string | null;
          address1?: string | null;
          city?: string | null;
          province?: string | null;
          zip?: string | null;
          country?: string | null;
        } | null;
      } | null;
    }>(GET_CUSTOMER_DEFAULT_ADDRESS, { id: session.user.id });

    const address = data.customer?.defaultAddress;

    return NextResponse.json({
      address: address
        ? {
            firstName: address.firstName ?? '',
            lastName: address.lastName ?? '',
            address: address.address1 ?? '',
            city: address.city ?? '',
            state: address.province ?? '',
            zip: address.zip ?? '',
            country: address.country ?? '',
          }
        : null,
    });
  } catch (error) {
    console.error('[Customer Address] Failed to fetch default address:', error);
    return NextResponse.json(
      { error: 'Failed to load customer address' },
      { status: 500 }
    );
  }
}
