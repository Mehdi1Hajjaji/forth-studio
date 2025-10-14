import { Prisma, SubmissionStatus } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { evaluateWithJudge0 } from "@/lib/judge0";
import { parseSubmissionInput, type SubmissionInput } from "@/lib/validators";
import { getCurrentUser } from "@/lib/auth";
import { ZodError } from "zod";

const DEFAULT_LIMIT = 25;

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const problemSlug = searchParams.get("problemSlug");
  const limit = Number.parseInt(searchParams.get("limit") ?? "", 10);

  const where: Prisma.SubmissionWhereInput = {};
  if (userId) {
    where.userId = userId;
  }
  if (problemSlug) {
    where.problem = { slug: problemSlug };
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      problem: {
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : DEFAULT_LIMIT,
  });

  return NextResponse.json({
    data: submissions,
    meta: {
      total: submissions.length,
    },
  });
}

export async function POST(request: NextRequest) {
  let input: SubmissionInput;
  try {
    const payload = await request.json();
    input = parseSubmissionInput(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid submission payload.", 422, error.flatten());
    }
    return jsonError("Malformed JSON body.");
  }

  const sessionUser = await getCurrentUser();
  const userId = input.userId ?? sessionUser?.id ?? null;

  if (!userId) {
    return jsonError("Authentication required.", 401);
  }

  if (input.userId && sessionUser?.id && input.userId !== sessionUser.id) {
    return jsonError("You cannot submit solutions for another user.", 403);
  }

  const [user, problem] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.problem.findUnique({
      where: { slug: input.problemSlug },
      include: {
        testcases: { where: { isSample: true }, take: 1 },
      },
    }),
  ]);

  if (!user) {
    return jsonError("User not found.", 404);
  }

  if (!problem) {
    return jsonError("Problem not found.", 404);
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        language: input.language,
        code: input.code,
        status: SubmissionStatus.QUEUED,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        problem: {
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    const sample = problem.testcases[0];
    let evaluation: Awaited<
      ReturnType<typeof evaluateWithJudge0>
    > = null;

    try {
      evaluation = await evaluateWithJudge0({
        language: input.language,
        source: input.code,
        stdin: sample?.input,
        expectedOutput: sample?.output,
      });
    } catch (error) {
      console.error("Judge0 evaluation failed:", error);
    }

    if (evaluation) {
      const data: Prisma.SubmissionUpdateInput = {
        status:
          evaluation.status === "COMPLETED"
            ? SubmissionStatus.PASSED
            : evaluation.status === "FAILED"
              ? SubmissionStatus.FAILED
              : SubmissionStatus.RUNNING,
        runtimeMs =
          typeof evaluation.time === "number"
            ? Math.round(evaluation.time * 1000)
            : null,
        memoryKb =
          typeof evaluation.memory === "number" ? evaluation.memory : null,
        score: evaluation.status === "COMPLETED" ? 1 : 0,
      };

      await prisma.submission.update({
        where: { id: submission.id },
        data,
      });
    }

    const latest = await prisma.submission.findUnique({
      where: { id: submission.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        problem: {
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    return NextResponse.json(
      { data: latest, meta: { evaluation } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError(error.message, 400);
    }
    throw error;
  }
}
