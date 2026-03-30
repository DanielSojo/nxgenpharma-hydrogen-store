import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { shopifyAdminRequest, shopifyAdminRestRequest } from '@/lib/shopify/admin';
import { getShopifyStoreDomain } from '@/lib/shopify/env';
import { z } from 'zod';

const quoteSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string(),
      productTitle: z.string(),
      variantTitle: z.string(),
      productHandle: z.string(),
      image: z.string().nullable().optional(),
      price: z.string(),
      currencyCode: z.string(),
      quantity: z.number(),
    })
  ).min(1),
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  shipping: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  }),
  notes: z.string().optional(),
});

function generateQuoteNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `Q${year}${month}${day}-${random}`;
}

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(parseFloat(amount));
}

// ─── Fetch customer markup metafield ─────────────────────────────────────────
async function getCustomerMarkup(customerId: string): Promise<number> {
  try {
    const query = `
      query GetCustomerMarkup($id: ID!) {
        customer(id: $id) {
          metafield(namespace: "custom", key: "price_markup") {
            value
          }
        }
      }
    `;

    let data: any;
    const hasAdminOAuth =
      process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

    if (hasAdminOAuth) {
      data = await shopifyAdminRequest<any>(query, { id: customerId });
    } else if (process.env.SHOPIFY_ADMIN_TOKEN) {
      const response = await fetch(
        `https://${getShopifyStoreDomain()}/admin/api/${process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-04'}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
          },
          body: JSON.stringify({ query, variables: { id: customerId } }),
        }
      );
      const json = await response.json();
      data = json.data;
    }

    const value = data?.customer?.metafield?.value;
    const markup = value ? parseFloat(value) : 0;
    console.log(`[Quote] Customer ${customerId} markup: ${markup}%`);
    return markup;
  } catch (err) {
    console.warn('[Quote] Could not fetch customer markup:', err);
    return 0;
  }
}

// ─── Create Draft Order in Shopify ───────────────────────────────────────────
async function createShopifyDraftOrder(
  data: z.infer<typeof quoteSchema>,
  quoteNumber: string,
  customerId?: string
) {
  const hasAdminOAuth =
    process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  const hasAdminToken = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!hasAdminOAuth && !hasAdminToken) return null;

  // Fetch customer markup
  let markup = 0;
  if (customerId) {
    markup = await getCustomerMarkup(customerId);
    if (markup > 0) {
      console.log(`[Quote] Applying ${markup}% markup to all line items`);
    }
  }

  // Shopify ignores price override when variant_id is present (both REST and GraphQL)
  // Use custom line items without variant_id for full price control
  // Pass image_url and SKU to keep product context visible
  const lineItemsRest = data.items.map((item) => {
    const basePrice = parseFloat(item.price);
    const markedUpPrice = markup > 0
      ? (basePrice * (1 + markup / 100)).toFixed(2)
      : basePrice.toFixed(2);

    const variantIdNumeric = item.variantId.includes('gid://')
      ? item.variantId.split('/').pop()
      : item.variantId;

    const lineItem: Record<string, any> = {
      title: item.variantTitle !== 'Default Title'
        ? `${item.productTitle} - ${item.variantTitle}`
        : item.productTitle,
      price: markedUpPrice,
      quantity: item.quantity,
      requires_shipping: true,
      taxable: true,
      sku: `variant-${variantIdNumeric}`,
      properties: [
        { name: 'variantId', value: variantIdNumeric ?? '' },
        { name: 'productHandle', value: item.productHandle },
        { name: 'basePrice', value: `$${basePrice.toFixed(2)}` },
        ...(markup > 0 ? [{ name: 'markupApplied', value: `${markup}%` }] : []),
      ],
    };

    if (item.image) {
      lineItem.image_url = item.image;
    }

    return lineItem;
  });

  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-04';

  const numericCustomerId = customerId?.includes('gid://')
    ? customerId.split('/').pop()
    : customerId;

  const restBody: Record<string, any> = {
    draft_order: {
      line_items: lineItemsRest,
      note: [
        `Quote Number: ${quoteNumber}`,
        `Requested by: ${data.customer.name} (${data.customer.email})`,
        markup > 0 ? `Markup Applied: ${markup}%` : '',
        data.notes ? `Customer Notes: ${data.notes}` : '',
      ].filter(Boolean).join('\n'),
      tags: `b2b-quote,${quoteNumber}`,
      shipping_address: {
        address1: data.shipping.address,
        city: data.shipping.city,
        province: data.shipping.state,
        zip: data.shipping.zip,
        country: data.shipping.country,
        first_name: data.customer.name.split(' ')[0] ?? '',
        last_name: data.customer.name.split(' ').slice(1).join(' ') ?? '',
      },
      ...(numericCustomerId
        ? { customer: { id: numericCustomerId } }
        : { email: data.customer.email }),
    },
  };

  try {
    let responseJson: any;

    if (hasAdminOAuth) {
      responseJson = await shopifyAdminRestRequest('draft_orders.json', {
        method: 'POST',
        body: JSON.stringify(restBody),
      });
    } else {
      const response = await fetch(
        `https://${getShopifyStoreDomain()}/admin/api/${apiVersion}/draft_orders.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
          },
          body: JSON.stringify(restBody),
        }
      );
      responseJson = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(responseJson));
    }

    const draft = responseJson?.draft_order;
    if (!draft) return null;

    return {
      id: `gid://shopify/DraftOrder/${draft.id}`,
      name: draft.name,
      invoiceUrl: draft.invoice_url,
      status: draft.status,
      totalPrice: draft.total_price,
    };
  } catch (error) {
    console.error('Draft order creation failed:', error);
    return null;
  }
}

