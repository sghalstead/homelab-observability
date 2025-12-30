# Task-06: Implement System Metrics Collector

**Phase:** PHASE 1 - System Metrics Collection
**Status:** Pending
**Dependencies:** Task-04

---

## Objective

Create a system metrics collector that gathers CPU usage, memory usage, CPU temperature, and disk usage using the `systeminformation` library.

---

## Definition of Done

- [ ] `systeminformation` library installed
- [ ] System metrics collector service created
- [ ] CPU usage collection working
- [ ] Memory usage collection working
- [ ] CPU temperature collection working (graceful fallback if unavailable)
- [ ] Disk usage collection working
- [ ] TypeScript types defined for all metrics
- [ ] Unit tests for collector functions

---

## Implementation Details

### Step 1: Install Dependencies

```bash
npm install systeminformation
npm install -D @types/node
```

### Step 2: Create Types

Create `src/lib/types/metrics.ts`:

```typescript
export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage 0-100
    temperature: number | null; // celsius, null if unavailable
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    percent: number; // percentage 0-100
  };
  disk: {
    total: number; // bytes
    used: number; // bytes
    percent: number; // percentage 0-100
  };
}

export interface SystemMetricsSnapshot extends SystemMetrics {
  collected: boolean;
  error?: string;
}
```

### Step 3: Create System Collector Service

Create `src/lib/collectors/system.ts`:

```typescript
import si from 'systeminformation';
import type { SystemMetrics, SystemMetricsSnapshot } from '@/lib/types/metrics';

export async function collectCpuUsage(): Promise<number> {
  const load = await si.currentLoad();
  return Math.round(load.currentLoad * 100) / 100;
}

export async function collectCpuTemperature(): Promise<number | null> {
  try {
    const temp = await si.cpuTemperature();
    return temp.main !== null ? Math.round(temp.main * 10) / 10 : null;
  } catch {
    return null;
  }
}

export async function collectMemoryUsage(): Promise<{
  total: number;
  used: number;
  percent: number;
}> {
  const mem = await si.mem();
  return {
    total: mem.total,
    used: mem.used,
    percent: Math.round((mem.used / mem.total) * 10000) / 100,
  };
}

export async function collectDiskUsage(): Promise<{
  total: number;
  used: number;
  percent: number;
}> {
  const disks = await si.fsSize();
  // Get root filesystem or first disk
  const rootDisk = disks.find((d) => d.mount === '/') || disks[0];

  if (!rootDisk) {
    return { total: 0, used: 0, percent: 0 };
  }

  return {
    total: rootDisk.size,
    used: rootDisk.used,
    percent: Math.round(rootDisk.use * 100) / 100,
  };
}

export async function collectSystemMetrics(): Promise<SystemMetricsSnapshot> {
  try {
    const [cpuUsage, cpuTemperature, memory, disk] = await Promise.all([
      collectCpuUsage(),
      collectCpuTemperature(),
      collectMemoryUsage(),
      collectDiskUsage(),
    ]);

    return {
      timestamp: new Date(),
      cpu: {
        usage: cpuUsage,
        temperature: cpuTemperature,
      },
      memory,
      disk,
      collected: true,
    };
  } catch (error) {
    return {
      timestamp: new Date(),
      cpu: { usage: 0, temperature: null },
      memory: { total: 0, used: 0, percent: 0 },
      disk: { total: 0, used: 0, percent: 0 },
      collected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### Step 4: Create Unit Tests

Create `src/lib/collectors/system.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import {
  collectCpuUsage,
  collectCpuTemperature,
  collectMemoryUsage,
  collectDiskUsage,
  collectSystemMetrics,
} from './system';

// Note: These tests run against real system data
// For CI, you may want to mock systeminformation

describe('System Metrics Collector', () => {
  describe('collectCpuUsage', () => {
    it('returns a number between 0 and 100', async () => {
      const usage = await collectCpuUsage();
      expect(typeof usage).toBe('number');
      expect(usage).toBeGreaterThanOrEqual(0);
      expect(usage).toBeLessThanOrEqual(100);
    });
  });

  describe('collectCpuTemperature', () => {
    it('returns a number or null', async () => {
      const temp = await collectCpuTemperature();
      expect(temp === null || typeof temp === 'number').toBe(true);
    });
  });

  describe('collectMemoryUsage', () => {
    it('returns memory stats with valid values', async () => {
      const memory = await collectMemoryUsage();
      expect(memory.total).toBeGreaterThan(0);
      expect(memory.used).toBeGreaterThanOrEqual(0);
      expect(memory.used).toBeLessThanOrEqual(memory.total);
      expect(memory.percent).toBeGreaterThanOrEqual(0);
      expect(memory.percent).toBeLessThanOrEqual(100);
    });
  });

  describe('collectDiskUsage', () => {
    it('returns disk stats with valid values', async () => {
      const disk = await collectDiskUsage();
      expect(disk.total).toBeGreaterThanOrEqual(0);
      expect(disk.used).toBeGreaterThanOrEqual(0);
      expect(disk.percent).toBeGreaterThanOrEqual(0);
      expect(disk.percent).toBeLessThanOrEqual(100);
    });
  });

  describe('collectSystemMetrics', () => {
    it('returns a complete metrics snapshot', async () => {
      const metrics = await collectSystemMetrics();
      expect(metrics.collected).toBe(true);
      expect(metrics.timestamp).toBeInstanceOf(Date);
      expect(metrics.cpu).toBeDefined();
      expect(metrics.memory).toBeDefined();
      expect(metrics.disk).toBeDefined();
    });
  });
});
```

---

## Files Created/Modified

- `src/lib/types/metrics.ts` - Type definitions
- `src/lib/collectors/system.ts` - System metrics collector
- `src/lib/collectors/system.test.ts` - Unit tests
- `package.json` - Added systeminformation dependency

---

## Validation Steps

1. Run `npm run test:run` - All tests should pass
2. Create a simple script to test collection:
   ```typescript
   import { collectSystemMetrics } from './src/lib/collectors/system';
   const metrics = await collectSystemMetrics();
   console.log(metrics);
   ```
3. Verify all metric values are populated correctly

---

## Notes

- CPU temperature may not be available on all systems (returns null)
- Using Promise.all for parallel collection improves performance
- Error handling ensures partial failures don't crash collection

---

## Commit Message

```
[claude] Task-06: Implement system metrics collector

- Added systeminformation library
- Created CPU, memory, disk, and temperature collectors
- Defined TypeScript types for metrics
- Added unit tests for all collector functions
- Implemented graceful fallback for unavailable metrics
```
