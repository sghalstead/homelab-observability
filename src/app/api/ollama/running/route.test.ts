import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/clients/ollama', () => ({
  isOllamaAvailable: vi.fn(),
  getRunningModels: vi.fn(),
}));

import { isOllamaAvailable, getRunningModels } from '@/lib/clients/ollama';

describe('GET /api/ollama/running', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns running models when Ollama available', async () => {
    const mockRunning = [
      {
        name: 'llama2:latest',
        model: 'llama2:latest',
        size: 3826793472,
        digest: 'abc123',
        expiresAt: new Date('2024-01-01T12:00:00Z'),
        sizeVram: 3826793472,
      },
    ];

    vi.mocked(isOllamaAvailable).mockResolvedValue(true);
    vi.mocked(getRunningModels).mockResolvedValue(mockRunning);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe('llama2:latest');
    expect(json.timestamp).toBeDefined();
  });

  it('returns empty array when no models running', async () => {
    vi.mocked(isOllamaAvailable).mockResolvedValue(true);
    vi.mocked(getRunningModels).mockResolvedValue([]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it('returns empty array when Ollama unavailable', async () => {
    vi.mocked(isOllamaAvailable).mockResolvedValue(false);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
    expect(getRunningModels).not.toHaveBeenCalled();
  });

  it('returns error on exception', async () => {
    vi.mocked(isOllamaAvailable).mockRejectedValue(new Error('Connection refused'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Connection refused');
  });
});
