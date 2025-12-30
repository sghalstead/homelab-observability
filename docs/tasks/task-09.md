# Task-09: Implement Docker API Client

**Phase:** PHASE 2 - Docker Integration
**Status:** Pending
**Dependencies:** Task-04

---

## Objective

Create a Docker API client using `dockerode` to interact with the Docker daemon and retrieve container information.

---

## Definition of Done

- [ ] `dockerode` library installed
- [ ] Docker client wrapper created
- [ ] Container listing function implemented
- [ ] Container stats retrieval implemented
- [ ] Container control functions (start/stop) implemented
- [ ] TypeScript types defined
- [ ] Error handling for Docker unavailability
- [ ] Unit tests for client functions

---

## Implementation Details

### Step 1: Install Dependencies

```bash
npm install dockerode
npm install -D @types/dockerode
```

### Step 2: Create Docker Types

Create `src/lib/types/docker.ts`:

```typescript
export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: 'running' | 'paused' | 'restarting' | 'exited' | 'dead' | 'created';
  created: Date;
  ports: ContainerPort[];
}

export interface ContainerPort {
  privatePort: number;
  publicPort?: number;
  type: 'tcp' | 'udp';
}

export interface ContainerStats {
  id: string;
  name: string;
  cpuPercent: number;
  memoryUsed: number;
  memoryLimit: number;
  memoryPercent: number;
  networkRx: number;
  networkTx: number;
  blockRead: number;
  blockWrite: number;
}

export interface DockerStatus {
  available: boolean;
  version?: string;
  containers: {
    total: number;
    running: number;
    paused: number;
    stopped: number;
  };
  error?: string;
}
```

### Step 3: Create Docker Client

Create `src/lib/clients/docker.ts`:

```typescript
import Docker from 'dockerode';
import type { ContainerInfo, ContainerStats, DockerStatus } from '@/lib/types/docker';

// Connect via socket (default for Linux)
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function getDockerStatus(): Promise<DockerStatus> {
  try {
    const info = await docker.info();
    const version = await docker.version();

    return {
      available: true,
      version: version.Version,
      containers: {
        total: info.Containers,
        running: info.ContainersRunning,
        paused: info.ContainersPaused,
        stopped: info.ContainersStopped,
      },
    };
  } catch (error) {
    return {
      available: false,
      containers: { total: 0, running: 0, paused: 0, stopped: 0 },
      error: error instanceof Error ? error.message : 'Docker unavailable',
    };
  }
}

export async function listContainers(all = true): Promise<ContainerInfo[]> {
  try {
    const containers = await docker.listContainers({ all });

    return containers.map((container) => ({
      id: container.Id.substring(0, 12),
      name: container.Names[0]?.replace(/^\//, '') || 'unknown',
      image: container.Image,
      status: container.Status,
      state: container.State as ContainerInfo['state'],
      created: new Date(container.Created * 1000),
      ports: container.Ports.map((port) => ({
        privatePort: port.PrivatePort,
        publicPort: port.PublicPort,
        type: port.Type as 'tcp' | 'udp',
      })),
    }));
  } catch (error) {
    console.error('Failed to list containers:', error);
    return [];
  }
}

export async function getContainerStats(containerId: string): Promise<ContainerStats | null> {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    const stats = await container.stats({ stream: false });

    // Calculate CPU percentage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || 1;
    const cpuPercent = systemCpuDelta > 0
      ? (cpuDelta / systemCpuDelta) * cpuCount * 100
      : 0;

    // Memory stats
    const memoryUsed = stats.memory_stats.usage || 0;
    const memoryLimit = stats.memory_stats.limit || 1;
    const memoryPercent = (memoryUsed / memoryLimit) * 100;

    // Network stats
    let networkRx = 0;
    let networkTx = 0;
    if (stats.networks) {
      for (const net of Object.values(stats.networks)) {
        networkRx += (net as { rx_bytes: number }).rx_bytes || 0;
        networkTx += (net as { tx_bytes: number }).tx_bytes || 0;
      }
    }

    // Block I/O stats
    let blockRead = 0;
    let blockWrite = 0;
    if (stats.blkio_stats?.io_service_bytes_recursive) {
      for (const stat of stats.blkio_stats.io_service_bytes_recursive) {
        if (stat.op === 'read') blockRead += stat.value;
        if (stat.op === 'write') blockWrite += stat.value;
      }
    }

    return {
      id: containerId.substring(0, 12),
      name: info.Name.replace(/^\//, ''),
      cpuPercent: Math.round(cpuPercent * 100) / 100,
      memoryUsed,
      memoryLimit,
      memoryPercent: Math.round(memoryPercent * 100) / 100,
      networkRx,
      networkTx,
      blockRead,
      blockWrite,
    };
  } catch (error) {
    console.error(`Failed to get stats for container ${containerId}:`, error);
    return null;
  }
}

export async function startContainer(containerId: string): Promise<boolean> {
  try {
    const container = docker.getContainer(containerId);
    await container.start();
    return true;
  } catch (error) {
    console.error(`Failed to start container ${containerId}:`, error);
    return false;
  }
}

export async function stopContainer(containerId: string): Promise<boolean> {
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    return true;
  } catch (error) {
    console.error(`Failed to stop container ${containerId}:`, error);
    return false;
  }
}

export async function restartContainer(containerId: string): Promise<boolean> {
  try {
    const container = docker.getContainer(containerId);
    await container.restart();
    return true;
  } catch (error) {
    console.error(`Failed to restart container ${containerId}:`, error);
    return false;
  }
}
```

### Step 4: Create Tests

Create `src/lib/clients/docker.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDockerStatus, listContainers } from './docker';

// Note: These are integration tests that require Docker
// For CI, mock dockerode

describe('Docker Client', () => {
  describe('getDockerStatus', () => {
    it('returns status object', async () => {
      const status = await getDockerStatus();
      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('containers');
      expect(status.containers).toHaveProperty('total');
      expect(status.containers).toHaveProperty('running');
    });
  });

  describe('listContainers', () => {
    it('returns array of containers', async () => {
      const containers = await listContainers();
      expect(Array.isArray(containers)).toBe(true);
      // If Docker is available and has containers
      if (containers.length > 0) {
        expect(containers[0]).toHaveProperty('id');
        expect(containers[0]).toHaveProperty('name');
        expect(containers[0]).toHaveProperty('state');
      }
    });
  });
});
```

---

## Files Created/Modified

- `src/lib/types/docker.ts` - Docker type definitions
- `src/lib/clients/docker.ts` - Docker client implementation
- `src/lib/clients/docker.test.ts` - Client tests
- `package.json` - Added dockerode dependency

---

## Notes

- Docker socket path assumes Linux default (`/var/run/docker.sock`)
- User running the app needs access to Docker socket
- To grant access: `sudo usermod -aG docker $USER`
- Container stats calculation follows Docker's official algorithm

---

## Validation Steps

1. Ensure Docker is running: `docker ps`
2. Run tests: `npm run test:run`
3. Test manually in Node.js REPL or create a test script

---

## Commit Message

```
[claude] Task-09: Implement Docker API client

- Added dockerode library
- Created Docker client with container operations
- Implemented container listing and stats retrieval
- Added start/stop/restart container functions
- Defined TypeScript types for Docker data
- Added client tests
```
