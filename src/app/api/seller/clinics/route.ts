import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSellerClinicsWithOrders } from '@/lib/shopify/seller';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sellerId = (session.user as any).id as string | undefined;
  if (!sellerId) {
    return NextResponse.json({ error: 'No customer id' }, { status: 401 });
  }

  try {
    const clinics = await getSellerClinicsWithOrders(sellerId);
    const totalProfit = clinics.reduce((sum, c) => sum + c.totalProfit, 0);

    return NextResponse.json({
      isSeller: clinics.length > 0,
      clinics,
      totalProfit,
    });
  } catch (error) {
    console.error('[seller/clinics] error:', error);
    return NextResponse.json({ error: 'Failed to load clinics' }, { status: 500 });
  }
}
