import { Resend } from "resend";
import twilio from "twilio";

export function getDefaultFromEmail() {
  return process.env.MESSAGING_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "hello@adminpaneling.com";
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function isSmsConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
}

export async function sendEmailMessage(input: { to: string; subject: string; body: string }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Email is not configured yet. Add RESEND_API_KEY.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: getDefaultFromEmail(),
    to: input.to,
    subject: input.subject,
    text: input.body,
  });

  return {
    providerId: result.data?.id ?? null,
    from: getDefaultFromEmail(),
  };
}

export async function sendSmsMessage(input: { to: string; body: string }) {
  if (!isSmsConfigured()) {
    throw new Error("SMS is not configured yet. Add Twilio credentials.");
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const result = await client.messages.create({
    to: input.to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: input.body,
  });

  return {
    providerId: result.sid,
    from: result.from ?? process.env.TWILIO_PHONE_NUMBER ?? null,
  };
}
