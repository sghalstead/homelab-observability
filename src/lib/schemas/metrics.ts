import { z } from './openapi';

/**
 * CPU metrics schema (nested structure for API responses).
 */
export const CpuMetricsSchema = z
  .object({
    usage: z
      .number()
      .min(0)
      .max(100)
      .openapi({ description: 'CPU usage percentage (0-100)', example: 45.5 }),
    temperature: z
      .number()
      .nullable()
      .openapi({ description: 'CPU temperature in Celsius, null if unavailable', example: 62.3 }),
  })
  .openapi('CpuMetrics');

/**
 * Memory metrics schema (nested structure for API responses).
 */
export const MemoryMetricsSchema = z
  .object({
    total: z
      .number()
      .nonnegative()
      .openapi({ description: 'Total memory in bytes', example: 8589934592 }),
    used: z
      .number()
      .nonnegative()
      .openapi({ description: 'Used memory in bytes', example: 4294967296 }),
    percent: z
      .number()
      .min(0)
      .max(100)
      .openapi({ description: 'Memory usage percentage (0-100)', example: 50.0 }),
  })
  .openapi('MemoryMetrics');

/**
 * Disk metrics schema (nested structure for API responses).
 */
export const DiskMetricsSchema = z
  .object({
    total: z
      .number()
      .nonnegative()
      .openapi({ description: 'Total disk space in bytes', example: 1000000000000 }),
    used: z
      .number()
      .nonnegative()
      .openapi({ description: 'Used disk space in bytes', example: 300000000000 }),
    percent: z
      .number()
      .min(0)
      .max(100)
      .openapi({ description: 'Disk usage percentage (0-100)', example: 30.0 }),
  })
  .openapi('DiskMetrics');

/**
 * System metrics schema (nested structure for API responses).
 * This represents the nested format returned by /api/metrics/system.
 */
export const SystemMetricsSchema = z
  .object({
    timestamp: z.coerce.date().openapi({ description: 'When the metrics were collected' }),
    cpu: CpuMetricsSchema,
    memory: MemoryMetricsSchema,
    disk: DiskMetricsSchema,
  })
  .openapi('SystemMetrics');

/**
 * System metrics schema (flat structure from database).
 * This represents the flat format stored in the database and returned by /api/metrics/system/history.
 */
export const SystemMetricsApiSchema = z
  .object({
    id: z.number().int().positive().openapi({ description: 'Database record ID' }),
    timestamp: z.coerce.date().openapi({ description: 'When the metrics were collected' }),
    cpuUsage: z.number().min(0).max(100).openapi({ description: 'CPU usage percentage (0-100)' }),
    cpuTemperature: z
      .number()
      .nullable()
      .openapi({ description: 'CPU temperature in Celsius, null if unavailable' }),
    memoryTotal: z.number().nonnegative().openapi({ description: 'Total memory in bytes' }),
    memoryUsed: z.number().nonnegative().openapi({ description: 'Used memory in bytes' }),
    memoryPercent: z
      .number()
      .min(0)
      .max(100)
      .openapi({ description: 'Memory usage percentage (0-100)' }),
    diskTotal: z.number().nonnegative().openapi({ description: 'Total disk space in bytes' }),
    diskUsed: z.number().nonnegative().openapi({ description: 'Used disk space in bytes' }),
    diskPercent: z
      .number()
      .min(0)
      .max(100)
      .openapi({ description: 'Disk usage percentage (0-100)' }),
  })
  .openapi('SystemMetricsApi');

// Type exports inferred from schemas
export type CpuMetrics = z.infer<typeof CpuMetricsSchema>;
export type MemoryMetrics = z.infer<typeof MemoryMetricsSchema>;
export type DiskMetrics = z.infer<typeof DiskMetricsSchema>;
export type SystemMetrics = z.infer<typeof SystemMetricsSchema>;
export type SystemMetricsApi = z.infer<typeof SystemMetricsApiSchema>;
