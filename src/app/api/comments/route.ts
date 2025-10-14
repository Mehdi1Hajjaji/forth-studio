import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseCommentInput, type CommentInput } from "@/lib/validators";
import { ZodError } from "zod";

const DEFAULT_LIMIT = 50;

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get("storyId");
  const projectId = searchParams.get("projectId");
  const submissionId = searchParams.get("submissionId");
  const limit = Number.parseInt(searchParams.get("limit") ?? "", 10);

  const filters = [storyId, projectId, submissionId].filter(Boolean);
  if (filters.length > 1) {
    return jsonError("Specify at most one target when listing comments.");
  }

  const where = storyId
    ? { storyId }
    : projectId
      ? { projectId }
      : submissionId
        ? { submissionId }
        : {};

  const comments = await prisma.comment.findMany({
    where,
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
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : DEFAULT_LIMIT,
  });

  return NextResponse.json({
    data: comments,
    meta: {
      total: comments.length,
    },
  });
}

export async function POST(request: NextRequest) {
  let input;
  try {
    const payload = await request.json();
    input = parseCommentInput(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid comment payload.", 422, error.flatten());
    }
    return jsonError("Malformed JSON body.");
  }

  const sessionUser = await getCurrentUser();
  const authorId = input.authorId ?? sessionUser?.id ?? null;

  if (!authorId) {
    return jsonError("Authentication required.", 401);
  }

  if (input.authorId && sessionUser?.id && input.authorId !== sessionUser.id) {
    return jsonError("You cannot submit comments for another user.", 403);
  }

  const [user, targetExists] = await Promise.all([
    prisma.user.findUnique({ where: { id: authorId } }),
    resolveTargetExists(input),
  ]);

  if (!user) {
    return jsonError("Author not found.", 404);
  }
  if (!targetExists) {
    return jsonError("Target resource not found.", 404);
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        authorId,
        body: input.body,
        storyId: input.storyId,
        projectId: input.projectId,
        submissionId: input.submissionId,
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

    return NextResponse.json(
      { data: comment },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError(error.message, 400);
    }
    throw error;
  }
}

async function resolveTargetExists(input: CommentInput) {
  if (input.storyId) {
    const story = await prisma.story.findUnique({ where: { id: input.storyId } });
    return Boolean(story);
  }
  if (input.projectId) {
    const project = await prisma.project.findUnique({ where: { id: input.projectId } });
    return Boolean(project);
  }
  if (input.submissionId) {
    const submission = await prisma.submission.findUnique({ where: { id: input.submissionId } });
    return Boolean(submission);
  }
  return false;
}
