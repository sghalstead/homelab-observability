# Task-12: Implement Systemd Service Client

**Phase:** PHASE 3 - Systemd Integration
**Status:** Pending
**Dependencies:** Task-04

---

## Objective

Create a systemd service client to list and monitor system services, with fallback to command-line tools if D-Bus is unavailable.

---

## Definition of Done

- [ ] Systemd client created using child_process (systemctl)
- [ ] Service listing function implemented
- [ ] Service status retrieval implemented
- [ ] TypeScript types defined
- [ ] Error handling for systemd unavailability
- [ ] Unit tests for client functions

---

## Implementation Details

### Step 1: Create Systemd Types

Create `src/lib/types/systemd.ts`:

```typescript
export interface ServiceInfo {
  name: string;
  description: string;
  loadState: 'loaded' | 'not-found' | 'bad-setting' | 'error' | 'masked';
  activeState: 'active' | 'reloading' | 'inactive' | 'failed' | 'activating' | 'deactivating';
  subState: string;
  unitFileState: 'enabled' | 'disabled' | 'static' | 'masked' | 'generated' | 'transient' | 'indirect';
}

export interface ServiceDetails extends ServiceInfo {
  mainPid: number | null;
  memoryUsage: number | null;
  cpuUsage: number | null;
  startedAt: Date | null;
  uptime: number | null; // seconds
}

export interface SystemdStatus {
  available: boolean;
  version?: string;
  error?: string;
}
```

### Step 2: Create Systemd Client

Create `src/lib/clients/systemd.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import type { ServiceInfo, ServiceDetails, SystemdStatus } from '@/lib/types/systemd';

const execAsync = promisify(exec);

// Default services to monitor - can be configured via env
const DEFAULT_SERVICES = [
  'docker',
  'ollama',
  'nginx',
  'postgresql',
  'redis',
  'ssh',
];

export function getMonitoredServices(): string[] {
  const envServices = process.env.MONITORED_SERVICES;
  if (envServices) {
    return envServices.split(',').map((s) => s.trim());
  }
  return DEFAULT_SERVICES;
}

export async function getSystemdStatus(): Promise<SystemdStatus> {
  try {
    const { stdout } = await execAsync('systemctl --version');
    const versionMatch = stdout.match(/systemd (\d+)/);
    return {
      available: true,
      version: versionMatch ? versionMatch[1] : 'unknown',
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'systemd unavailable',
    };
  }
}

export async function getServiceInfo(serviceName: string): Promise<ServiceInfo | null> {
  try {
    const { stdout } = await execAsync(
      `systemctl show ${serviceName} --property=Description,LoadState,ActiveState,SubState,UnitFileState --no-pager`
    );

    const properties = parseSystemctlOutput(stdout);

    return {
      name: serviceName,
      description: properties.Description || serviceName,
      loadState: (properties.LoadState || 'not-found') as ServiceInfo['loadState'],
      activeState: (properties.ActiveState || 'inactive') as ServiceInfo['activeState'],
      subState: properties.SubState || 'unknown',
      unitFileState: (properties.UnitFileState || 'disabled') as ServiceInfo['unitFileState'],
    };
  } catch (error) {
    console.error(`Failed to get info for service ${serviceName}:`, error);
    return null;
  }
}

export async function getServiceDetails(serviceName: string): Promise<ServiceDetails | null> {
  try {
    const { stdout } = await execAsync(
      `systemctl show ${serviceName} --property=Description,LoadState,ActiveState,SubState,UnitFileState,MainPID,MemoryCurrent,CPUUsageNSec,ActiveEnterTimestamp --no-pager`
    );

    const properties = parseSystemctlOutput(stdout);

    const mainPid = parseInt(properties.MainPID || '0', 10) || null;
    const memoryUsage = parseInt(properties.MemoryCurrent || '0', 10) || null;
    const cpuUsageNs = parseInt(properties.CPUUsageNSec || '0', 10) || null;
    const cpuUsage = cpuUsageNs ? cpuUsageNs / 1000000000 : null; // Convert to seconds

    let startedAt: Date | null = null;
    let uptime: number | null = null;

    if (properties.ActiveEnterTimestamp && properties.ActiveEnterTimestamp !== 'n/a') {
      startedAt = new Date(properties.ActiveEnterTimestamp);
      if (!isNaN(startedAt.getTime())) {
        uptime = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      }
    }

    return {
      name: serviceName,
      description: properties.Description || serviceName,
      loadState: (properties.LoadState || 'not-found') as ServiceInfo['loadState'],
      activeState: (properties.ActiveState || 'inactive') as ServiceInfo['activeState'],
      subState: properties.SubState || 'unknown',
      unitFileState: (properties.UnitFileState || 'disabled') as ServiceInfo['unitFileState'],
      mainPid,
      memoryUsage,
      cpuUsage,
      startedAt,
      uptime,
    };
  } catch (error) {
    console.error(`Failed to get details for service ${serviceName}:`, error);
    return null;
  }
}

export async function listServices(): Promise<ServiceInfo[]> {
  const serviceNames = getMonitoredServices();
  const services: ServiceInfo[] = [];

  for (const name of serviceNames) {
    const info = await getServiceInfo(name);
    if (info) {
      services.push(info);
    }
  }

  return services;
}

function parseSystemctlOutput(output: string): Record<string, string> {
  const properties: Record<string, string> = {};

  for (const line of output.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      properties[key.trim()] = valueParts.join('=').trim();
    }
  }

  return properties;
}
```

### Step 3: Create Tests

Create `src/lib/clients/systemd.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getSystemdStatus, listServices, getMonitoredServices } from './systemd';

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
});
```

---

## Files Created/Modified

- `src/lib/types/systemd.ts` - Type definitions
- `src/lib/clients/systemd.ts` - Systemd client
- `src/lib/clients/systemd.test.ts` - Client tests

---

## Notes

- Uses `systemctl show` command for reliable property access
- Service list is configurable via `MONITORED_SERVICES` env var
- Memory and CPU metrics require cgroup v2 and appropriate permissions
- Some properties may be unavailable depending on service configuration

---

## Environment Configuration

Add to `.env.local`:
```env
# Comma-separated list of services to monitor
MONITORED_SERVICES=docker,ollama,nginx,ssh
```

---

## Validation Steps

1. Run `npm run test:run`
2. Test manually: `systemctl show docker --property=ActiveState`
3. Verify monitored services list includes expected services

---

## Commit Message

```
[claude] Task-12: Implement systemd service client

- Created systemd client using systemctl commands
- Added service listing and details functions
- Defined TypeScript types for service data
- Made monitored services configurable via env
- Added client tests
```
