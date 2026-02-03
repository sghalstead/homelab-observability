import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn(),
  },
  ollamaMetrics: {},
}));

import { db } from '@/db';

describe('GET /api/ollama/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns historical Ollama metrics', async () => {
    const mockMetrics = [
      {
        id: 1,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        running: true,
        modelCount: 3,
        activeInferences: 1,
      },
      {
        id: 2,
        timestamp: new Date('2024-01-01T11:00:00Z'),
        running: true,
        modelCount: 3,
        activeInferences: 0,
      },
    ];

    vi.mocked(db.select().from({}).where({}).orderBy({}).limit).mockResolvedValue(mockMetrics);

    const request = new NextRequest('http://localhost:3000/api/ollama/history');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.timestamp).toBeDefined();
  });

  it('returns empty array when no metrics', async () => {
    vi.mocked(db.select().from({}).where({}).orderBy({}).limit).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/ollama/history');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it('respects hours query parameter', async () => {
    vi.mocked(db.select().from({}).where({}).orderBy({}).limit).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/ollama/history?hours=48');
    await GET(request);

    expect(db.select).toHaveBeenCalled();
  });

  it('respects limit query parameter', async () => {
    vi.mocked(db.select().from({}).where({}).orderBy({}).limit).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/ollama/history?limit=500');
    await GET(request);

    expect(db.select().from({}).where({}).orderBy({}).limit).toHaveBeenCalledWith(500);
  });

  it('caps limit at 5000', async () => {
    vi.mocked(db.select().from({}).where({}).orderBy({}).limit).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/ollama/history?limit=10000');
    await GET(request);

    expect(db.select().from({}).where({}).orderBy({}).limit).toHaveBeenCalledWith(5000);
  });

  it('returns error on database failure', async () => {
    vi.mocked(db.select().from({}).where({}).orderBy({}).limit).mockRejectedValue(
      new Error('Database error')
    );

    const request = new NextRequest('http://localhost:3000/api/ollama/history');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Database error');
  });
});
