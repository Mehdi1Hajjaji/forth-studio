import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseVoteInput, type VoteInput } from "@/lib/validators";
import { ZodError } from "zod";

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get("storyId");
  const projectId = searchParams.get("projectId");
  const submissionId = searchParams.get("submissionId");
  const userId = searchParams.get("userId");

  const targets = [storyId, projectId, submissionId].filter(Boolean);
  if (targets.length !== 1) {
    return jsonError("Specify exactly one target to retrieve votes.");
  }

  const targetWhere = buildTargetFilter({
    storyId: storyId ?? undefined,
    projectId: projectId ?? undefined,
    submissionId: submissionId ?? undefined,
  });

  const [totals, existingVote] = await Promise.all([
    computeVoteTotals(targetWhere),
    userId
      ? prisma.vote.findFirst({
          where: { userId, ...targetWhere },
        })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({
    data: {
      totals,
      userVote: existingVote ? existingVote.value : null,
    },
  });
}

export async function POST(request: NextRequest) {
  let input: VoteInput;
  try {
    const payload = await request.json();
    input = parseVoteInput(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid vote payload.", 422, error.flatten());
    }
    return jsonError("Malformed JSON body.");
  }

  const sessionUser = await getCurrentUser();
  const userId = input.userId ?? sessionUser?.id ?? null;

  if (!userId) {
    return jsonError("Authentication required.", 401);
  }

  if (input.userId && sessionUser?.id && input.userId !== sessionUser.id) {
    return jsonError("You cannot vote on behalf of another user.", 403);
  }

  const [user, targetExists] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    resolveTargetExists(input),
  ]);

  if (!user) {
    return jsonError("User not found.", 404);
  }
  if (!targetExists) {
    return jsonError("Target resource not found.", 404);
  }

  const targetFilter = buildTargetFilter(input);

  try {
    const existing = await prisma.vote.findFirst({
      where: { userId, ...targetFilter },
    });

    if (input.value === 0) {
      if (existing) {
        await prisma.vote.delete({ where: { id: existing.id } });
      }
      const totals = await computeVoteTotals(targetFilter);
      return NextResponse.json({
        data: null,
        meta: { totals },
      });
    }

    const vote = existing
      ? await prisma.vote.update({
          where: { id: existing.id },
          data: { value: input.value },
        })
      : await prisma.vote.create({
          data: {
            userId,
            value: input.value,
            storyId: input.storyId,
            projectId: input.projectId,
            submissionId: input.submissionId,
          },
        });

    const totals = await computeVoteTotals(targetFilter);

    return NextResponse.json({
      data: {
        vote,
        totals,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError(error.message, 400);
    }
    throw error;
  }
}

function buildTargetFilter({
  storyId,
  projectId,
  submissionId,
}: {
  storyId?: string;
  projectId?: string;
  submissionId?: string;
}) {
  if (storyId) {
    return { storyId };
  }
  if (projectId) {
    return { projectId };
  }
  if (submissionId) {
    return { submissionId };
  }
  throw new Error("Missing vote target.");
}

async function computeVoteTotals(
  targetWhere: Prisma.VoteWhereInput,
) {
  const [upvotes, downvotes] = await Promise.all([
    prisma.vote.count({
      where: { ...targetWhere, value: { gt: 0 } },
    }),
    prisma.vote.count({
      where: { ...targetWhere, value: { lt: 0 } },
    }),
  ]);

  return {
    upvotes,
    downvotes,
    score: upvotes - downvotes,
  };
}

async function resolveTargetExists(input: VoteInput) {
  if (input.storyId) {
    return Boolean(
      await prisma.story.findUnique({ where: { id: input.storyId } }),
    );
  }
  if (input.projectId) {
    return Boolean(
      await prisma.project.findUnique({ where: { id: input.projectId } }),
    );
  }
  if (input.submissionId) {
    return Boolean(
      await prisma.submission.findUnique({
        where: { id: input.submissionId },
      }),
    );
  }
  return false;
}
