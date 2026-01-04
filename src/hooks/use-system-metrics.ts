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
