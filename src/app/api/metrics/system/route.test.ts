import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock the collector
vi.mock('@/lib/collectors/system', () => ({
  collectSystemMetrics: vi.fn(),
}));

import { collectSystemMetrics } from '@/lib/collectors/system';

describe('GET /api/metrics/system', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns metrics on success', async () => {
    const mockMetrics = {
      timestamp: new Date(),
      cpu: { usage: 25.5, temperature: 45.2 },
      memory: { total: 8000000000, used: 4000000000, percent: 50 },
      disk: { total: 100000000000, used: 50000000000, percent: 50 },
      collected: true,
    };

    vi.mocked(collectSystemMetrics).mockResolvedValue(mockMetrics);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.cpu).toEqual(mockMetrics.cpu);
    expect(json.data.memory).toEqual(mockMetrics.memory);
    expect(json.data.disk).toEqual(mockMetrics.disk);
    expect(json.data.collected).toBe(true);
  });

  it('returns error when collection fails', async () => {
    vi.mocked(collectSystemMetrics).mockResolvedValue({
      timestamp: new Date(),
      cpu: { usage: 0, temperature: null },
      memory: { total: 0, used: 0, percent: 0 },
      disk: { total: 0, used: 0, percent: 0 },
      collected: false,
      error: 'Collection failed',
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Collection failed');
  });
});
