import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseUpdatePassword } from "@/lib/validators";
import { compare, hash } from "bcryptjs";

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(request: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return jsonError("Authentication required.", 401);
  }

  let input;
  try {
    input = parseUpdatePassword(await request.json());
  } catch (error) {
    return jsonError("Invalid password update payload.", 422, (error as any)?.errors ?? error);
  }

  if (input.currentPassword === input.newPassword) {
    return jsonError("New password must be different from the current password.", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) {
    return jsonError("User not found.", 404);
  }

  const matches = await compare(input.currentPassword, user.hashedPassword);
  if (!matches) {
    return jsonError("Current password is incorrect.", 403);
  }

  const passwordHash = await hash(input.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { hashedPassword: passwordHash } });

  return NextResponse.json({ ok: true });
}

