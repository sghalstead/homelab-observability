import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { systemMetrics } from '@/db/schema';
import { desc, gte } from 'drizzle-orm';
import type { ApiResponse } from '@/lib/types/api';
import type { SystemMetric } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<SystemMetric[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000', 10), 5000);

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const metrics = await db
      .select()
      .from(systemMetrics)
      .where(gte(systemMetrics.timestamp, since))
      .orderBy(desc(systemMetrics.timestamp))
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
