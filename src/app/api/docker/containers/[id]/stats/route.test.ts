import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/clients/docker', () => ({
  getContainerStats: vi.fn(),
}));

import { getContainerStats } from '@/lib/clients/docker';

describe('GET /api/docker/containers/[id]/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(id: string): {
    request: NextRequest;
    params: Promise<{ id: string }>;
  } {
    const request = new NextRequest(`http://localhost:3000/api/docker/containers/${id}/stats`);
    return { request, params: Promise.resolve({ id }) };
  }

  it('returns stats for a running container', async () => {
    const mockStats = {
      id: 'a1b2c3d4e5f6',
      name: 'nginx-proxy',
      cpuPercent: 2.5,
      memoryUsed: 52428800,
      memoryLimit: 8589934592,
      memoryPercent: 0.61,
      networkRx: 1048576,
      networkTx: 524288,
      blockRead: 2097152,
      blockWrite: 1048576,
    };

    vi.mocked(getContainerStats).mockResolvedValue(mockStats);

    const { request, params } = createMockRequest('a1b2c3d4e5f6');
    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.cpuPercent).toBe(2.5);
    expect(json.data.name).toBe('nginx-proxy');
    expect(getContainerStats).toHaveBeenCalledWith('a1b2c3d4e5f6');
  });

  it('returns 404 for non-existent container', async () => {
    vi.mocked(getContainerStats).mockResolvedValue(null);

    const { request, params } = createMockRequest('nonexistent');
    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toContain('not found');
  });

  it('returns error on exception', async () => {
    vi.mocked(getContainerStats).mockRejectedValue(new Error('Docker error'));

    const { request, params } = createMockRequest('a1b2c3d4e5f6');
    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Docker error');
  });
});
