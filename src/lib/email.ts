import nodemailer from 'nodemailer';

// Create transporter based on env config
function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT ?? '587');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error('Email configuration missing. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env.local');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: { user, pass },
  });
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"NxGen Pharma" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    replyTo: replyTo ?? process.env.EMAIL_USER,
  });
}
