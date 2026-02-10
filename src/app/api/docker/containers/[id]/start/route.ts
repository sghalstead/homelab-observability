import { NextRequest, NextResponse } from 'next/server';
import { startContainer } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ started: boolean }>>> {
  try {
    const { id } = await params;
    const success = await startContainer(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to start container',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { started: true },
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
