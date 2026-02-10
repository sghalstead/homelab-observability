import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: mockFrom }),
  },
}));

vi.mock('@/db/schema', () => ({
  containerMetrics: {
    timestamp: 'timestamp',
    containerId: 'container_id',
  },
}));

describe('GET /api/docker/containers/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]);
  });

  it('returns container metrics history', async () => {
    const mockMetrics = [
      {
        id: 1,
        timestamp: new Date(),
        containerId: 'a1b2c3d4e5f6',
        containerName: 'nginx',
        status: 'running',
        cpuPercent: 2.5,
        memoryUsed: 52428800,
        memoryLimit: 8589934592,
        networkRx: 1048576,
        networkTx: 524288,
      },
    ];
    mockLimit.mockResolvedValue(mockMetrics);

    const request = new NextRequest('http://localhost:3000/api/docker/containers/history?hours=1');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
  });

  it('returns empty array when no metrics', async () => {
    const request = new NextRequest('http://localhost:3000/api/docker/containers/history');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(0);
  });

  it('returns 400 for invalid query parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/docker/containers/history?hours=-1');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('accepts containerId filter', async () => {
    mockLimit.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/docker/containers/history?containerId=a1b2c3d4e5f6'
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
