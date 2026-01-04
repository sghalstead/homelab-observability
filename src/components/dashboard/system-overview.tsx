'use client';

import { useSystemMetrics } from '@/hooks/use-system-metrics';
import { MetricCard } from '@/components/metrics/metric-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Cpu, HardDrive, Thermometer, MemoryStick, AlertCircle } from 'lucide-react';

export function SystemOverview() {
  const { data, isLoading, error } = useSystemMetrics();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load system metrics: {error instanceof Error ? error.message : 'Unknown error'}
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
