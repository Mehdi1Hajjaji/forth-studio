import { NextResponse } from "next/server";
import { fetchProblemList } from "@/lib/data";

export async function GET() {
  const problems = await fetchProblemList();

  return NextResponse.json({
    data: problems,
    meta: {
      total: problems.length,
      generatedAt: new Date().toISOString(),
    },
  });
}
