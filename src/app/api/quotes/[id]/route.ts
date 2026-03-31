import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchAuthorizedQuote } from '@/lib/quotes';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: draftOrderId } = await params;
  const result = await fetchAuthorizedQuote(session.user as any, draftOrderId);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
