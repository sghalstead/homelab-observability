import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { SystemMetric } from '@/db/schema';

async function fetchSystemHistory(hours: number): Promise<SystemMetric[]> {
  const response = await fetch(`/api/metrics/system/history?hours=${hours}`);
  const data: ApiResponse<SystemMetric[]> = await response.json();
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
