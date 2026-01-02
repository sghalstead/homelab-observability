import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSystemMetrics } from './metrics-storage';

vi.mock('@/lib/collectors/system', () => ({
  collectSystemMetrics: vi.fn(),
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
}));

import { collectSystemMetrics } from '@/lib/collectors/system';

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
