import { NextResponse } from 'next/server';
import { getRunningModels, isOllamaAvailable } from '@/lib/clients/ollama';
import type { ApiResponse } from '@/lib/types/api';
import type { OllamaRunningModel } from '@/lib/types/ollama';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<ApiResponse<OllamaRunningModel[]>>> {
  try {
    const available = await isOllamaAvailable();

    if (!available) {
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });
    }

    const running = await getRunningModels();

    return NextResponse.json({
      success: true,
      data: running,
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
