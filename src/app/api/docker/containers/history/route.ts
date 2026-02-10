import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { containerMetrics } from '@/db/schema';
import { desc, gte, eq, and } from 'drizzle-orm';
import { HistoryQuerySchema, type ApiResponse } from '@/lib/schemas';
import type { ContainerMetric } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ContainerMetric[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;

    const queryResult = HistoryQuerySchema.safeParse({
      hours: searchParams.get('hours'),
      limit: searchParams.get('limit'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: queryResult.error.issues.map((e) => e.message).join(', '),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { hours, limit } = queryResult.data;
    const containerId = searchParams.get('containerId');
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const whereClause = containerId
      ? and(gte(containerMetrics.timestamp, since), eq(containerMetrics.containerId, containerId))
      : gte(containerMetrics.timestamp, since);

    const metrics = await db
      .select()
      .from(containerMetrics)
      .where(whereClause)
      .orderBy(desc(containerMetrics.timestamp))
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
