import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseResetPassword } from "@/lib/validators";
import { hash } from "bcryptjs";

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(request: Request) {
  let input;
  try {
    input = parseResetPassword(await request.json());
  } catch (error) {
    return jsonError("Invalid request.", 422, (error as any)?.errors ?? error);
  }

  const { email, token, newPassword } = input;
  const record = await prisma.verificationToken.findUnique({ where: { token }, select: { identifier: true, token: true, expires: true } });

  if (!record || record.identifier.toLowerCase() !== email.toLowerCase() || record.expires < new Date()) {
    return jsonError("Invalid or expired token.", 400);
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return jsonError("User not found.", 404);
  }

  const passwordHash = await hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { hashedPassword: passwordHash } });
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.json({ ok: true });
}

