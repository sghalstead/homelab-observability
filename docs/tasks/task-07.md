# Task-07: Create API Routes for System Metrics

**Phase:** PHASE 1 - System Metrics Collection
**Status:** Pending
**Dependencies:** Task-06

---

## Objective

Create Next.js API routes to expose system metrics via REST endpoints.

---

## Definition of Done

- [ ] GET /api/metrics/system endpoint created
- [ ] GET /api/metrics/system/history endpoint created
- [ ] Proper error handling and status codes
- [ ] Response types defined
- [ ] API tests written and passing
- [ ] Documentation for endpoints

---

## Implementation Details

### Step 1: Create API Response Types

Create `src/lib/types/api.ts`:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

### Step 2: Create Current Metrics Endpoint

Create `src/app/api/metrics/system/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { collectSystemMetrics } from '@/lib/collectors/system';
import type { ApiResponse } from '@/lib/types/api';
import type { SystemMetricsSnapshot } from '@/lib/types/metrics';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<ApiResponse<SystemMetricsSnapshot>>> {
  try {
    const metrics = await collectSystemMetrics();

    if (!metrics.collected) {
      return NextResponse.json(
        {
          success: false,
          error: metrics.error || 'Failed to collect metrics',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: metrics,
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

### Step 3: Create Historical Metrics Endpoint

Create `src/app/api/metrics/system/history/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db, systemMetrics } from '@/db';
import { desc, gte } from 'drizzle-orm';
import type { ApiResponse } from '@/lib/types/api';
import type { SystemMetric } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<SystemMetric[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000', 10), 5000);

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const metrics = await db
      .select()
      .from(systemMetrics)
      .where(gte(systemMetrics.timestamp, since))
      .orderBy(desc(systemMetrics.timestamp))
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: metrics,
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

### Step 4: Create API Tests

Create `src/app/api/metrics/system/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock the collector
vi.mock('@/lib/collectors/system', () => ({
  collectSystemMetrics: vi.fn(),
}));

import { collectSystemMetrics } from '@/lib/collectors/system';

describe('GET /api/metrics/system', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns metrics on success', async () => {
    const mockMetrics = {
      timestamp: new Date(),
      cpu: { usage: 25.5, temperature: 45.2 },
      memory: { total: 8000000000, used: 4000000000, percent: 50 },
      disk: { total: 100000000000, used: 50000000000, percent: 50 },
      collected: true,
    };

    vi.mocked(collectSystemMetrics).mockResolvedValue(mockMetrics);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockMetrics);
  });

  it('returns error when collection fails', async () => {
    vi.mocked(collectSystemMetrics).mockResolvedValue({
      timestamp: new Date(),
      cpu: { usage: 0, temperature: null },
      memory: { total: 0, used: 0, percent: 0 },
      disk: { total: 0, used: 0, percent: 0 },
      collected: false,
      error: 'Collection failed',
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Collection failed');
  });
});
```

---

## Files Created/Modified

- `src/lib/types/api.ts` - API response types
- `src/app/api/metrics/system/route.ts` - Current metrics endpoint
- `src/app/api/metrics/system/history/route.ts` - Historical metrics endpoint
- `src/app/api/metrics/system/route.test.ts` - API tests

---

## API Documentation

### GET /api/metrics/system

Returns current system metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-12-30T12:00:00.000Z",
    "cpu": { "usage": 25.5, "temperature": 45.2 },
    "memory": { "total": 8000000000, "used": 4000000000, "percent": 50 },
    "disk": { "total": 100000000000, "used": 50000000000, "percent": 50 },
    "collected": true
  },
  "timestamp": "2025-12-30T12:00:00.000Z"
}
```

### GET /api/metrics/system/history

Returns historical system metrics.

**Query Parameters:**
- `hours` (optional): Number of hours to look back (default: 24)
- `limit` (optional): Maximum records to return (default: 1000, max: 5000)

---

## Validation Steps

1. Run `npm run dev`
2. Test endpoint: `curl http://localhost:3000/api/metrics/system`
3. Verify JSON response with metrics
4. Run `npm run test:run` - API tests should pass

---

## Commit Message

```
[claude] Task-07: Create API routes for system metrics

- Added GET /api/metrics/system for current metrics
- Added GET /api/metrics/system/history for historical data
- Defined API response types
- Added API endpoint tests
```
