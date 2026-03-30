import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getShopifyStoreDomain } from '@/lib/shopify/env';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    // Use Shopify's native contact form endpoint
    // This emails you automatically using your store's email settings — no SMTP needed
    const shopifyContactUrl = `https://${getShopifyStoreDomain()}/contact`;

    const formBody = new URLSearchParams({
      'form_type': 'contact',
      'utf8': '✓',
      'contact[name]': data.name,
      'contact[email]': data.email,
      'contact[body]': [
        data.company ? `Company: ${data.company}` : '',
        `Subject: ${data.subject}`,
        '',
        data.message,
      ].filter(Boolean).join('\n'),
    });

    const shopifyRes = await fetch(shopifyContactUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formBody.toString(),
    });

    // Shopify returns 200 or 302 on success
    if (!shopifyRes.ok && shopifyRes.status !== 302) {
      console.error('Shopify contact form error:', shopifyRes.status);

      // Fallback: try nodemailer if configured
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const { sendEmail } = await import('@/lib/email');
          await sendEmail({
            to: process.env.ADMIN_EMAIL!,
            subject: `[Contact] ${data.subject} — ${data.name}`,
            html: `
              <p><strong>From:</strong> ${data.name} (${data.email})</p>
              ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${data.message.replace(/\n/g, '<br>')}</p>
            `,
            replyTo: data.email,
          });
        } catch (emailError) {
          console.error('Fallback email also failed:', emailError);
        }
      } else {
        // Last resort: log to console
        console.log('=== CONTACT FORM SUBMISSION ===');
        console.log('From:', data.name, `<${data.email}>`);
        if (data.company) console.log('Company:', data.company);
        console.log('Subject:', data.subject);
        console.log('Message:', data.message);
        console.log('==============================');
      }
    }

    // Always return success to the user
    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Contact error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
