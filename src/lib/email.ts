import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL ?? "no-reply@forth.studio";

const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendPasswordResetEmail({
  email,
  resetUrl,
}: {
  email: string;
  resetUrl: string;
}) {
  if (!resendClient) {
    throw new Error("Email service is not configured (missing RESEND_API_KEY).");
  }

  try {
    await resendClient.emails.send({
      from: resendFrom,
      to: email,
      subject: "Reset your forth.studio password",
      text: `You requested a password reset. Click the link below to choose a new password.\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password on <strong>forth.studio</strong>.</p>
        <p><a href="${resetUrl}">Click here to set a new password</a>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Thanks,<br/>forth.studio team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send reset email via Resend", error);
    throw new Error("Email delivery failed. Try again later.");
  }
}
