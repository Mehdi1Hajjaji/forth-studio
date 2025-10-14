import { NextResponse } from "next/server";

type Params = {
  params: { id: string };
};

export function GET({ params }: Params) {
  return NextResponse.json({
    data: null,
    message: `Submission ${params.id} is pending storage integration.`,
  });
}
