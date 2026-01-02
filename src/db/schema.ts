import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// System metrics table
export const systemMetrics = sqliteTable('system_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  cpuUsage: real('cpu_usage').notNull(),
  cpuTemperature: real('cpu_temperature'),
  memoryTotal: integer('memory_total').notNull(),
  memoryUsed: integer('memory_used').notNull(),
  memoryPercent: real('memory_percent').notNull(),
  diskTotal: integer('disk_total').notNull(),
  diskUsed: integer('disk_used').notNull(),
  diskPercent: real('disk_percent').notNull(),
});

// Container metrics table
export const containerMetrics = sqliteTable('container_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  containerId: text('container_id').notNull(),
  containerName: text('container_name').notNull(),
  status: text('status').notNull(),
  cpuPercent: real('cpu_percent').notNull(),
  memoryUsed: integer('memory_used').notNull(),
  memoryLimit: integer('memory_limit').notNull(),
  networkRx: integer('network_rx').notNull(),
  networkTx: integer('network_tx').notNull(),
});

// Service status snapshots
export const serviceSnapshots = sqliteTable('service_snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  serviceName: text('service_name').notNull(),
  activeState: text('active_state').notNull(),
  subState: text('sub_state').notNull(),
});

// Ollama metrics
export const ollamaMetrics = sqliteTable('ollama_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  running: integer('running', { mode: 'boolean' }).notNull(),
  modelCount: integer('model_count').notNull(),
  activeInferences: integer('active_inferences').notNull(),
});

// Type exports
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type NewSystemMetric = typeof systemMetrics.$inferInsert;
export type ContainerMetric = typeof containerMetrics.$inferSelect;
export type NewContainerMetric = typeof containerMetrics.$inferInsert;
export type ServiceSnapshot = typeof serviceSnapshots.$inferSelect;
export type NewServiceSnapshot = typeof serviceSnapshots.$inferInsert;
export type OllamaMetric = typeof ollamaMetrics.$inferSelect;
export type NewOllamaMetric = typeof ollamaMetrics.$inferInsert;
