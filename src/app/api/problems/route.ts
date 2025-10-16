import { NextResponse } from "next/server";
import { fetchProblemList } from "@/lib/data";

export async function GET() {
  try {
    const problems = await fetchProblemList();
    return NextResponse.json({
      data: problems,
      meta: {
        total: problems.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'DB_UNAVAILABLE', message: err?.message ?? 'unavailable' },
      { status: 503 },
    );
  }
}
export const dynamic = 'force-dynamic';
