import { NextResponse } from "next/server";
import { fetchProjectSummaries } from "@/lib/data";

export async function GET() {
  try {
    const projects = await fetchProjectSummaries();
    return NextResponse.json({
      data: projects,
      meta: { total: projects.length },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'DB_UNAVAILABLE', message: err?.message ?? 'unavailable' },
      { status: 503 },
    );
  }
}
export const dynamic = 'force-dynamic';
