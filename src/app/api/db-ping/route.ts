export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple connectivity check
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    return NextResponse.json({ status: 'ok', result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'unknown error' },
      { status: 503 },
    );
  }
}

