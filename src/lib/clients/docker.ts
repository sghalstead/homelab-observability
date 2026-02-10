import Docker from 'dockerode';
import { config } from '@/lib/config';
import type { ContainerInfo, ContainerStats, DockerStatus } from '@/lib/types/docker';

const docker = new Docker({ socketPath: config.docker.socketPath });

/**
 * Get Docker daemon status including version and container counts.
 * Returns unavailable status if Docker is not reachable.
 */
export async function getDockerStatus(): Promise<DockerStatus> {
  try {
    const [info, version] = await Promise.all([docker.info(), docker.version()]);

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

/**
 * List Docker containers.
 * @param all - If true, include stopped containers. Defaults to true.
 * Returns empty array if Docker is unavailable.
 */
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

/**
 * Get runtime statistics for a specific container.
 * Returns null if the container doesn't exist or stats can't be retrieved.
 */
export async function getContainerStats(containerId: string): Promise<ContainerStats | null> {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    const stats = await container.stats({ stream: false });

    // Calculate CPU percentage
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || 1;
    const cpuPercent = systemCpuDelta > 0 ? (cpuDelta / systemCpuDelta) * cpuCount * 100 : 0;

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
        if (stat.op === 'read' || stat.op === 'Read') blockRead += stat.value;
        if (stat.op === 'write' || stat.op === 'Write') blockWrite += stat.value;
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

/**
 * Start a stopped container.
 * Returns true on success, false on failure.
 */
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

/**
 * Stop a running container.
 * Returns true on success, false on failure.
 */
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

/**
 * Restart a container.
 * Returns true on success, false on failure.
 */
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
