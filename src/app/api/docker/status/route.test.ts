import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/clients/docker', () => ({
  getDockerStatus: vi.fn(),
}));

import { getDockerStatus } from '@/lib/clients/docker';

describe('GET /api/docker/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Docker status when available', async () => {
    const mockStatus = {
      available: true,
      version: '24.0.7',
      containers: { total: 5, running: 3, paused: 0, stopped: 2 },
    };

    vi.mocked(getDockerStatus).mockResolvedValue(mockStatus);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.available).toBe(true);
    expect(json.data.version).toBe('24.0.7');
    expect(json.data.containers.running).toBe(3);
    expect(json.timestamp).toBeDefined();
  });

  it('returns unavailable status when Docker not running', async () => {
    const mockStatus = {
      available: false,
      containers: { total: 0, running: 0, paused: 0, stopped: 0 },
      error: 'Docker unavailable',
    };

    vi.mocked(getDockerStatus).mockResolvedValue(mockStatus);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.available).toBe(false);
    expect(json.data.error).toBe('Docker unavailable');
  });

  it('returns error on exception', async () => {
    vi.mocked(getDockerStatus).mockRejectedValue(new Error('Connection failed'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Connection failed');
  });
});
