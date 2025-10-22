import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseRequestReset } from "@/lib/validators";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(request: Request) {
  let input;
  try {
    input = parseRequestReset(await request.json());
  } catch (error) {
    return jsonError("Invalid request.", 422, (error as any)?.errors ?? error);
  }

  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });

  // Always respond 200 to avoid account enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Clean previous tokens for this identifier
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/reset?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendPasswordResetEmail({ email, resetUrl });
  } catch (error) {
    console.error("Password reset email error", error);
    return jsonError("We couldn't send the reset email. Try again shortly.", 503);
  }

  return NextResponse.json({ ok: true });
}
