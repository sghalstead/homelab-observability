import { NextResponse } from 'next/server';
import { collectSystemMetrics } from '@/lib/collectors/system';
import type { ApiResponse } from '@/lib/types/api';
import type { SystemMetricsSnapshot } from '@/lib/types/metrics';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<ApiResponse<SystemMetricsSnapshot>>> {
  try {
    const metrics = await collectSystemMetrics();

    if (!metrics.collected) {
      return NextResponse.json(
        {
          success: false,
          error: metrics.error || 'Failed to collect metrics',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

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
