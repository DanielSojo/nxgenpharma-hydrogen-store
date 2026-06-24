import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateQuotePDF } from '@/lib/pdf';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const customerId = (session.user as any).id;
  const { id: draftOrderId } = await params;
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2026-01';

  try {
    // Fetch draft order
    let responseJson: any;

    if (process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET) {
      const { shopifyAdminRestRequest } = await import('@/lib/shopify/admin');
      responseJson = await shopifyAdminRestRequest(
        `draft_orders/${draftOrderId}.json`
      );
    } else if (process.env.SHOPIFY_ADMIN_TOKEN) {
      const response = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${apiVersion}/draft_orders/${draftOrderId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
          },
        }
      );
      responseJson = await response.json();
    } else {
      return new NextResponse('Admin API not configured', { status: 503 });
    }

    const order = responseJson?.draft_order;
    if (!order) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    // Security: verify this belongs to the logged-in customer
    const numericCustomerId = customerId?.includes('gid://')
      ? customerId.split('/').pop()
      : customerId;

    if (String(order.customer?.id) !== String(numericCustomerId)) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Parse quote number from note
    const quoteNumberMatch = order.note?.match(/Quote Number: (Q\S+)/);
    const quoteNumber = quoteNumberMatch?.[1] ?? order.name;

    // Parse customer notes (strip admin info)
    const customerNotesMatch = order.note?.match(/Customer Notes: (.+)/);
    const customerNotes = customerNotesMatch?.[1];

    // Line items at their original price
    const lineItems = order.line_items.map((item: any) => ({
      title: item.title,
      price: item.price,
      quantity: item.quantity,
    }));

    const subtotal = lineItems
      .reduce((sum: number, item: any) => sum + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);

    const hasTax = parseFloat(order.total_tax ?? '0') > 0;
    const hasShipping =
      order.shipping_line && parseFloat(order.shipping_line?.price ?? '0') > 0;

    const tax = hasTax ? order.total_tax : undefined;
    const shipping = hasShipping
      ? { title: order.shipping_line.title, price: order.shipping_line.price }
      : undefined;

    const total = (
      parseFloat(subtotal) +
      parseFloat(tax ?? '0') +
      parseFloat(shipping?.price ?? '0')
    ).toFixed(2);

    // Generate PDF
    const pdfBuffer = await generateQuotePDF({
      id: order.id,
      name: order.name,
      quoteNumber,
      createdAt: order.created_at,
      currency: order.currency,
      subtotal_price: subtotal,
      total_tax: tax,
      total_price: total,
      shipping_line: shipping,
      line_items: lineItems,
      shipping_address: order.shipping_address,
      customer: order.customer
        ? {
            first_name: order.customer.first_name,
            last_name: order.customer.last_name,
            email: order.email ?? '',
          }
        : undefined,
      customerNotes,
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quoteNumber}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}