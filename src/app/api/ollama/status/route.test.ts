import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/clients/ollama', () => ({
  getOllamaStatus: vi.fn(),
}));

import { getOllamaStatus } from '@/lib/clients/ollama';

describe('GET /api/ollama/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Ollama status when available', async () => {
    const mockStatus = {
      available: true,
      version: '0.1.17',
      models: [
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
      ],
      running: [],
    };

    vi.mocked(getOllamaStatus).mockResolvedValue(mockStatus);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.available).toBe(true);
    expect(json.data.version).toBe('0.1.17');
    expect(json.data.models).toHaveLength(1);
    expect(json.timestamp).toBeDefined();
  });

  it('returns unavailable status when Ollama not running', async () => {
    const mockStatus = {
      available: false,
      models: [],
      running: [],
      error: 'Ollama server is not running',
    };

    vi.mocked(getOllamaStatus).mockResolvedValue(mockStatus);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.available).toBe(false);
    expect(json.data.error).toBe('Ollama server is not running');
  });

  it('returns error on exception', async () => {
    vi.mocked(getOllamaStatus).mockRejectedValue(new Error('Connection failed'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Connection failed');
  });
});
