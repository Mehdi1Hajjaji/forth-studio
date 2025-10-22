import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseRegisterInput } from "@/lib/validators";
import { hash } from "bcryptjs";
import type { Role } from "@prisma/client";

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

const ROLE_VALUES = {
  student: "STUDENT",
  mentor: "MENTOR",
  investor: "INVESTOR",
  admin: "ADMIN",
} as const;

type RoleKey = keyof typeof ROLE_VALUES;

function toRole(value?: string | null): Role {
  const key = (value ?? "student").toLowerCase() as RoleKey;
  const resolved = ROLE_VALUES[key] ?? ROLE_VALUES.student;
  return resolved as Role;
}

function sanitizeUsername(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30) || "user";
}

async function generateUsername(base: string) {
  const clean = sanitizeUsername(base);
  let candidate = clean;
  let suffix = 0;
  while (true) {
    const username = suffix ? `${candidate}${suffix}` : candidate;
    const exists = await prisma.user.findUnique({ where: { username } });
    if (!exists) return username;
    suffix++;
  }
}

export async function POST(request: Request) {
  let input;
  try {
    input = parseRegisterInput(await request.json());
  } catch (error) {
    return jsonError("Invalid registration data.", 422, (error as any)?.errors ?? error);
  }

  const email = input.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return jsonError("An account with this email already exists.", 409);
  }

  let username = input.username
    ? sanitizeUsername(input.username)
    : await generateUsername(email.split("@")[0]);

  if (input.username) {
    const usernameExists = await prisma.user.findUnique({ where: { username } });
    if (usernameExists) {
      return jsonError("This username is already taken. Choose another one.", 409);
    }
  }

  const passwordHash = await hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      hashedPassword: passwordHash,
      name: input.name,
      role: toRole(input.role ?? undefined),
      universityId: input.universityId ?? null,
    },
    select: { id: true, email: true, username: true, name: true, role: true },
  });

  return NextResponse.json({ data: user }, { status: 201 });
}
