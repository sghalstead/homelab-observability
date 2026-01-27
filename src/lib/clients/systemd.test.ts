import { describe, it, expect } from 'vitest';
import {
  getSystemdStatus,
  listServices,
  getMonitoredServices,
  getServiceInfo,
  getServiceDetails,
  isAllowedService,
} from './systemd';

// Note: These tests run against real systemd
// They are designed to work on systems with or without systemd

describe('Systemd Client', () => {
  describe('getSystemdStatus', () => {
    it('returns status object', async () => {
      const status = await getSystemdStatus();
      expect(status).toHaveProperty('available');
      // On systems with systemd
      if (status.available) {
        expect(status.version).toBeDefined();
      }
    });
  });

  describe('getMonitoredServices', () => {
    it('returns array of service names', () => {
      const services = getMonitoredServices();
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    });

    it('returns default services when env not set', () => {
      const originalEnv = process.env.MONITORED_SERVICES;
      delete process.env.MONITORED_SERVICES;

      const services = getMonitoredServices();
      expect(services).toContain('docker');
      expect(services).toContain('ssh');

      // Restore env
      if (originalEnv) {
        process.env.MONITORED_SERVICES = originalEnv;
      }
    });
  });

  describe('getServiceInfo', () => {
    it('returns service info for a common service', async () => {
      // ssh is commonly available on Linux systems
      const info = await getServiceInfo('ssh');
      if (info) {
        expect(info.name).toBe('ssh');
        expect(info).toHaveProperty('loadState');
        expect(info).toHaveProperty('activeState');
        expect(info).toHaveProperty('subState');
        expect(info).toHaveProperty('unitFileState');
      }
    });

    it('returns info even for non-existent service', async () => {
      const info = await getServiceInfo('nonexistent-service-12345');
      // systemctl show returns info even for non-existent services
      if (info) {
        expect(info.loadState).toBe('not-found');
      }
    });
  });

  describe('getServiceDetails', () => {
    it('returns extended details for a service', async () => {
      const details = await getServiceDetails('ssh');
      if (details) {
        expect(details.name).toBe('ssh');
        expect(details).toHaveProperty('mainPid');
        expect(details).toHaveProperty('memoryUsage');
        expect(details).toHaveProperty('cpuUsage');
        expect(details).toHaveProperty('startedAt');
        expect(details).toHaveProperty('uptime');
      }
    });
  });

  describe('listServices', () => {
    it('returns array of service info', async () => {
      const services = await listServices();
      expect(Array.isArray(services)).toBe(true);
      // At least some services should be found on a typical system
      if (services.length > 0) {
        expect(services[0]).toHaveProperty('name');
        expect(services[0]).toHaveProperty('activeState');
      }
    });
  });

  describe('isAllowedService', () => {
    it('returns true for monitored services', () => {
      const services = getMonitoredServices();
      if (services.length > 0) {
        expect(isAllowedService(services[0])).toBe(true);
      }
    });

    it('returns false for non-monitored services', () => {
      expect(isAllowedService('definitely-not-a-monitored-service-xyz')).toBe(false);
    });

    it('returns true for docker (default monitored service)', () => {
      const originalEnv = process.env.MONITORED_SERVICES;
      delete process.env.MONITORED_SERVICES;

      expect(isAllowedService('docker')).toBe(true);

      if (originalEnv) {
        process.env.MONITORED_SERVICES = originalEnv;
      }
    });
  });
});
