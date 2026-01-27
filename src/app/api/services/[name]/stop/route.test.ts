import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the systemd client
vi.mock('@/lib/clients/systemd', () => ({
  stopService: vi.fn(),
  isAllowedService: vi.fn(),
}));

import { stopService, isAllowedService } from '@/lib/clients/systemd';

describe('POST /api/services/[name]/stop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(name: string): {
    request: NextRequest;
    params: Promise<{ name: string }>;
  } {
    const request = new NextRequest(`http://localhost:3000/api/services/${name}/stop`, {
      method: 'POST',
    });
    return { request, params: Promise.resolve({ name }) };
  }

  it('stops a service successfully', async () => {
    vi.mocked(isAllowedService).mockReturnValue(true);
    vi.mocked(stopService).mockResolvedValue({ success: true });

    const { request, params } = createMockRequest('docker');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.stopped).toBe(true);
    expect(stopService).toHaveBeenCalledWith('docker');
  });

  it('returns 403 for non-allowed services', async () => {
    vi.mocked(isAllowedService).mockReturnValue(false);

    const { request, params } = createMockRequest('malicious-service');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.success).toBe(false);
    expect(json.error).toContain('not in the allowed services list');
    expect(stopService).not.toHaveBeenCalled();
  });

  it('returns 500 when stop fails', async () => {
    vi.mocked(isAllowedService).mockReturnValue(true);
    vi.mocked(stopService).mockResolvedValue({
      success: false,
      error: 'Permission denied. Service control requires elevated privileges.',
    });

    const { request, params } = createMockRequest('docker');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toContain('Permission denied');
  });

  it('returns 500 on exception', async () => {
    vi.mocked(isAllowedService).mockReturnValue(true);
    vi.mocked(stopService).mockRejectedValue(new Error('System error'));

    const { request, params } = createMockRequest('docker');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('System error');
  });
});
