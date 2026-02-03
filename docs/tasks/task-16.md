# Task-16: Create API Routes for Ollama Status and Models

**Phase:** PHASE 4 - AI Workload Monitoring
**Status:** Complete
**Dependencies:** Task-15

---

## Objective

Create Next.js API routes to expose Ollama server status, available models, and running inference information.

---

## Definition of Done

- [x] GET /api/ollama/status endpoint created
- [x] GET /api/ollama/models endpoint created
- [x] GET /api/ollama/running endpoint created
- [x] Graceful handling when Ollama unavailable
- [x] API tests written

---

## Implementation Details

### Step 1: Create Status Endpoint

Create `src/app/api/ollama/status/route.ts`:

```typescript
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
```

### Step 2: Create Models Endpoint

Create `src/app/api/ollama/models/route.ts`:

```typescript
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
```

### Step 3: Create Running Models Endpoint

Create `src/app/api/ollama/running/route.ts`:

```typescript
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
```

---

## Files Created/Modified

- `src/app/api/ollama/status/route.ts`
- `src/app/api/ollama/models/route.ts`
- `src/app/api/ollama/running/route.ts`

---

## API Documentation

### GET /api/ollama/status
Returns complete Ollama status including availability, version, models, and running inferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "version": "0.1.17",
    "models": [...],
    "running": [...]
  }
}
```

### GET /api/ollama/models
Returns list of locally available models.

### GET /api/ollama/running
Returns list of currently loaded/running models.

---

## Validation Steps

1. Run `npm run dev`
2. Test with Ollama running: `curl http://localhost:3000/api/ollama/status`
3. Test without Ollama: Stop Ollama and verify graceful response

---

## Commit Message

```
[claude] Task-16: Create API routes for Ollama

- Added GET /api/ollama/status for server status
- Added GET /api/ollama/models for model listing
- Added GET /api/ollama/running for active inferences
- Implemented graceful handling when unavailable
```
