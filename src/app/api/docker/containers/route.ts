import { NextRequest, NextResponse } from 'next/server';
import { listContainers } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';
import type { ContainerInfo } from '@/lib/types/docker';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ContainerInfo[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get('all') !== 'false';

    const containers = await listContainers(all);

    return NextResponse.json({
      success: true,
      data: containers,
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
