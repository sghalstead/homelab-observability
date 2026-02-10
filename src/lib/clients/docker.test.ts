import { describe, it, expect } from 'vitest';
import {
  getDockerStatus,
  listContainers,
  getContainerStats,
  startContainer,
  stopContainer,
  restartContainer,
} from './docker';

// Note: These tests run against the real Docker daemon if available.
// They are designed to work whether Docker is running or not.

describe('Docker Client', () => {
  describe('getDockerStatus', () => {
    it('returns status object with required fields', async () => {
      const status = await getDockerStatus();
      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('containers');
      expect(typeof status.available).toBe('boolean');
      expect(status.containers).toHaveProperty('total');
      expect(status.containers).toHaveProperty('running');
      expect(status.containers).toHaveProperty('paused');
      expect(status.containers).toHaveProperty('stopped');
    });

    it('includes version when available', async () => {
      const status = await getDockerStatus();
      if (status.available) {
        expect(status.version).toBeDefined();
        expect(typeof status.version).toBe('string');
      }
    });

    it('includes error message when not available', async () => {
      const status = await getDockerStatus();
      if (!status.available) {
        expect(status.error).toBeDefined();
        expect(typeof status.error).toBe('string');
      }
    });

    it('has non-negative container counts', async () => {
      const status = await getDockerStatus();
      expect(status.containers.total).toBeGreaterThanOrEqual(0);
      expect(status.containers.running).toBeGreaterThanOrEqual(0);
      expect(status.containers.paused).toBeGreaterThanOrEqual(0);
      expect(status.containers.stopped).toBeGreaterThanOrEqual(0);
    });
  });

  describe('listContainers', () => {
    it('returns an array', async () => {
      const containers = await listContainers();
      expect(Array.isArray(containers)).toBe(true);
    });

    it('returns containers with correct structure if available', async () => {
      const containers = await listContainers();
      if (containers.length > 0) {
        const container = containers[0];
        expect(container).toHaveProperty('id');
        expect(container).toHaveProperty('name');
        expect(container).toHaveProperty('image');
        expect(container).toHaveProperty('status');
        expect(container).toHaveProperty('state');
        expect(container).toHaveProperty('created');
        expect(container).toHaveProperty('ports');
        expect(typeof container.id).toBe('string');
        expect(container.id.length).toBe(12);
        expect(Array.isArray(container.ports)).toBe(true);
      }
    });

    it('filters to running only when all=false', async () => {
      const all = await listContainers(true);
      const running = await listContainers(false);
      // Running should be a subset of all
      expect(running.length).toBeLessThanOrEqual(all.length);
    });
  });

  describe('getContainerStats', () => {
    it('returns null for non-existent container', async () => {
      const stats = await getContainerStats('nonexistent123');
      expect(stats).toBeNull();
    });

    it('returns stats with correct structure for running container', async () => {
      const containers = await listContainers(false);
      const runningContainer = containers.find((c) => c.state === 'running');
      if (runningContainer) {
        const stats = await getContainerStats(runningContainer.id);
        if (stats) {
          expect(stats).toHaveProperty('id');
          expect(stats).toHaveProperty('name');
          expect(stats).toHaveProperty('cpuPercent');
          expect(stats).toHaveProperty('memoryUsed');
          expect(stats).toHaveProperty('memoryLimit');
          expect(stats).toHaveProperty('memoryPercent');
          expect(stats).toHaveProperty('networkRx');
          expect(stats).toHaveProperty('networkTx');
          expect(stats).toHaveProperty('blockRead');
          expect(stats).toHaveProperty('blockWrite');
          expect(stats.cpuPercent).toBeGreaterThanOrEqual(0);
          expect(stats.memoryUsed).toBeGreaterThanOrEqual(0);
          expect(stats.memoryLimit).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('container control', () => {
    it('startContainer returns false for non-existent container', async () => {
      const result = await startContainer('nonexistent123');
      expect(result).toBe(false);
    });

    it('stopContainer returns false for non-existent container', async () => {
      const result = await stopContainer('nonexistent123');
      expect(result).toBe(false);
    });

    it('restartContainer returns false for non-existent container', async () => {
      const result = await restartContainer('nonexistent123');
      expect(result).toBe(false);
    });
  });
});
