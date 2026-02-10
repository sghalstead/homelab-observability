import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/clients/docker', () => ({
  startContainer: vi.fn(),
}));

import { startContainer } from '@/lib/clients/docker';

describe('POST /api/docker/containers/[id]/start', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(id: string): {
    request: NextRequest;
    params: Promise<{ id: string }>;
  } {
    const request = new NextRequest(`http://localhost:3000/api/docker/containers/${id}/start`, {
      method: 'POST',
    });
    return { request, params: Promise.resolve({ id }) };
  }

  it('starts a container successfully', async () => {
    vi.mocked(startContainer).mockResolvedValue(true);

    const { request, params } = createMockRequest('a1b2c3d4e5f6');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.started).toBe(true);
    expect(startContainer).toHaveBeenCalledWith('a1b2c3d4e5f6');
  });

  it('returns 500 when start fails', async () => {
    vi.mocked(startContainer).mockResolvedValue(false);

    const { request, params } = createMockRequest('a1b2c3d4e5f6');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toContain('Failed to start');
  });

  it('returns 500 on exception', async () => {
    vi.mocked(startContainer).mockRejectedValue(new Error('Docker error'));

    const { request, params } = createMockRequest('a1b2c3d4e5f6');
    const response = await POST(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Docker error');
  });
});
