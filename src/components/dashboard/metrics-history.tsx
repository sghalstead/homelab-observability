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
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load historical data'}
        </AlertDescription>
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
          title="CPU, Memory & Disk Usage"
          metrics={[
            { key: 'cpuUsage', name: 'CPU %', color: 'hsl(var(--chart-1))' },
            { key: 'memoryPercent', name: 'Memory %', color: 'hsl(var(--chart-2))' },
            { key: 'diskPercent', name: 'Disk %', color: 'hsl(var(--chart-3))' },
          ]}
        />
        <SystemMetricsChart
          data={data || []}
          isLoading={isLoading}
          title="CPU Temperature"
          metrics={[{ key: 'cpuTemperature', name: 'Temp °C', color: 'hsl(var(--chart-4))' }]}
        />
      </div>
    </div>
  );
}
