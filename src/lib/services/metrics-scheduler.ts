import { config } from '@/lib/config';
import {
  saveSystemMetrics,
  cleanupOldMetrics,
  saveOllamaMetrics,
  cleanupOldOllamaMetrics,
} from './metrics-storage';

let collectionInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;
let isRunning = false;

export function startMetricsCollection(): void {
  if (isRunning) {
    console.log('Metrics collection already running');
    return;
  }

  console.log(`Starting metrics collection (interval: ${config.metrics.collectionIntervalMs}ms)`);

  // Collect immediately on start
  collectAllMetrics();

  // Schedule regular collection
  collectionInterval = setInterval(() => {
    collectAllMetrics();
  }, config.metrics.collectionIntervalMs);

  // Schedule cleanup every hour
  cleanupInterval = setInterval(
    () => {
      cleanupAllMetrics();
    },
    60 * 60 * 1000
  );

  isRunning = true;
}

export function stopMetricsCollection(): void {
  if (collectionInterval) {
    clearInterval(collectionInterval);
    collectionInterval = null;
  }
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  isRunning = false;
  console.log('Metrics collection stopped');
}

export function isMetricsCollectionRunning(): boolean {
  return isRunning;
}

async function collectAllMetrics(): Promise<void> {
  const results = await Promise.allSettled([saveSystemMetrics(), saveOllamaMetrics()]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const names = ['system', 'ollama'];
      console.error(`${names[index]} metrics collection failed:`, result.reason);
    }
  });
}

async function cleanupAllMetrics(): Promise<void> {
  const [systemDeleted, ollamaDeleted] = await Promise.all([
    cleanupOldMetrics(),
    cleanupOldOllamaMetrics(),
  ]);

  const total = systemDeleted + ollamaDeleted;
  if (total > 0) {
    console.log(`Cleaned up ${total} old metric records`);
  }
}
