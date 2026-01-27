import { NextRequest, NextResponse } from 'next/server';
import { getServiceDetails } from '@/lib/clients/systemd';
import type { ApiResponse } from '@/lib/types/api';
import type { ServiceDetails } from '@/lib/types/systemd';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<ApiResponse<ServiceDetails>>> {
  try {
    const { name } = await params;
    const service = await getServiceDetails(name);

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: `Service '${name}' not found`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
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
