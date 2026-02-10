import { NextRequest, NextResponse } from 'next/server';
import { getContainerStats } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';
import type { ContainerStats } from '@/lib/types/docker';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ContainerStats>>> {
  try {
    const { id } = await params;
    const stats = await getContainerStats(id);

    if (!stats) {
      return NextResponse.json(
        {
          success: false,
          error: 'Container not found or stats unavailable',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stats,
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
