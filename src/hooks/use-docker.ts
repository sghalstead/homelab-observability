import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { ContainerInfo, ContainerStats, DockerStatus } from '@/lib/types/docker';

async function fetchDockerStatus(): Promise<DockerStatus> {
  const response = await fetch('/api/docker/status');
  const data: ApiResponse<DockerStatus> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

async function fetchContainers(): Promise<ContainerInfo[]> {
  const response = await fetch('/api/docker/containers');
  const data: ApiResponse<ContainerInfo[]> = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
}

async function fetchContainerStats(id: string): Promise<ContainerStats> {
  const response = await fetch(`/api/docker/containers/${id}/stats`);
  const data: ApiResponse<ContainerStats> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

export function useDockerStatus() {
  return useQuery({
    queryKey: ['docker-status'],
    queryFn: fetchDockerStatus,
    refetchInterval: 30000,
  });
}

export function useContainers() {
  return useQuery({
    queryKey: ['docker-containers'],
    queryFn: fetchContainers,
    refetchInterval: 10000,
  });
}

export function useContainerStats(id: string, enabled = true) {
  return useQuery({
    queryKey: ['docker-container-stats', id],
    queryFn: () => fetchContainerStats(id),
    refetchInterval: 10000,
    enabled,
  });
}

export function useContainerControl() {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/docker/containers/${id}/start`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to start container');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/docker/containers/${id}/stop`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to stop container');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
    },
  });

  const restartMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/docker/containers/${id}/restart`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to restart container');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
    },
  });

  return { startMutation, stopMutation, restartMutation };
}
