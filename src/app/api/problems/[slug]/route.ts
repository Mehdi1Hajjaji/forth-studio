import { type NextRequest, NextResponse } from "next/server";
import { fetchProblemDetail } from "@/lib/data";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const detail = await fetchProblemDetail(params.slug);

  if (!detail) {
    return NextResponse.json(
      { error: "Problem not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: { problem: detail.problem, tags: detail.tags, sample: detail.sample },
    meta: { generatedAt: new Date().toISOString() },
  });
}
