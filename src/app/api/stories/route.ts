import { NextResponse, type NextRequest } from "next/server";
import { fetchStorySummaries } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? undefined;
  const university = searchParams.get("university") ?? undefined;
  const tags = searchParams.getAll("tag").filter(Boolean);
  const takeParam = searchParams.get("take");
  const take = takeParam ? Number.parseInt(takeParam, 10) : undefined;

  const stories = await fetchStorySummaries({
    search: query,
    universitySlug: university,
    tags: tags.length ? tags : undefined,
    take,
  });

  return NextResponse.json({
    data: stories,
    meta: { total: stories.length },
  });
}
