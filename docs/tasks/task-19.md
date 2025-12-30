# Task-19: Build System Metrics Dashboard Components

**Phase:** PHASE 5 - Dashboard UI
**Status:** Pending
**Dependencies:** Task-07, Task-18

---

## Objective

Create React components to display real-time system metrics including CPU, memory, temperature, and disk usage with auto-refresh.

---

## Definition of Done

- [ ] System metrics hooks created with React Query
- [ ] CPU usage gauge/card component
- [ ] Memory usage gauge/card component
- [ ] Temperature display component
- [ ] Disk usage component
- [ ] Auto-refresh working (10s interval)
- [ ] Loading and error states handled
- [ ] Unit tests for components

---

## Implementation Details

### Step 1: Create API Hooks

Create `src/hooks/use-system-metrics.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import type { SystemMetricsSnapshot } from '@/lib/types/metrics';
import type { ApiResponse } from '@/lib/types/api';

async function fetchSystemMetrics(): Promise<SystemMetricsSnapshot> {
  const response = await fetch('/api/metrics/system');
  const data: ApiResponse<SystemMetricsSnapshot> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch metrics');
  }

  return data.data;
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: fetchSystemMetrics,
    refetchInterval: 10000, // 10 seconds
  });
}
```

### Step 2: Create Metric Card Component

Create `src/components/metrics/metric-card.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  maxValue?: number;
  showProgress?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  maxValue = 100,
  showProgress = true,
  icon,
  isLoading,
  className,
}: MetricCardProps) {
  const percentage = value !== null ? (value / maxValue) * 100 : 0;
  const getStatusColor = (pct: number) => {
    if (pct >= 90) return 'text-red-500';
    if (pct >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', showProgress && getStatusColor(percentage))}>
          {value !== null ? `${value.toFixed(1)}${unit}` : 'N/A'}
        </div>
        {showProgress && value !== null && (
          <Progress value={percentage} className="mt-2" />
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create System Overview Component

Create `src/components/dashboard/system-overview.tsx`:

```typescript
'use client';

import { useSystemMetrics } from '@/hooks/use-system-metrics';
import { MetricCard } from '@/components/metrics/metric-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Cpu, HardDrive, Thermometer, MemoryStick, AlertCircle } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';

export function SystemOverview() {
  const { data, isLoading, error } = useSystemMetrics();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load system metrics: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="CPU Usage"
        value={data?.cpu.usage ?? null}
        unit="%"
        icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Memory Usage"
        value={data?.memory.percent ?? null}
        unit="%"
        icon={<MemoryStick className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="CPU Temperature"
        value={data?.cpu.temperature ?? null}
        unit="°C"
        maxValue={100}
        icon={<Thermometer className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Disk Usage"
        value={data?.disk.percent ?? null}
        unit="%"
        icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### Step 4: Create Format Utilities

Create `src/lib/utils/format.ts`:

```typescript
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
```

### Step 5: Update System Page

Update `src/app/system/page.tsx`:

```typescript
import { SystemOverview } from '@/components/dashboard/system-overview';

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Metrics</h1>
        <p className="text-muted-foreground">
          Real-time system resource monitoring
        </p>
      </div>
      <SystemOverview />
    </div>
  );
}
```

---

## Files Created/Modified

- `src/hooks/use-system-metrics.ts`
- `src/components/metrics/metric-card.tsx`
- `src/components/dashboard/system-overview.tsx`
- `src/lib/utils/format.ts`
- `src/app/system/page.tsx`

---

## Validation Steps

1. Run `npm run dev`
2. Navigate to `/system`
3. Verify metrics display with real values
4. Verify auto-refresh (values update every 10s)
5. Test loading states (slow network)
6. Test error state (stop API)

---

## Commit Message

```
[claude] Task-19: Build system metrics dashboard components

- Created useSystemMetrics hook with auto-refresh
- Added MetricCard component with progress indicator
- Built SystemOverview component with CPU, memory, temp, disk
- Added format utilities for bytes and uptime
- Updated system page with live metrics
```
