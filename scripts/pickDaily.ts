import prisma from "../src/lib/prisma";

async function main() {
  const totalProblems = await prisma.problem.count();
  if (totalProblems === 0) {
    console.warn("No problems available to pick from.");
    return;
  }

  const randomIndex = Math.floor(Math.random() * totalProblems);
  const problem = await prisma.problem.findFirst({
    skip: randomIndex,
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true },
  });

  if (!problem) {
    console.warn("Could not resolve a problem for today's pick.");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyPick.upsert({
    where: { date: today },
    update: { problemId: problem.id },
    create: { date: today, problemId: problem.id },
  });

  console.log(`Daily problem selected: ${problem.slug}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
