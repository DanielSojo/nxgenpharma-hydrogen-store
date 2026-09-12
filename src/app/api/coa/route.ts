import { NextRequest, NextResponse } from 'next/server';
import { findCoasByLot } from '@/lib/coa';

// GET /api/coa?lot=Nexg24060117 — look up the Certificates of Analysis (PDFs)
// published under a lot number, sourced from Shopify Files. A lot that covers
// several doses returns one entry per dose.
export async function GET(req: NextRequest) {
  const lot = req.nextUrl.searchParams.get('lot')?.trim() ?? '';

  if (!lot) {
    return NextResponse.json({ error: 'Lot number is required' }, { status: 400 });
  }

  try {
    const results = await findCoasByLot(lot);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('COA lookup error:', error);
    return NextResponse.json(
      { error: 'Unable to look up certificates right now. Please try again later.' },
      { status: 502 }
    );
  }
}
