import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the systemd client
vi.mock('@/lib/clients/systemd', () => ({
  getServiceDetails: vi.fn(),
}));

import { getServiceDetails } from '@/lib/clients/systemd';

describe('GET /api/services/[name]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(name: string): {
    request: NextRequest;
    params: Promise<{ name: string }>;
  } {
    const request = new NextRequest(`http://localhost:3000/api/services/${name}`);
    return { request, params: Promise.resolve({ name }) };
  }

  it('returns service details on success', async () => {
    const mockDetails = {
      name: 'docker',
      description: 'Docker Application Container Engine',
      loadState: 'loaded',
      activeState: 'active',
      subState: 'running',
      unitFileState: 'enabled',
      mainPid: 1234,
      memoryUsage: 104857600,
      cpuUsage: 1.5,
      startedAt: new Date('2024-01-01T00:00:00Z'),
      uptime: 86400,
    };

    vi.mocked(getServiceDetails).mockResolvedValue(mockDetails);

    const { request, params } = createMockRequest('docker');
    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe('docker');
    expect(json.data.mainPid).toBe(1234);
    expect(json.data.memoryUsage).toBe(104857600);
    expect(json.timestamp).toBeDefined();
  });

  it('returns 404 when service not found', async () => {
    vi.mocked(getServiceDetails).mockResolvedValue(null);

    const { request, params } = createMockRequest('nonexistent-service');
    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toContain('nonexistent-service');
    expect(json.error).toContain('not found');
  });

  it('returns error on exception', async () => {
    vi.mocked(getServiceDetails).mockRejectedValue(new Error('System error'));

    const { request, params } = createMockRequest('docker');
    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('System error');
  });

  it('handles service with no running process', async () => {
    const mockDetails = {
      name: 'nginx',
      description: 'nginx - high performance web server',
      loadState: 'loaded',
      activeState: 'inactive',
      subState: 'dead',
      unitFileState: 'disabled',
      mainPid: null,
      memoryUsage: null,
      cpuUsage: null,
      startedAt: null,
      uptime: null,
    };

    vi.mocked(getServiceDetails).mockResolvedValue(mockDetails);

    const { request, params } = createMockRequest('nginx');
    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.activeState).toBe('inactive');
    expect(json.data.mainPid).toBeNull();
    expect(json.data.uptime).toBeNull();
  });
});
