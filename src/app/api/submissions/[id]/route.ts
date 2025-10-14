import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({
    data: null,
    message: `Submission ${params.id} is pending storage integration.`,
  });
}
