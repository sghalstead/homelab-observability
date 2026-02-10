import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/clients/docker', () => ({
  listContainers: vi.fn(),
}));

import { listContainers } from '@/lib/clients/docker';

describe('GET /api/docker/containers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockContainers = [
    {
      id: 'a1b2c3d4e5f6',
      name: 'nginx-proxy',
      image: 'nginx:latest',
      status: 'Up 3 hours',
      state: 'running' as const,
      created: new Date('2024-01-01'),
      ports: [{ privatePort: 80, publicPort: 8080, type: 'tcp' as const }],
    },
  ];

  it('returns all containers by default', async () => {
    vi.mocked(listContainers).mockResolvedValue(mockContainers);

    const request = new NextRequest('http://localhost:3000/api/docker/containers');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe('nginx-proxy');
    expect(listContainers).toHaveBeenCalledWith(true);
  });

  it('filters to running only when all=false', async () => {
    vi.mocked(listContainers).mockResolvedValue(mockContainers);

    const request = new NextRequest('http://localhost:3000/api/docker/containers?all=false');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(listContainers).toHaveBeenCalledWith(false);
  });

  it('returns empty array when no containers', async () => {
    vi.mocked(listContainers).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/docker/containers');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(0);
  });

  it('returns error on exception', async () => {
    vi.mocked(listContainers).mockRejectedValue(new Error('Docker error'));

    const request = new NextRequest('http://localhost:3000/api/docker/containers');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Docker error');
  });
});
