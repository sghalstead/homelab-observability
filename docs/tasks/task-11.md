# Task-11: Add Container Metrics Persistence

**Phase:** PHASE 2 - Docker Integration
**Status:** Complete
**Dependencies:** Task-09, Task-08

---

## Objective

Extend the metrics scheduler to collect and store Docker container metrics alongside system metrics.

---

## Definition of Done

- [ ] Container metrics collection added to scheduler
- [ ] Container metrics saved to database
- [ ] Only running containers' metrics are collected
- [ ] Historical container metrics queryable
- [ ] Tests for container metrics persistence

---

## Implementation Details

### Step 1: Update Metrics Storage Service

Update `src/lib/services/metrics-storage.ts`:

```typescript
import { db, systemMetrics, containerMetrics } from '@/db';
import { lt } from 'drizzle-orm';
import { collectSystemMetrics } from '@/lib/collectors/system';
import { listContainers, getContainerStats } from '@/lib/clients/docker';
import { config } from '@/lib/config';
import type { NewSystemMetric, NewContainerMetric } from '@/db/schema';

// ... existing saveSystemMetrics function ...

export async function saveContainerMetrics(): Promise<number> {
  try {
    const containers = await listContainers(false); // Only running containers
    const timestamp = new Date();
    let saved = 0;

    for (const container of containers) {
      const stats = await getContainerStats(container.id);

      if (stats) {
        const record: NewContainerMetric = {
          timestamp,
          containerId: container.id,
          containerName: container.name,
          status: container.state,
          cpuPercent: stats.cpuPercent,
          memoryUsed: stats.memoryUsed,
          memoryLimit: stats.memoryLimit,
          networkRx: stats.networkRx,
          networkTx: stats.networkTx,
        };

        await db.insert(containerMetrics).values(record);
        saved++;
      }
    }

    return saved;
  } catch (error) {
    console.error('Failed to save container metrics:', error);
    return 0;
  }
}

export async function cleanupOldContainerMetrics(): Promise<number> {
  try {
    const cutoff = new Date(
      Date.now() - config.metrics.retentionHours * 60 * 60 * 1000
    );

    const result = await db
      .delete(containerMetrics)
      .where(lt(containerMetrics.timestamp, cutoff));

    return result.changes || 0;
  } catch (error) {
    console.error('Failed to cleanup old container metrics:', error);
    return 0;
  }
}
```

### Step 2: Update Metrics Scheduler

Update `src/lib/services/metrics-scheduler.ts`:

```typescript
import { config } from '@/lib/config';
import {
  saveSystemMetrics,
  saveContainerMetrics,
  cleanupOldMetrics,
  cleanupOldContainerMetrics,
} from './metrics-storage';

let collectionInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;
let isRunning = false;

async function collectAllMetrics(): Promise<void> {
  const results = await Promise.allSettled([
    saveSystemMetrics(),
    saveContainerMetrics(),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Metrics collection ${index} failed:`, result.reason);
    }
  });
}

async function cleanupAllMetrics(): Promise<void> {
  const [systemDeleted, containerDeleted] = await Promise.all([
    cleanupOldMetrics(),
    cleanupOldContainerMetrics(),
  ]);

  const total = systemDeleted + containerDeleted;
  if (total > 0) {
    console.log(`Cleaned up ${total} old metric records`);
  }
}

export function startMetricsCollection(): void {
  if (isRunning) {
    console.log('Metrics collection already running');
    return;
  }

  console.log(
    `Starting metrics collection (interval: ${config.metrics.collectionIntervalMs}ms)`
  );

  // Collect immediately on start
  collectAllMetrics().catch(console.error);

  // Schedule regular collection
  collectionInterval = setInterval(() => {
    collectAllMetrics().catch(console.error);
  }, config.metrics.collectionIntervalMs);

  // Schedule cleanup every hour
  cleanupInterval = setInterval(
    () => {
      cleanupAllMetrics().catch(console.error);
    },
    60 * 60 * 1000
  );

  isRunning = true;
}

// ... rest of the file unchanged ...
```

### Step 3: Create Container Metrics History Endpoint

Create `src/app/api/docker/containers/history/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db, containerMetrics } from '@/db';
import { desc, gte, eq, and } from 'drizzle-orm';
import type { ApiResponse } from '@/lib/types/api';
import type { ContainerMetric } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ContainerMetric[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const containerId = searchParams.get('containerId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000', 10), 5000);

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    let query = db
      .select()
      .from(containerMetrics)
      .where(
        containerId
          ? and(
              gte(containerMetrics.timestamp, since),
              eq(containerMetrics.containerId, containerId)
            )
          : gte(containerMetrics.timestamp, since)
      )
      .orderBy(desc(containerMetrics.timestamp))
      .limit(limit);

    const metrics = await query;

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

- `src/lib/services/metrics-storage.ts` - Added container metrics functions
- `src/lib/services/metrics-scheduler.ts` - Updated to collect container metrics
- `src/app/api/docker/containers/history/route.ts` - History endpoint

---

## Validation Steps

1. Start app with Docker running
2. Wait for metrics collection interval
3. Query `npm run db:studio` and check `container_metrics` table
4. Test history endpoint: `curl http://localhost:3000/api/docker/containers/history`

---

## Commit Message

```
[claude] Task-11: Add container metrics persistence

- Extended scheduler to collect container metrics
- Added container metrics storage functions
- Implemented container metrics cleanup
- Created history endpoint for container metrics
```
