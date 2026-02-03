import { NextResponse } from 'next/server';
import { getOllamaStatus } from '@/lib/clients/ollama';
import type { ApiResponse } from '@/lib/types/api';
import type { OllamaStatus } from '@/lib/types/ollama';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<ApiResponse<OllamaStatus>>> {
  try {
    const status = await getOllamaStatus();

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
