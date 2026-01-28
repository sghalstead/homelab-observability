import { describe, it, expect } from 'vitest';
import {
  CpuMetricsSchema,
  MemoryMetricsSchema,
  DiskMetricsSchema,
  SystemMetricsSchema,
  SystemMetricsApiSchema,
} from '../metrics';

describe('CpuMetricsSchema', () => {
  it('validates correct CPU metrics', () => {
    const metrics = { usage: 45.5, temperature: 62.3 };
    const result = CpuMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it('allows null temperature', () => {
    const metrics = { usage: 30.0, temperature: null };
    const result = CpuMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it('rejects usage below 0', () => {
    const metrics = { usage: -5, temperature: 60 };
    const result = CpuMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(false);
  });

  it('rejects usage above 100', () => {
    const metrics = { usage: 150, temperature: 60 };
    const result = CpuMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(false);
  });
});

describe('MemoryMetricsSchema', () => {
  it('validates correct memory metrics', () => {
    const metrics = { total: 8589934592, used: 4294967296, percent: 50.0 };
    const result = MemoryMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it('rejects negative values', () => {
    const metrics = { total: -100, used: 500, percent: 50 };
    const result = MemoryMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(false);
  });

  it('rejects percent over 100', () => {
    const metrics = { total: 1000, used: 500, percent: 101 };
    const result = MemoryMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(false);
  });
});

describe('DiskMetricsSchema', () => {
  it('validates correct disk metrics', () => {
    const metrics = { total: 1000000000000, used: 500000000000, percent: 50.0 };
    const result = DiskMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it('rejects negative values', () => {
    const metrics = { total: 1000, used: -500, percent: 50 };
    const result = DiskMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(false);
  });
});

describe('SystemMetricsSchema', () => {
  it('validates complete system metrics', () => {
    const metrics = {
      timestamp: new Date('2024-01-15T10:30:00.000Z'),
      cpu: { usage: 25.5, temperature: 55.0 },
      memory: { total: 8589934592, used: 4294967296, percent: 50.0 },
      disk: { total: 1000000000000, used: 300000000000, percent: 30.0 },
    };
    const result = SystemMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it('coerces string dates', () => {
    const metrics = {
      timestamp: '2024-01-15T10:30:00.000Z',
      cpu: { usage: 25.5, temperature: null },
      memory: { total: 8589934592, used: 4294967296, percent: 50.0 },
      disk: { total: 1000000000000, used: 300000000000, percent: 30.0 },
    };
    const result = SystemMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timestamp).toBeInstanceOf(Date);
    }
  });

  it('rejects missing required fields', () => {
    const metrics = {
      timestamp: new Date(),
      cpu: { usage: 25.5, temperature: 55.0 },
      // missing memory and disk
    };
    const result = SystemMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(false);
  });
});

describe('SystemMetricsApiSchema', () => {
  it('validates flat API response structure', () => {
    const metrics = {
      id: 1,
      timestamp: '2024-01-15T10:30:00.000Z',
      cpuUsage: 25.5,
      cpuTemperature: 55.0,
      memoryTotal: 8589934592,
      memoryUsed: 4294967296,
      memoryPercent: 50.0,
      diskTotal: 1000000000000,
      diskUsed: 300000000000,
      diskPercent: 30.0,
    };
    const result = SystemMetricsApiSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it('allows null cpuTemperature', () => {
    const metrics = {
      id: 1,
      timestamp: '2024-01-15T10:30:00.000Z',
      cpuUsage: 25.5,
      cpuTemperature: null,
      memoryTotal: 8589934592,
      memoryUsed: 4294967296,
      memoryPercent: 50.0,
      diskTotal: 1000000000000,
      diskUsed: 300000000000,
      diskPercent: 30.0,
    };
    const result = SystemMetricsApiSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });
});
