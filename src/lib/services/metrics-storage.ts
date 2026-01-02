import { db } from '@/db';
import { systemMetrics } from '@/db/schema';
import { lt } from 'drizzle-orm';
import { collectSystemMetrics } from '@/lib/collectors/system';
import { config } from '@/lib/config';
import type { NewSystemMetric } from '@/db/schema';

export async function saveSystemMetrics(): Promise<boolean> {
  try {
    const metrics = await collectSystemMetrics();

    if (!metrics.collected) {
      console.error('Failed to collect system metrics:', metrics.error);
      return false;
    }

    const record: NewSystemMetric = {
      timestamp: metrics.timestamp,
      cpuUsage: metrics.cpu.usage,
      cpuTemperature: metrics.cpu.temperature,
      memoryTotal: metrics.memory.total,
      memoryUsed: metrics.memory.used,
      memoryPercent: metrics.memory.percent,
      diskTotal: metrics.disk.total,
      diskUsed: metrics.disk.used,
      diskPercent: metrics.disk.percent,
    };

    await db.insert(systemMetrics).values(record);
    return true;
  } catch (error) {
    console.error('Failed to save system metrics:', error);
    return false;
  }
}

export async function cleanupOldMetrics(): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - config.metrics.retentionHours * 60 * 60 * 1000);

    const result = await db.delete(systemMetrics).where(lt(systemMetrics.timestamp, cutoff));

    return result.changes || 0;
  } catch (error) {
    console.error('Failed to cleanup old metrics:', error);
    return 0;
  }
}
