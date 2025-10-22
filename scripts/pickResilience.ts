import prisma from "../src/lib/prisma";

const client = prisma as any;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

async function main() {
  const now = new Date();
  const periodEnd = startOfDay(now);
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - 7);

  const existing = await client.resilienceAward?.findUnique({
    where: {
      periodStart_periodEnd: {
        periodStart,
        periodEnd,
      },
    },
  });

  if (existing) {
    console.log("Resilience badge already awarded for this period.");
    return;
  }

  const failPostDelegate = client.failPost ?? (prisma as any).failPost;
  if (!failPostDelegate) {
    throw new Error("FailPost delegate is unavailable on this Prisma client.");
  }

  const posts = (await failPostDelegate.findMany({
    where: {
      createdAt: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    select: {
      id: true,
      userId: true,
      likesCount: true,
      commentsCount: true,
      projectAttempt: true,
    },
  })) as Array<{
    id: string;
    userId: string;
    likesCount: number;
    commentsCount: number;
    projectAttempt: string;
  }>;

  if (!posts.length) {
    console.log("No fail posts to evaluate for this period.");
    return;
  }

  const withScores = posts
    .map((post) => ({
      ...post,
      score: post.likesCount + post.commentsCount * 2,
    }))
    .sort((a, b) => {
      if (b.score === a.score) {
        return a.id.localeCompare(b.id);
      }
      return b.score - a.score;
    });

  const winner = withScores[0];

  if (winner.score <= 0) {
    console.log("No engagement recorded yet – skipping badge assignment.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    const delegate = (tx as any).resilienceAward;
    if (!delegate) {
      throw new Error("ResilienceAward delegate is unavailable on this Prisma client.");
    }

    await delegate.create({
      data: {
        failPostId: winner.id,
        userId: winner.userId,
        engagementScore: winner.score,
        periodStart,
        periodEnd,
      },
    });

    await tx.user.update({
      where: { id: winner.userId },
      data: {
        resilienceBadgeCount: { increment: 1 },
        resilienceBadgeEarnedAt: new Date(),
      },
    });
  });

  console.log(
    `Awarded Resilience Badge to user ${winner.userId} for fail post "${winner.projectAttempt}" with score ${winner.score}.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
