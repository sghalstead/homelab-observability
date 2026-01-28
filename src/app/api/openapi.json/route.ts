import { NextResponse } from 'next/server';
import { generateOpenApiSpec } from '@/lib/openapi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const spec = generateOpenApiSpec();
    return NextResponse.json(spec);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate OpenAPI spec',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
