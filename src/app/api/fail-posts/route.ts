import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseFailPostInput } from "@/lib/validators";

const DEFAULT_LIMIT = 20;

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(request: NextRequest) {
  const viewer = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "newest";
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : DEFAULT_LIMIT;

  const orderBy =
    sort === "resilient"
      ? [{ likesCount: "desc" as const }, { commentsCount: "desc" as const }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const include: Prisma.FailPostInclude = {
    author: {
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        resilienceBadgeCount: true,
        resilienceBadgeEarnedAt: true,
      },
    },
  };

  if (viewer?.id) {
    include.likes = {
      where: { userId: viewer.id },
      select: { userId: true },
    };
  }

  const posts = await prisma.failPost.findMany({
    include,
    orderBy,
    take: limit,
  });

  const data = posts.map((post) => {
    const { likes, ...rest } = post as typeof post & { likes?: { userId: string }[] };
    return {
      ...rest,
      likedByViewer: Array.isArray(likes) ? likes.length > 0 : false,
      engagementScore: rest.likesCount + rest.commentsCount * 2,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return jsonError("Authentication required.", 401);
  }

  let input;
  try {
    input = parseFailPostInput(await request.json());
  } catch (error) {
    return jsonError("Invalid fail post payload.", 422, (error as any)?.errors ?? error);
  }

  const post = await prisma.failPost.create({
    data: {
      userId: sessionUser.id,
      projectAttempt: input.projectAttempt,
      failureReason: input.failureReason,
      lessonLearned: input.lessonLearned,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          resilienceBadgeCount: true,
          resilienceBadgeEarnedAt: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      data: {
        ...post,
        likedByViewer: false,
        engagementScore: post.likesCount + post.commentsCount * 2,
      },
    },
    { status: 201 },
  );
}
