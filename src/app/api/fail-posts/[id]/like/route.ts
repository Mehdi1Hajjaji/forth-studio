import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return jsonError("Authentication required.", 401);
  }

  const failPostId = params.id;
  if (!failPostId) {
    return jsonError("Fail post id is required.", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.failPostLike.findUnique({
      where: { userId_failPostId: { userId: sessionUser.id, failPostId } },
    });

    if (existing) {
      await tx.failPostLike.delete({
        where: { userId_failPostId: { userId: sessionUser.id, failPostId } },
      });
      const post = await tx.failPost.update({
        where: { id: failPostId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true, commentsCount: true },
      });
      return { liked: false, post };
    }

    await tx.failPostLike.create({
      data: { userId: sessionUser.id, failPostId },
    });
    const post = await tx.failPost.update({
      where: { id: failPostId },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true, commentsCount: true },
    });
    return { liked: true, post };
  });

  return NextResponse.json({
    data: {
      liked: result.liked,
      likesCount: result.post.likesCount,
      commentsCount: result.post.commentsCount,
      engagementScore: result.post.likesCount + result.post.commentsCount * 2,
    },
  });
}

