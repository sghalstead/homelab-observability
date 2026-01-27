import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { ServiceInfo, ServiceDetails, SystemdStatus } from '@/lib/types/systemd';

interface ServicesResponse {
  systemd: SystemdStatus;
  services: ServiceInfo[];
}

async function fetchServices(): Promise<ServicesResponse> {
  const response = await fetch('/api/services');
  const data: ApiResponse<ServicesResponse> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

async function fetchServiceDetails(name: string): Promise<ServiceDetails> {
  const response = await fetch(`/api/services/${name}`);
  const data: ApiResponse<ServiceDetails> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    refetchInterval: 15000,
  });
}

export function useServiceDetails(name: string, enabled = true) {
  return useQuery({
    queryKey: ['service-details', name],
    queryFn: () => fetchServiceDetails(name),
    enabled,
    refetchInterval: 15000,
  });
}

export function useServiceControl() {
  const queryClient = useQueryClient();

  const controlMutation = useMutation({
    mutationFn: async ({
      name,
      action,
    }: {
      name: string;
      action: 'start' | 'stop' | 'restart';
    }) => {
      const res = await fetch(`/api/services/${name}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || `Failed to ${action} service`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return controlMutation;
}
