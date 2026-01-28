import { z } from './openapi';

/**
 * Service load state enum schema.
 */
export const LoadStateSchema = z.enum(['loaded', 'not-found', 'bad-setting', 'error', 'masked']);

/**
 * Service active state enum schema.
 */
export const ActiveStateSchema = z.enum([
  'active',
  'reloading',
  'inactive',
  'failed',
  'activating',
  'deactivating',
]);

/**
 * Service unit file state enum schema.
 */
export const UnitFileStateSchema = z.enum([
  'enabled',
  'disabled',
  'static',
  'masked',
  'generated',
  'transient',
  'indirect',
]);

/**
 * Basic service information schema.
 * Matches the ServiceInfo interface from src/lib/types/systemd.ts.
 */
export const ServiceInfoSchema = z
  .object({
    name: z.string().openapi({ description: 'Service unit name', example: 'nginx' }),
    description: z
      .string()
      .openapi({ description: 'Service description', example: 'A high performance web server' }),
    loadState: LoadStateSchema.openapi({
      description: 'Whether the unit configuration has been loaded',
    }),
    activeState: ActiveStateSchema.openapi({
      description: 'Current activation state of the service',
    }),
    subState: z
      .string()
      .openapi({ description: 'Lower-level unit activation state', example: 'running' }),
    unitFileState: UnitFileStateSchema.openapi({ description: 'Unit file preset state' }),
  })
  .openapi('ServiceInfo');

/**
 * Detailed service information schema.
 * Extends ServiceInfo with runtime details.
 * Matches the ServiceDetails interface from src/lib/types/systemd.ts.
 */
export const ServiceDetailsSchema = ServiceInfoSchema.extend({
  mainPid: z
    .number()
    .int()
    .positive()
    .nullable()
    .openapi({ description: 'Main process ID, null if not running', example: 1234 }),
  memoryUsage: z
    .number()
    .nonnegative()
    .nullable()
    .openapi({ description: 'Memory usage in bytes, null if unavailable', example: 52428800 }),
  cpuUsage: z
    .number()
    .min(0)
    .nullable()
    .openapi({ description: 'CPU usage percentage, null if unavailable', example: 0.5 }),
  startedAt: z.coerce
    .date()
    .nullable()
    .openapi({ description: 'When the service was started, null if not running' }),
  uptime: z
    .number()
    .nonnegative()
    .nullable()
    .openapi({ description: 'Uptime in seconds, null if not running', example: 86400 }),
}).openapi('ServiceDetails');

/**
 * Service control action schema.
 */
export const ServiceControlActionSchema = z
  .enum(['start', 'stop', 'restart'])
  .openapi('ServiceControlAction');

/**
 * Service control result schema.
 */
export const ServiceControlResultSchema = z
  .object({
    success: z.boolean().openapi({ description: 'Whether the action succeeded' }),
    error: z.string().optional().openapi({ description: 'Error message if action failed' }),
  })
  .openapi('ServiceControlResult');

// Type exports inferred from schemas
export type LoadState = z.infer<typeof LoadStateSchema>;
export type ActiveState = z.infer<typeof ActiveStateSchema>;
export type UnitFileState = z.infer<typeof UnitFileStateSchema>;
export type ServiceInfo = z.infer<typeof ServiceInfoSchema>;
export type ServiceDetails = z.infer<typeof ServiceDetailsSchema>;
export type ServiceControlAction = z.infer<typeof ServiceControlActionSchema>;
export type ServiceControlResult = z.infer<typeof ServiceControlResultSchema>;
