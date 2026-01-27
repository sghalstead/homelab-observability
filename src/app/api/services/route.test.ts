import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock the systemd client
vi.mock('@/lib/clients/systemd', () => ({
  getSystemdStatus: vi.fn(),
  listServices: vi.fn(),
}));

import { getSystemdStatus, listServices } from '@/lib/clients/systemd';

describe('GET /api/services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns services list with systemd status on success', async () => {
    const mockSystemdStatus = { available: true, version: '252' };
    const mockServices = [
      {
        name: 'docker',
        description: 'Docker Application Container Engine',
        loadState: 'loaded',
        activeState: 'active',
        subState: 'running',
        unitFileState: 'enabled',
      },
      {
        name: 'ssh',
        description: 'OpenBSD Secure Shell server',
        loadState: 'loaded',
        activeState: 'active',
        subState: 'running',
        unitFileState: 'enabled',
      },
    ];

    vi.mocked(getSystemdStatus).mockResolvedValue(mockSystemdStatus);
    vi.mocked(listServices).mockResolvedValue(mockServices);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.systemd).toEqual(mockSystemdStatus);
    expect(json.data.services).toEqual(mockServices);
    expect(json.timestamp).toBeDefined();
  });

  it('returns empty services array when none found', async () => {
    const mockSystemdStatus = { available: true, version: '252' };

    vi.mocked(getSystemdStatus).mockResolvedValue(mockSystemdStatus);
    vi.mocked(listServices).mockResolvedValue([]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.services).toEqual([]);
  });

  it('returns systemd unavailable status', async () => {
    const mockSystemdStatus = { available: false, error: 'systemd unavailable' };

    vi.mocked(getSystemdStatus).mockResolvedValue(mockSystemdStatus);
    vi.mocked(listServices).mockResolvedValue([]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.systemd.available).toBe(false);
    expect(json.data.systemd.error).toBe('systemd unavailable');
  });

  it('returns error on exception', async () => {
    vi.mocked(getSystemdStatus).mockRejectedValue(new Error('System error'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('System error');
  });
});
