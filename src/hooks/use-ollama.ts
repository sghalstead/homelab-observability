import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { OllamaStatus, OllamaModel, OllamaRunningModel } from '@/lib/types/ollama';

async function fetchOllamaStatus(): Promise<OllamaStatus> {
  const response = await fetch('/api/ollama/status');
  const data: ApiResponse<OllamaStatus> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

async function fetchOllamaModels(): Promise<OllamaModel[]> {
  const response = await fetch('/api/ollama/models');
  const data: ApiResponse<OllamaModel[]> = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
}

async function fetchRunningModels(): Promise<OllamaRunningModel[]> {
  const response = await fetch('/api/ollama/running');
  const data: ApiResponse<OllamaRunningModel[]> = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
}

export function useOllamaStatus() {
  return useQuery({
    queryKey: ['ollama-status'],
    queryFn: fetchOllamaStatus,
    refetchInterval: 15000,
  });
}

export function useOllamaModels() {
  return useQuery({
    queryKey: ['ollama-models'],
    queryFn: fetchOllamaModels,
    refetchInterval: 30000,
  });
}

export function useRunningModels() {
  return useQuery({
    queryKey: ['ollama-running'],
    queryFn: fetchRunningModels,
    refetchInterval: 5000, // More frequent for active inferences
  });
}
