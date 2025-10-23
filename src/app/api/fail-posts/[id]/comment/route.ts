import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseFailPostComment } from "@/lib/validators";

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

  let input;
  try {
    input = parseFailPostComment(await request.json());
  } catch (error) {
    return jsonError("Invalid comment payload.", 422, (error as any)?.errors ?? error);
  }

  const prismaAny = prisma as any;
  const comment = await prismaAny.$transaction(async (tx: any) => {
    const created = await tx.failPostComment.create({
      data: {
        failPostId,
        authorId: sessionUser.id,
        body: input.body,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const post = await tx.failPost.update({
      where: { id: failPostId },
      data: { commentsCount: { increment: 1 } },
      select: { likesCount: true, commentsCount: true },
    });

    return {
      created,
      engagementScore: post.likesCount + post.commentsCount * 2,
      commentsCount: post.commentsCount,
    };
  });

  return NextResponse.json({
    data: {
      comment: comment.created,
      commentsCount: comment.commentsCount,
      engagementScore: comment.engagementScore,
    },
  });
}
