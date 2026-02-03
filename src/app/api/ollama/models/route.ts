import { NextResponse } from 'next/server';
import { listOllamaModels, isOllamaAvailable } from '@/lib/clients/ollama';
import type { ApiResponse } from '@/lib/types/api';
import type { OllamaModel } from '@/lib/types/ollama';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<ApiResponse<OllamaModel[]>>> {
  try {
    const available = await isOllamaAvailable();

    if (!available) {
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });
    }

    const models = await listOllamaModels();

    return NextResponse.json({
      success: true,
      data: models,
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
