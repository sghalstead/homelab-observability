import si from 'systeminformation';
import type { SystemMetricsSnapshot } from '@/lib/types/metrics';

export async function collectCpuUsage(): Promise<number> {
  const load = await si.currentLoad();
  return Math.round(load.currentLoad * 100) / 100;
}

export async function collectCpuTemperature(): Promise<number | null> {
  try {
    const temp = await si.cpuTemperature();
    return temp.main !== null ? Math.round(temp.main * 10) / 10 : null;
  } catch {
    return null;
  }
}

export async function collectMemoryUsage(): Promise<{
  total: number;
  used: number;
  percent: number;
}> {
  const mem = await si.mem();
  return {
    total: mem.total,
    used: mem.used,
    percent: Math.round((mem.used / mem.total) * 10000) / 100,
  };
}

export async function collectDiskUsage(): Promise<{
  total: number;
  used: number;
  percent: number;
}> {
  const disks = await si.fsSize();
  // Get root filesystem or first disk
  const rootDisk = disks.find((d) => d.mount === '/') || disks[0];

  if (!rootDisk) {
    return { total: 0, used: 0, percent: 0 };
  }

  return {
    total: rootDisk.size,
    used: rootDisk.used,
    percent: Math.round(rootDisk.use * 100) / 100,
  };
}

export async function collectSystemMetrics(): Promise<SystemMetricsSnapshot> {
  try {
    const [cpuUsage, cpuTemperature, memory, disk] = await Promise.all([
      collectCpuUsage(),
      collectCpuTemperature(),
      collectMemoryUsage(),
      collectDiskUsage(),
    ]);

    return {
      timestamp: new Date(),
      cpu: {
        usage: cpuUsage,
        temperature: cpuTemperature,
      },
      memory,
      disk,
      collected: true,
    };
  } catch (error) {
    return {
      timestamp: new Date(),
      cpu: { usage: 0, temperature: null },
      memory: { total: 0, used: 0, percent: 0 },
      disk: { total: 0, used: 0, percent: 0 },
      collected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
