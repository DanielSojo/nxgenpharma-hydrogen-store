import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const name = escapeHtml(data.name);
    const email = escapeHtml(data.email);
    const company = data.company ? escapeHtml(data.company) : '';
    const subject = escapeHtml(data.subject);
    const message = escapeHtml(data.message).replace(/\n/g, '<br>');

    await sendEmail({
      to: process.env.ADMIN_EMAIL ?? process.env.EMAIL_USER!,
      subject: `[Contact] ${data.subject} — ${data.name}`,
      html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      replyTo: data.email,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Contact error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please email us directly at support@nxgenpharma.com.' },
      { status: 500 },
    );
  }
}
