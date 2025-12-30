# Task-08: Add Metrics Persistence to Database

**Phase:** PHASE 1 - System Metrics Collection
**Status:** Pending
**Dependencies:** Task-06, Task-04

---

## Objective

Implement automatic metrics collection and storage using background jobs with a configurable interval.

---

## Definition of Done

- [ ] Metrics collection scheduler created
- [ ] System metrics saved to database on interval
- [ ] Data retention policy implemented (configurable max age)
- [ ] Startup hook to begin collection
- [ ] Tests for persistence logic
- [ ] Configuration via environment variables

---

## Implementation Details

### Step 1: Create Environment Configuration

Add to `.env.local`:

```env
# Metrics collection configuration
METRICS_COLLECTION_INTERVAL_MS=60000
METRICS_RETENTION_HOURS=168
```

Create `src/lib/config.ts`:

```typescript
export const config = {
  metrics: {
    collectionIntervalMs: parseInt(
      process.env.METRICS_COLLECTION_INTERVAL_MS || '60000',
      10
    ),
    retentionHours: parseInt(
      process.env.METRICS_RETENTION_HOURS || '168', // 7 days
      10
    ),
  },
};
```

### Step 2: Create Metrics Storage Service

Create `src/lib/services/metrics-storage.ts`:

```typescript
import { db, systemMetrics } from '@/db';
import { lt } from 'drizzle-orm';
import { collectSystemMetrics } from '@/lib/collectors/system';
import { config } from '@/lib/config';
import type { NewSystemMetric } from '@/db/schema';

export async function saveSystemMetrics(): Promise<boolean> {
  try {
    const metrics = await collectSystemMetrics();

    if (!metrics.collected) {
      console.error('Failed to collect system metrics:', metrics.error);
      return false;
    }

    const record: NewSystemMetric = {
      timestamp: metrics.timestamp,
      cpuUsage: metrics.cpu.usage,
      cpuTemperature: metrics.cpu.temperature,
      memoryTotal: metrics.memory.total,
      memoryUsed: metrics.memory.used,
      memoryPercent: metrics.memory.percent,
      diskTotal: metrics.disk.total,
      diskUsed: metrics.disk.used,
      diskPercent: metrics.disk.percent,
    };

    await db.insert(systemMetrics).values(record);
    return true;
  } catch (error) {
    console.error('Failed to save system metrics:', error);
    return false;
  }
}

export async function cleanupOldMetrics(): Promise<number> {
  try {
    const cutoff = new Date(
      Date.now() - config.metrics.retentionHours * 60 * 60 * 1000
    );

    const result = await db
      .delete(systemMetrics)
      .where(lt(systemMetrics.timestamp, cutoff));

    return result.changes || 0;
  } catch (error) {
    console.error('Failed to cleanup old metrics:', error);
    return 0;
  }
}
```

### Step 3: Create Metrics Scheduler

Create `src/lib/services/metrics-scheduler.ts`:

```typescript
import { config } from '@/lib/config';
import { saveSystemMetrics, cleanupOldMetrics } from './metrics-storage';

let collectionInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;
let isRunning = false;

export function startMetricsCollection(): void {
  if (isRunning) {
    console.log('Metrics collection already running');
    return;
  }

  console.log(
    `Starting metrics collection (interval: ${config.metrics.collectionIntervalMs}ms)`
  );

  // Collect immediately on start
  saveSystemMetrics().catch(console.error);

  // Schedule regular collection
  collectionInterval = setInterval(() => {
    saveSystemMetrics().catch(console.error);
  }, config.metrics.collectionIntervalMs);

  // Schedule cleanup every hour
  cleanupInterval = setInterval(
    () => {
      cleanupOldMetrics()
        .then((deleted) => {
          if (deleted > 0) {
            console.log(`Cleaned up ${deleted} old metric records`);
          }
        })
        .catch(console.error);
    },
    60 * 60 * 1000
  );

  isRunning = true;
}

export function stopMetricsCollection(): void {
  if (collectionInterval) {
    clearInterval(collectionInterval);
    collectionInterval = null;
  }
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  isRunning = false;
  console.log('Metrics collection stopped');
}

export function isMetricsCollectionRunning(): boolean {
  return isRunning;
}
```

### Step 4: Create Initialization Route

Create `src/app/api/internal/init/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { startMetricsCollection, isMetricsCollectionRunning } from '@/lib/services/metrics-scheduler';

// This endpoint is called on app startup to initialize background tasks
export async function GET() {
  if (!isMetricsCollectionRunning()) {
    startMetricsCollection();
  }

  return NextResponse.json({
    success: true,
    metricsCollectionRunning: isMetricsCollectionRunning(),
  });
}
```

### Step 5: Create Instrumentation File

Create `src/instrumentation.ts`:

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startMetricsCollection } = await import('@/lib/services/metrics-scheduler');
    startMetricsCollection();
  }
}
```

Update `next.config.ts` to enable instrumentation:

```typescript
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
```

### Step 6: Create Tests

Create `src/lib/services/metrics-storage.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSystemMetrics } from './metrics-storage';

vi.mock('@/lib/collectors/system', () => ({
  collectSystemMetrics: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({}),
    }),
  },
  systemMetrics: {},
}));

import { collectSystemMetrics } from '@/lib/collectors/system';

describe('Metrics Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves metrics when collection succeeds', async () => {
    vi.mocked(collectSystemMetrics).mockResolvedValue({
      timestamp: new Date(),
      cpu: { usage: 25, temperature: 45 },
      memory: { total: 8000000000, used: 4000000000, percent: 50 },
      disk: { total: 100000000000, used: 50000000000, percent: 50 },
      collected: true,
    });

    const result = await saveSystemMetrics();
    expect(result).toBe(true);
  });

  it('returns false when collection fails', async () => {
    vi.mocked(collectSystemMetrics).mockResolvedValue({
      timestamp: new Date(),
      cpu: { usage: 0, temperature: null },
      memory: { total: 0, used: 0, percent: 0 },
      disk: { total: 0, used: 0, percent: 0 },
      collected: false,
      error: 'Failed',
    });

    const result = await saveSystemMetrics();
    expect(result).toBe(false);
  });
});
```

---

## Files Created/Modified

- `.env.local` - Environment configuration
- `src/lib/config.ts` - Configuration module
- `src/lib/services/metrics-storage.ts` - Storage service
- `src/lib/services/metrics-scheduler.ts` - Scheduler service
- `src/instrumentation.ts` - Next.js instrumentation
- `src/app/api/internal/init/route.ts` - Init endpoint
- `next.config.ts` - Enable instrumentation
- `src/lib/services/metrics-storage.test.ts` - Tests

---

## Validation Steps

1. Run `npm run dev`
2. Check console for "Starting metrics collection" message
3. Wait for collection interval
4. Query database: `npm run db:studio` and check `system_metrics` table
5. Run tests: `npm run test:run`

---

## Commit Message

```
[claude] Task-08: Add metrics persistence to database

- Created metrics storage service
- Implemented collection scheduler with configurable interval
- Added data retention/cleanup functionality
- Set up Next.js instrumentation for auto-start
- Added environment configuration
- Created unit tests
```
