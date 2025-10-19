import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || '';

const resend = new Resend(RESEND_API_KEY);

// Requiere al menos uno: text o html
export type SendEmailOptions = (
  { to: string | string[]; subject: string; from?: string; text: string; html?: string }
  | { to: string | string[]; subject: string; from?: string; html: string; text?: string }
);

export async function sendEmail(options: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    return { ok: false, status: 400, error: 'resend_not_configured' };
  }

  const from = options.from || RESEND_FROM;
  if (!from) {
    return { ok: false, status: 400, error: 'resend_from_missing' };
  }

  try {
    const payload: any = {
      from,
      to: options.to,
      subject: options.subject,
    };
    if (typeof (options as any).text === 'string') payload.text = (options as any).text;
    if (typeof (options as any).html === 'string') payload.html = (options as any).html;

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error('resend_send_error', error);
      return { ok: false, status: 400, error } as any;
    }

    return { ok: true, status: 200, data } as any;
  } catch (err) {
    console.error('resend_sdk_failed', err);
    return { ok: false, status: 500, error: 'resend_sdk_failed' };
  }
}