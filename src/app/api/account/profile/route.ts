import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseUpdateProfile } from "@/lib/validators";
import { Role } from "@prisma/client";

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function PATCH(request: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return jsonError("Authentication required.", 401);
  }

  let input;
  try {
    input = parseUpdateProfile(await request.json());
  } catch (error) {
    return jsonError("Invalid profile update payload.", 422, (error as any)?.errors ?? error);
  }

  const data: Record<string, unknown> = {};
  if (input.role) {
    const roleMap: Record<string, Role> = {
      student: Role.STUDENT,
      mentor: Role.MENTOR,
      investor: Role.INVESTOR,
    };
    data.role = roleMap[input.role];
  }
  if (Object.prototype.hasOwnProperty.call(input, "universityId")) {
    data.universityId = input.universityId ?? null;
  }

  if (Object.keys(data).length === 0) {
    return jsonError("No changes provided.", 400);
  }

  const user = await prisma.user.update({
    where: { id: sessionUser.id },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      universityId: true,
    },
  });

  return NextResponse.json({ data: user });
}
