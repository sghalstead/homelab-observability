import { exec } from 'child_process';
import { promisify } from 'util';
import type {
  ServiceInfo,
  ServiceDetails,
  SystemdStatus,
  ServiceControlResult,
} from '@/lib/types/systemd';

const execAsync = promisify(exec);

// Default services to monitor - can be configured via env
const DEFAULT_SERVICES = ['docker', 'ollama', 'nginx', 'postgresql', 'redis', 'ssh'];

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

// Security: Only allow controlling monitored services
export function isAllowedService(serviceName: string): boolean {
  const allowedServices = getMonitoredServices();
  return allowedServices.includes(serviceName);
}

function handleControlError(error: unknown): ServiceControlResult {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (
    message.includes('permission denied') ||
    message.includes('not permitted') ||
    message.includes('Authentication required') ||
    message.includes('Access denied')
  ) {
    return {
      success: false,
      error: 'Permission denied. Service control requires elevated privileges.',
    };
  }
  return { success: false, error: message };
}

export async function startService(serviceName: string): Promise<ServiceControlResult> {
  try {
    await execAsync(`sudo systemctl start ${serviceName}`);
    return { success: true };
  } catch (error) {
    return handleControlError(error);
  }
}

export async function stopService(serviceName: string): Promise<ServiceControlResult> {
  try {
    await execAsync(`sudo systemctl stop ${serviceName}`);
    return { success: true };
  } catch (error) {
    return handleControlError(error);
  }
}

export async function restartService(serviceName: string): Promise<ServiceControlResult> {
  try {
    await execAsync(`sudo systemctl restart ${serviceName}`);
    return { success: true };
  } catch (error) {
    return handleControlError(error);
  }
}
