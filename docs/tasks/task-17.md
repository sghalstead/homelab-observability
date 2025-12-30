# Task-17: Add Inference Monitoring and Metrics

**Phase:** PHASE 4 - AI Workload Monitoring
**Status:** Pending
**Dependencies:** Task-16

---

## Objective

Extend Ollama monitoring to track inference metrics and store historical data about model usage.

---

## Definition of Done

- [ ] Ollama metrics collection added to scheduler
- [ ] Ollama metrics saved to database
- [ ] Historical Ollama metrics queryable
- [ ] GET /api/ollama/history endpoint created
- [ ] Tests for Ollama metrics persistence

---

## Implementation Details

### Step 1: Update Metrics Storage Service

Add to `src/lib/services/metrics-storage.ts`:

```typescript
import { db, systemMetrics, containerMetrics, ollamaMetrics } from '@/db';
import { getOllamaStatus } from '@/lib/clients/ollama';
import type { NewOllamaMetric } from '@/db/schema';

// ... existing functions ...

export async function saveOllamaMetrics(): Promise<boolean> {
  try {
    const status = await getOllamaStatus();
    const timestamp = new Date();

    const record: NewOllamaMetric = {
      timestamp,
      running: status.available,
      modelCount: status.models.length,
      activeInferences: status.running.length,
    };

    await db.insert(ollamaMetrics).values(record);
    return true;
  } catch (error) {
    console.error('Failed to save Ollama metrics:', error);
    return false;
  }
}

export async function cleanupOldOllamaMetrics(): Promise<number> {
  try {
    const cutoff = new Date(
      Date.now() - config.metrics.retentionHours * 60 * 60 * 1000
    );

    const result = await db
      .delete(ollamaMetrics)
      .where(lt(ollamaMetrics.timestamp, cutoff));

    return result.changes || 0;
  } catch (error) {
    console.error('Failed to cleanup old Ollama metrics:', error);
    return 0;
  }
}
```

### Step 2: Update Metrics Scheduler

Update `src/lib/services/metrics-scheduler.ts`:

```typescript
import {
  saveSystemMetrics,
  saveContainerMetrics,
  saveOllamaMetrics,
  cleanupOldMetrics,
  cleanupOldContainerMetrics,
  cleanupOldOllamaMetrics,
} from './metrics-storage';

async function collectAllMetrics(): Promise<void> {
  const results = await Promise.allSettled([
    saveSystemMetrics(),
    saveContainerMetrics(),
    saveOllamaMetrics(),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Metrics collection ${index} failed:`, result.reason);
    }
  });
}

async function cleanupAllMetrics(): Promise<void> {
  const [systemDeleted, containerDeleted, ollamaDeleted] = await Promise.all([
    cleanupOldMetrics(),
    cleanupOldContainerMetrics(),
    cleanupOldOllamaMetrics(),
  ]);

  const total = systemDeleted + containerDeleted + ollamaDeleted;
  if (total > 0) {
    console.log(`Cleaned up ${total} old metric records`);
  }
}
```

### Step 3: Create History Endpoint

Create `src/app/api/ollama/history/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db, ollamaMetrics } from '@/db';
import { desc, gte } from 'drizzle-orm';
import type { ApiResponse } from '@/lib/types/api';
import type { OllamaMetric } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<OllamaMetric[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000', 10), 5000);

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const metrics = await db
      .select()
      .from(ollamaMetrics)
      .where(gte(ollamaMetrics.timestamp, since))
      .orderBy(desc(ollamaMetrics.timestamp))
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

---

## Files Created/Modified

- `src/lib/services/metrics-storage.ts` - Added Ollama metrics functions
- `src/lib/services/metrics-scheduler.ts` - Updated for Ollama collection
- `src/app/api/ollama/history/route.ts` - History endpoint

---

## API Documentation

### GET /api/ollama/history
Returns historical Ollama metrics.

**Query Parameters:**
- `hours` (optional): Number of hours to look back (default: 24)
- `limit` (optional): Maximum records (default: 1000, max: 5000)

---

## Validation Steps

1. Start app with Ollama running
2. Wait for metrics collection
3. Query: `curl http://localhost:3000/api/ollama/history`
4. Check database with `npm run db:studio`

---

## Commit Message

```
[claude] Task-17: Add inference monitoring and metrics

- Extended scheduler to collect Ollama metrics
- Added Ollama metrics persistence functions
- Created history endpoint for Ollama metrics
- Implemented metrics cleanup
```
