import { describe, it, expect } from 'vitest';
import {
  ServiceInfoSchema,
  ServiceDetailsSchema,
  ServiceControlActionSchema,
  ServiceControlResultSchema,
} from '../services';

describe('ServiceInfoSchema', () => {
  it('validates correct service info', () => {
    const service = {
      name: 'nginx',
      description: 'A high performance web server',
      loadState: 'loaded',
      activeState: 'active',
      subState: 'running',
      unitFileState: 'enabled',
    };
    const result = ServiceInfoSchema.safeParse(service);
    expect(result.success).toBe(true);
  });

  it('accepts all valid loadState values', () => {
    const loadStates = ['loaded', 'not-found', 'bad-setting', 'error', 'masked'];
    for (const loadState of loadStates) {
      const service = {
        name: 'test',
        description: 'Test',
        loadState,
        activeState: 'active',
        subState: 'running',
        unitFileState: 'enabled',
      };
      const result = ServiceInfoSchema.safeParse(service);
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid activeState values', () => {
    const activeStates = [
      'active',
      'reloading',
      'inactive',
      'failed',
      'activating',
      'deactivating',
    ];
    for (const activeState of activeStates) {
      const service = {
        name: 'test',
        description: 'Test',
        loadState: 'loaded',
        activeState,
        subState: 'running',
        unitFileState: 'enabled',
      };
      const result = ServiceInfoSchema.safeParse(service);
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid unitFileState values', () => {
    const unitFileStates = [
      'enabled',
      'disabled',
      'static',
      'masked',
      'generated',
      'transient',
      'indirect',
    ];
    for (const unitFileState of unitFileStates) {
      const service = {
        name: 'test',
        description: 'Test',
        loadState: 'loaded',
        activeState: 'active',
        subState: 'running',
        unitFileState,
      };
      const result = ServiceInfoSchema.safeParse(service);
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid activeState', () => {
    const service = {
      name: 'test',
      description: 'Test',
      loadState: 'loaded',
      activeState: 'unknown',
      subState: 'running',
      unitFileState: 'enabled',
    };
    const result = ServiceInfoSchema.safeParse(service);
    expect(result.success).toBe(false);
  });
});

describe('ServiceDetailsSchema', () => {
  it('validates complete service details', () => {
    const details = {
      name: 'nginx',
      description: 'A high performance web server',
      loadState: 'loaded',
      activeState: 'active',
      subState: 'running',
      unitFileState: 'enabled',
      mainPid: 1234,
      memoryUsage: 52428800,
      cpuUsage: 0.5,
      startedAt: '2024-01-15T10:30:00.000Z',
      uptime: 86400,
    };
    const result = ServiceDetailsSchema.safeParse(details);
    expect(result.success).toBe(true);
  });

  it('allows null values for extended fields', () => {
    const details = {
      name: 'nginx',
      description: 'A high performance web server',
      loadState: 'loaded',
      activeState: 'inactive',
      subState: 'dead',
      unitFileState: 'enabled',
      mainPid: null,
      memoryUsage: null,
      cpuUsage: null,
      startedAt: null,
      uptime: null,
    };
    const result = ServiceDetailsSchema.safeParse(details);
    expect(result.success).toBe(true);
  });
});

describe('ServiceControlActionSchema', () => {
  it('validates start action', () => {
    const result = ServiceControlActionSchema.safeParse('start');
    expect(result.success).toBe(true);
  });

  it('validates stop action', () => {
    const result = ServiceControlActionSchema.safeParse('stop');
    expect(result.success).toBe(true);
  });

  it('validates restart action', () => {
    const result = ServiceControlActionSchema.safeParse('restart');
    expect(result.success).toBe(true);
  });

  it('rejects invalid action', () => {
    const result = ServiceControlActionSchema.safeParse('reload');
    expect(result.success).toBe(false);
  });
});

describe('ServiceControlResultSchema', () => {
  it('validates successful result', () => {
    const result = ServiceControlResultSchema.safeParse({ success: true });
    expect(result.success).toBe(true);
  });

  it('validates failure result with error', () => {
    const result = ServiceControlResultSchema.safeParse({
      success: false,
      error: 'Permission denied',
    });
    expect(result.success).toBe(true);
  });
});
