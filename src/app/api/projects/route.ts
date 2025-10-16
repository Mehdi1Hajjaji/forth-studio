import { NextResponse } from "next/server";
import { fetchProjectSummaries } from "@/lib/data";

export async function GET() {
  const projects = await fetchProjectSummaries();

  return NextResponse.json({
    data: projects,
    meta: { total: projects.length },
  });
}
export const dynamic = 'force-dynamic';
