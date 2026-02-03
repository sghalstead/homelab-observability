import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSystemMetrics, saveOllamaMetrics } from './metrics-storage';

vi.mock('@/lib/collectors/system', () => ({
  collectSystemMetrics: vi.fn(),
}));

vi.mock('@/lib/clients/ollama', () => ({
  getOllamaStatus: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({}),
    }),
  },
}));

vi.mock('@/db/schema', () => ({
  systemMetrics: {},
  ollamaMetrics: {},
}));

import { collectSystemMetrics } from '@/lib/collectors/system';
import { getOllamaStatus } from '@/lib/clients/ollama';

describe('Metrics Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves metrics when collection succeeds', async () => {
    vi.mocked(collectSystemMetrics).mockResolvedValue({
      timestamp: new Date(),
      cpu: { usage: 25, temperature: 45 },
      memory: { total: 8000000000, used: 4000000000, percent: 50 },
      disk: { total: 100000000000, used: 50000000000, percent: 50 },
      collected: true,
    });

    const result = await saveSystemMetrics();
    expect(result).toBe(true);
  });

  it('returns false when collection fails', async () => {
    vi.mocked(collectSystemMetrics).mockResolvedValue({
      timestamp: new Date(),
      cpu: { usage: 0, temperature: null },
      memory: { total: 0, used: 0, percent: 0 },
      disk: { total: 0, used: 0, percent: 0 },
      collected: false,
      error: 'Failed',
    });

    const result = await saveSystemMetrics();
    expect(result).toBe(false);
  });
});

describe('Ollama Metrics Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves Ollama metrics when server is available', async () => {
    vi.mocked(getOllamaStatus).mockResolvedValue({
      available: true,
      version: '0.1.17',
      models: [
        {
          name: 'llama2:latest',
          modifiedAt: new Date(),
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
    });

    const result = await saveOllamaMetrics();
    expect(result).toBe(true);
  });

  it('saves Ollama metrics when server is unavailable', async () => {
    vi.mocked(getOllamaStatus).mockResolvedValue({
      available: false,
      models: [],
      running: [],
      error: 'Ollama server is not running',
    });

    const result = await saveOllamaMetrics();
    expect(result).toBe(true);
  });

  it('returns false when getOllamaStatus throws', async () => {
    vi.mocked(getOllamaStatus).mockRejectedValue(new Error('Network error'));

    const result = await saveOllamaMetrics();
    expect(result).toBe(false);
  });
});
