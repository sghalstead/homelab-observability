import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/clients/docker', () => ({
  restartContainer: vi.fn(),
}));

import { restartContainer } from '@/lib/clients/docker';

describe('POST /api/docker/containers/[id]/restart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(id: string): {
    request: NextRequest;
    params: Promise<{ id: string }>;
  } {
    const request = new NextRequest(`http://localhost:3000/api/docker/containers/${id}/restart`, {
      method: 'POST',
    });
    return { request, params: Promise.resolve({ id }) };
  }

  it('restarts a container successfully', async () => {
    vi.mocked(restartContainer).mockResolvedValue(true);

    const { request, params } = createMockRequest('a1b2c3d4e5f6');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.restarted).toBe(true);
    expect(restartContainer).toHaveBeenCalledWith('a1b2c3d4e5f6');
  });

  it('returns 500 when restart fails', async () => {
    vi.mocked(restartContainer).mockResolvedValue(false);

    const { request, params } = createMockRequest('a1b2c3d4e5f6');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toContain('Failed to restart');
  });

  it('returns 500 on exception', async () => {
    vi.mocked(restartContainer).mockRejectedValue(new Error('Docker error'));

    const { request, params } = createMockRequest('a1b2c3d4e5f6');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Docker error');
  });
});
