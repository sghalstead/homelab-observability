import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/clients/ollama', () => ({
  isOllamaAvailable: vi.fn(),
  listOllamaModels: vi.fn(),
}));

import { isOllamaAvailable, listOllamaModels } from '@/lib/clients/ollama';

describe('GET /api/ollama/models', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns models list when Ollama available', async () => {
    const mockModels = [
      {
        name: 'llama2:latest',
        modifiedAt: new Date('2024-01-01'),
        size: 3826793472,
        digest: 'abc123',
        details: {
          format: 'gguf',
          family: 'llama',
          parameterSize: '7B',
          quantizationLevel: 'Q4_0',
        },
      },
      {
        name: 'codellama:7b',
        modifiedAt: new Date('2024-01-02'),
        size: 3826793472,
        digest: 'def456',
        details: {
          format: 'gguf',
          family: 'llama',
          parameterSize: '7B',
          quantizationLevel: 'Q4_0',
        },
      },
    ];

    vi.mocked(isOllamaAvailable).mockResolvedValue(true);
    vi.mocked(listOllamaModels).mockResolvedValue(mockModels);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.data[0].name).toBe('llama2:latest');
    expect(json.timestamp).toBeDefined();
  });

  it('returns empty array when Ollama unavailable', async () => {
    vi.mocked(isOllamaAvailable).mockResolvedValue(false);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
    expect(listOllamaModels).not.toHaveBeenCalled();
  });

  it('returns error on exception', async () => {
    vi.mocked(isOllamaAvailable).mockRejectedValue(new Error('Network error'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Network error');
  });
});
