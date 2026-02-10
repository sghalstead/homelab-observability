import { NextRequest, NextResponse } from 'next/server';
import { restartContainer } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ restarted: boolean }>>> {
  try {
    const { id } = await params;
    const success = await restartContainer(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to restart container',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { restarted: true },
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
