import { NextResponse } from 'next/server';
import { getDockerStatus } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';
import type { DockerStatus } from '@/lib/types/docker';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<ApiResponse<DockerStatus>>> {
  try {
    const status = await getDockerStatus();

    return NextResponse.json({
      success: true,
      data: status,
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