// ─── Build Email HTML ─────────────────────────────────────────────────────────
function buildEmailHtml(
  data: z.infer<typeof quoteSchema>,
  quoteNumber: string,
  draftOrder: any
): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeebe6;">
          <strong style="color: #111; font-size: 14px;">${item.productTitle}</strong>
          ${item.variantTitle !== 'Default Title' ? `<br><span style="color: #888; font-size: 12px;">${item.variantTitle}</span>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeebe6; text-align: center; font-size: 14px; color: #333;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeebe6; text-align: right; font-size: 14px; color: #666;">
          ${formatPrice(item.price, item.currencyCode)} / unit
        </td>
      </tr>
    `
    )
    .join('');

  const totalItems = data.items.reduce((sum, i) => sum + i.quantity, 0);

  const draftOrderSection = draftOrder
    ? `
      <tr>
        <td style="padding: 24px 40px 0;">
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px;">
            <p style="color: #0369a1; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">
              ✅ Draft Order Created in Shopify
            </p>
            <p style="color: #0c4a6e; font-size: 14px; margin: 0 0 12px;">
              Draft Order <strong>${draftOrder.name}</strong> has been created automatically.
            </p>
            <a href="https://${getShopifyStoreDomain()}/admin/draft_orders"
              style="display: inline-block; background: #0369a1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
              View in Shopify Admin →
            </a>
          </div>
        </td>
      </tr>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Quote ${quoteNumber}</title></head>
    <body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,'Helvetica Neue',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr>
                <td style="background:#0a0a0a;padding:32px 40px;">
                  <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">NxGen Pharma</h1>
                  <p style="color:#888;margin:4px 0 0;font-size:13px;">B2B Quote Request</p>
                </td>
              </tr>
              <tr>
                <td style="background:#2b7fff;padding:16px 40px;">
                  <p style="color:white;margin:0;font-size:13px;font-weight:700;letter-spacing:0.05em;">QUOTE ${quoteNumber}</p>
                  <p style="color:rgba(255,255,255,0.7);margin:2px 0 0;font-size:12px;">
                    ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </td>
              </tr>
              ${draftOrderSection}
              <tr>
                <td style="padding:32px 40px 0;">
                  <h2 style="color:#111;font-size:13px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">Customer</h2>
                  <p style="font-size:14px;color:#333;margin:0 0 4px;"><strong>${data.customer.name}</strong></p>
                  <p style="font-size:14px;margin:0;">
                    <a href="mailto:${data.customer.email}" style="color:#2b7fff;">${data.customer.email}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 40px 0;">
                  <h2 style="color:#111;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Ship To</h2>
                  <p style="color:#555;font-size:14px;margin:0;line-height:1.6;">
                    ${data.shipping.address}<br>
                    ${data.shipping.city}, ${data.shipping.state} ${data.shipping.zip}<br>
                    ${data.shipping.country}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 40px 0;">
                  <h2 style="color:#111;font-size:13px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">
                    Products (${totalItems} items)
                  </h2>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <th style="text-align:left;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;">Product</th>
                      <th style="text-align:center;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;">Qty</th>
                      <th style="text-align:right;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:8px;">List Price</th>
                    </tr>
                    ${itemsHtml}
                  </table>
                </td>
              </tr>
              ${data.notes ? `
              <tr>
                <td style="padding:24px 40px 0;">
                  <h2 style="color:#111;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Notes</h2>
                  <div style="background:#f8f7f4;border-left:3px solid #2b7fff;padding:16px;border-radius:0 8px 8px 0;">
                    <p style="color:#555;font-size:14px;margin:0;line-height:1.6;">${data.notes}</p>
                  </div>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:32px 40px;border-top:1px solid #eeebe6;margin-top:24px;">
                  <p style="color:#999;font-size:12px;margin:0;text-align:center;">
                    Reply to this email to respond to the customer at ${data.customer.email}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = quoteSchema.parse(body);
    const quoteNumber = generateQuoteNumber();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.error('ADMIN_EMAIL not set');
      return NextResponse.json({ error: 'Quote system not configured.' }, { status: 500 });
    }

    // ── Step 1: Create Draft Order in Shopify ────────────────────────────────
    let draftOrder = null;
    const hasAdminAccess =
      process.env.SHOPIFY_ADMIN_CLIENT_ID ||
      process.env.SHOPIFY_ADMIN_CLIENT_SECRET ||
      process.env.SHOPIFY_ADMIN_TOKEN;

    if (hasAdminAccess) {
      const customerId = (session.user as any).id;
      draftOrder = await createShopifyDraftOrder(data, quoteNumber, customerId);

      if (!draftOrder) {
        return NextResponse.json(
          { error: 'Failed to create quote in our system. Please try again or contact support.' },
          { status: 500 }
        );
      }
    } else {
      console.log('⚠️ No Admin token configured — quote logged to console only');
      console.log('Quote:', quoteNumber, '| Customer:', data.customer);
    }

    // ── Step 2: Send email notification (non-fatal) ───────────────────────────
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const emailHtml = buildEmailHtml(data, quoteNumber, draftOrder);
        const { sendEmail } = await import('@/lib/email');
        await sendEmail({
          to: adminEmail,
          subject: `[${quoteNumber}] Quote Request from ${data.customer.name}`,
          html: emailHtml,
          replyTo: data.customer.email,
        });
        console.log(`✅ Quote email sent to ${adminEmail}`);
      } catch (emailError) {
        console.error('⚠️ Email failed (Draft Order still created in Shopify):', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      quoteNumber,
      draftOrderName: draftOrder?.name ?? null,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Quote error:', error);
    return NextResponse.json({ error: 'Failed to submit quote.' }, { status: 500 });
  }
}
