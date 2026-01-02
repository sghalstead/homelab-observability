import { describe, it, expect } from 'vitest';
import {
  collectCpuUsage,
  collectCpuTemperature,
  collectMemoryUsage,
  collectDiskUsage,
  collectSystemMetrics,
} from './system';

// Note: These tests run against real system data
// For CI, you may want to mock systeminformation

describe('System Metrics Collector', () => {
  describe('collectCpuUsage', () => {
    it('returns a number between 0 and 100', async () => {
      const usage = await collectCpuUsage();
      expect(typeof usage).toBe('number');
      expect(usage).toBeGreaterThanOrEqual(0);
      expect(usage).toBeLessThanOrEqual(100);
    });
  });

  describe('collectCpuTemperature', () => {
    it('returns a number or null', async () => {
      const temp = await collectCpuTemperature();
      expect(temp === null || typeof temp === 'number').toBe(true);
    });
  });

  describe('collectMemoryUsage', () => {
    it('returns memory stats with valid values', async () => {
      const memory = await collectMemoryUsage();
      expect(memory.total).toBeGreaterThan(0);
      expect(memory.used).toBeGreaterThanOrEqual(0);
      expect(memory.used).toBeLessThanOrEqual(memory.total);
      expect(memory.percent).toBeGreaterThanOrEqual(0);
      expect(memory.percent).toBeLessThanOrEqual(100);
    });
  });

  describe('collectDiskUsage', () => {
    it('returns disk stats with valid values', async () => {
      const disk = await collectDiskUsage();
      expect(disk.total).toBeGreaterThanOrEqual(0);
      expect(disk.used).toBeGreaterThanOrEqual(0);
      expect(disk.percent).toBeGreaterThanOrEqual(0);
      expect(disk.percent).toBeLessThanOrEqual(100);
    });
  });

  describe('collectSystemMetrics', () => {
    it('returns a complete metrics snapshot', async () => {
      const metrics = await collectSystemMetrics();
      expect(metrics.collected).toBe(true);
      expect(metrics.timestamp).toBeInstanceOf(Date);
      expect(metrics.cpu).toBeDefined();
      expect(metrics.memory).toBeDefined();
      expect(metrics.disk).toBeDefined();
    });
  });
});
