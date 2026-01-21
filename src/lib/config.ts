const isDevelopment = process.env.NODE_ENV !== 'production';

export const config = {
  database: {
    path: process.env.DATABASE_PATH || (isDevelopment ? './data/dev.db' : './data/prod.db'),
  },
  metrics: {
    collectionIntervalMs: parseInt(process.env.METRICS_COLLECTION_INTERVAL_MS || '60000', 10),
    retentionHours: parseInt(
      process.env.METRICS_RETENTION_HOURS || '168', // 7 days
      10
    ),
  },
};
