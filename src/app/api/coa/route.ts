import { NextRequest, NextResponse } from 'next/server';
import { findCoaByLot } from '@/lib/coa';

// GET /api/coa?lot=Nexg24060117 — look up a Certificate of Analysis (PDF) by
// lot number, sourced from Shopify Files.
export async function GET(req: NextRequest) {
  const lot = req.nextUrl.searchParams.get('lot')?.trim() ?? '';

  if (!lot) {
    return NextResponse.json({ error: 'Lot number is required' }, { status: 400 });
  }

  try {
    const result = await findCoaByLot(lot);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('COA lookup error:', error);
    return NextResponse.json(
      { error: 'Unable to look up certificates right now. Please try again later.' },
      { status: 502 }
    );
  }
}
