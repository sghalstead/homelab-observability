import { NextRequest, NextResponse } from 'next/server';
import { restartService, isAllowedService } from '@/lib/clients/systemd';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<ApiResponse<{ restarted: boolean }>>> {
  try {
    const { name } = await params;

    if (!isAllowedService(name)) {
      return NextResponse.json(
        {
          success: false,
          error: `Service '${name}' is not in the allowed services list`,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    const result = await restartService(name);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to restart service',
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
