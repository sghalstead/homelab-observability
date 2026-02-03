const isDevelopment = process.env.NODE_ENV !== 'production';

export const config = {
  database: {
    path: process.env.DATABASE_PATH || (isDevelopment ? './data/dev.db' : './data/prod.db'),
  },
  metrics: {
    collectionIntervalMs: parseInt(process.env.METRICS_COLLECTION_INTERVAL_MS || '60000', 10),
    retentionHours: parseInt(
      process.env.METRICS_RETENTION_HOURS || '720', // 30 days
      10
    ),
  },
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    timeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || '5000', 10),
  },
};
