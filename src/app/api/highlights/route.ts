import { SubmissionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const dailyPick = await prisma.dailyPick.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      problem: {
        include: {
          tags: { include: { tag: true } },
          submissions: {
            where: { status: SubmissionStatus.PASSED },
            select: { id: true },
          },
          createdBy: {
            include: { university: true },
          },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    data: {
      algorithmOfDay: dailyPick?.problem ?? null,
    },
    meta: {
      generatedAt: new Date().toISOString(),
    },
  });
}
