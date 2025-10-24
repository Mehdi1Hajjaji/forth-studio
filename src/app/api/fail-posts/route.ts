import { NextResponse, type NextRequest } from "next/server";
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

  const include: any = {
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

  const prismaAny = prisma as any;
  try {
    const posts = (await prismaAny.failPost.findMany({
      include,
      orderBy,
      take: limit,
    })) as Array<{
      id: string;
      userId: string;
      projectAttempt: string;
      failureReason: string;
      lessonLearned: string;
      likesCount: number;
      commentsCount: number;
      createdAt: Date;
      updatedAt: Date;
      author: {
        id: string;
        username: string | null;
        name: string | null;
        avatarUrl: string | null;
        resilienceBadgeCount?: number | null;
        resilienceBadgeEarnedAt?: Date | null;
      };
      likes?: { userId: string }[];
    }>;

    const data = posts.map((post) => {
      const { likes, ...rest } = post as typeof post & { likes?: { userId: string }[] };
      return {
        ...rest,
        likedByViewer: Array.isArray(likes) ? likes.length > 0 : false,
        engagementScore: rest.likesCount + rest.commentsCount * 2,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("fail-posts GET error", error);
    return NextResponse.json({ data: [] });
  }
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

  const prismaAny = prisma as any;
  try {
    const post = (await prismaAny.failPost.create({
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
    })) as {
      id: string;
      userId: string;
      projectAttempt: string;
      failureReason: string;
      lessonLearned: string;
      likesCount: number;
      commentsCount: number;
      createdAt: Date;
      updatedAt: Date;
      author: {
        id: string;
        username: string | null;
        name: string | null;
        avatarUrl: string | null;
        resilienceBadgeCount?: number | null;
        resilienceBadgeEarnedAt?: Date | null;
      };
    };

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
  } catch (error) {
    console.error("fail-posts POST error", error);
    return jsonError("Fail Wall is not ready yet. Try again later.", 503, error);
  }
}
