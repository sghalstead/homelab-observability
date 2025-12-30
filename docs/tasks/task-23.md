# Task-23: Implement Historical Metrics Queries and Charts

**Phase:** PHASE 6 - Historical Data & Charts
**Status:** Pending
**Dependencies:** Task-08, Task-19

---

## Objective

Add historical data visualization with time-series charts using Recharts for system metrics, container stats, and Ollama activity.

---

## Definition of Done

- [ ] Historical metrics hooks created
- [ ] Time range selector component
- [ ] CPU usage chart over time
- [ ] Memory usage chart over time
- [ ] Container stats charts
- [ ] Charts auto-refresh
- [ ] Responsive chart sizing

---

## Implementation Details

### Step 1: Create History Hooks

Create `src/hooks/use-metrics-history.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { SystemMetric, ContainerMetric, OllamaMetric } from '@/db/schema';

async function fetchSystemHistory(hours: number): Promise<SystemMetric[]> {
  const response = await fetch(`/api/metrics/system/history?hours=${hours}`);
  const data: ApiResponse<SystemMetric[]> = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
}

async function fetchContainerHistory(hours: number, containerId?: string): Promise<ContainerMetric[]> {
  const url = containerId
    ? `/api/docker/containers/history?hours=${hours}&containerId=${containerId}`
    : `/api/docker/containers/history?hours=${hours}`;
  const response = await fetch(url);
  const data: ApiResponse<ContainerMetric[]> = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
}

async function fetchOllamaHistory(hours: number): Promise<OllamaMetric[]> {
  const response = await fetch(`/api/ollama/history?hours=${hours}`);
  const data: ApiResponse<OllamaMetric[]> = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
}

export function useSystemHistory(hours = 24) {
  return useQuery({
    queryKey: ['system-history', hours],
    queryFn: () => fetchSystemHistory(hours),
    refetchInterval: 60000, // 1 minute
  });
}

export function useContainerHistory(hours = 24, containerId?: string) {
  return useQuery({
    queryKey: ['container-history', hours, containerId],
    queryFn: () => fetchContainerHistory(hours, containerId),
    refetchInterval: 60000,
  });
}

export function useOllamaHistory(hours = 24) {
  return useQuery({
    queryKey: ['ollama-history', hours],
    queryFn: () => fetchOllamaHistory(hours),
    refetchInterval: 60000,
  });
}
```

### Step 2: Create Time Range Selector

Create `src/components/charts/time-range-selector.tsx`:

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimeRangeSelectorProps {
  value: number;
  onChange: (hours: number) => void;
}

const ranges = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1">
      {ranges.map((range) => (
        <Button
          key={range.hours}
          variant={value === range.hours ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(range.hours)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
```

### Step 3: Create System Metrics Chart

Create `src/components/charts/system-metrics-chart.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SystemMetric } from '@/db/schema';

interface SystemMetricsChartProps {
  data: SystemMetric[];
  isLoading: boolean;
  title: string;
  metrics: Array<{
    key: keyof SystemMetric;
    name: string;
    color: string;
  }>;
}

export function SystemMetricsChart({ data, isLoading, title, metrics }: SystemMetricsChartProps) {
  const chartData = useMemo(() => {
    return [...data]
      .reverse()
      .map((d) => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            {metrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.name}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Step 4: Create History Dashboard Component

Create `src/components/dashboard/metrics-history.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useSystemHistory } from '@/hooks/use-metrics-history';
import { TimeRangeSelector } from '@/components/charts/time-range-selector';
import { SystemMetricsChart } from '@/components/charts/system-metrics-chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function MetricsHistory() {
  const [hours, setHours] = useState(24);
  const { data, isLoading, error } = useSystemHistory(hours);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Historical Data</h2>
        <TimeRangeSelector value={hours} onChange={setHours} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SystemMetricsChart
          data={data || []}
          isLoading={isLoading}
          title="CPU & Memory Usage"
          metrics={[
            { key: 'cpuUsage', name: 'CPU %', color: 'hsl(var(--chart-1))' },
            { key: 'memoryPercent', name: 'Memory %', color: 'hsl(var(--chart-2))' },
          ]}
        />
        <SystemMetricsChart
          data={data || []}
          isLoading={isLoading}
          title="Disk & Temperature"
          metrics={[
            { key: 'diskPercent', name: 'Disk %', color: 'hsl(var(--chart-3))' },
            { key: 'cpuTemperature', name: 'Temp °C', color: 'hsl(var(--chart-4))' },
          ]}
        />
      </div>
    </div>
  );
}
```

### Step 5: Add Chart Colors to Tailwind

Update `src/app/globals.css`:

```css
@layer base {
  :root {
    /* ... existing variables ... */
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
  .dark {
    /* ... existing variables ... */
    --chart-1: 220 70% 60%;
    --chart-2: 160 60% 55%;
    --chart-3: 30 80% 65%;
    --chart-4: 280 65% 70%;
    --chart-5: 340 75% 65%;
  }
}
```

### Step 6: Update System Page with Charts

Update `src/app/system/page.tsx`:

```typescript
import { SystemOverview } from '@/components/dashboard/system-overview';
import { MetricsHistory } from '@/components/dashboard/metrics-history';

export default function SystemPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">System Metrics</h1>
        <p className="text-muted-foreground">
          Real-time system resource monitoring
        </p>
      </div>
      <SystemOverview />
      <MetricsHistory />
    </div>
  );
}
```

---

## Files Created/Modified

- `src/hooks/use-metrics-history.ts`
- `src/components/charts/time-range-selector.tsx`
- `src/components/charts/system-metrics-chart.tsx`
- `src/components/dashboard/metrics-history.tsx`
- `src/app/globals.css` - Added chart colors
- `src/app/system/page.tsx`

---

## Validation Steps

1. Run app and wait for metrics to accumulate
2. Navigate to `/system`
3. Verify charts display historical data
4. Test time range selector (1h, 6h, 24h, 7d)
5. Verify charts auto-refresh
6. Check responsive behavior on mobile

---

## Commit Message

```
[claude] Task-23: Implement historical metrics and charts

- Created history hooks for all metric types
- Added TimeRangeSelector component
- Built responsive line charts with Recharts
- Created MetricsHistory dashboard component
- Added chart color CSS variables
- Updated system page with historical charts
```
