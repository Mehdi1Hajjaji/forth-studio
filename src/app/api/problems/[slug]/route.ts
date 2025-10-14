import { NextResponse } from "next/server";
import { fetchProblemDetail } from "@/lib/data";

type Params = {
  params: { slug: string };
};

export async function GET({ params }: Params) {
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
