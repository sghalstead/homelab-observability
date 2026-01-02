import { config } from '@/lib/config';
import { saveSystemMetrics, cleanupOldMetrics } from './metrics-storage';

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
  saveSystemMetrics().catch(console.error);

  // Schedule regular collection
  collectionInterval = setInterval(() => {
    saveSystemMetrics().catch(console.error);
  }, config.metrics.collectionIntervalMs);

  // Schedule cleanup every hour
  cleanupInterval = setInterval(
    () => {
      cleanupOldMetrics()
        .then((deleted) => {
          if (deleted > 0) {
            console.log(`Cleaned up ${deleted} old metric records`);
          }
        })
        .catch(console.error);
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
