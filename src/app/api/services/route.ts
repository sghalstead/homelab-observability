import { NextResponse } from 'next/server';
import { listServices, getSystemdStatus } from '@/lib/clients/systemd';
import type { ApiResponse } from '@/lib/types/api';
import type { ServiceInfo, SystemdStatus } from '@/lib/types/systemd';

export const dynamic = 'force-dynamic';

interface ServicesResponse {
  systemd: SystemdStatus;
  services: ServiceInfo[];
}

export async function GET(): Promise<NextResponse<ApiResponse<ServicesResponse>>> {
  try {
    const [systemdStatus, services] = await Promise.all([getSystemdStatus(), listServices()]);

    return NextResponse.json({
      success: true,
      data: {
        systemd: systemdStatus,
        services,
      },
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
