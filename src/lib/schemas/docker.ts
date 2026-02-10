import { z } from './openapi';

/**
 * Container state enum schema.
 */
export const ContainerStateSchema = z.enum([
  'running',
  'paused',
  'restarting',
  'exited',
  'dead',
  'created',
]);

/**
 * Container port type enum schema.
 */
export const PortTypeSchema = z.enum(['tcp', 'udp']);

/**
 * Container port mapping schema.
 */
export const ContainerPortSchema = z
  .object({
    privatePort: z
      .number()
      .int()
      .positive()
      .openapi({ description: 'Container internal port', example: 80 }),
    publicPort: z
      .number()
      .int()
      .positive()
      .optional()
      .openapi({ description: 'Host-mapped port', example: 8080 }),
    type: PortTypeSchema.openapi({ description: 'Port protocol' }),
  })
  .openapi('ContainerPort');

/**
 * Container information schema.
 * Matches the ContainerInfo interface from src/lib/types/docker.ts.
 */
export const ContainerInfoSchema = z
  .object({
    id: z
      .string()
      .openapi({ description: 'Container short ID (12 chars)', example: 'a1b2c3d4e5f6' }),
    name: z.string().openapi({ description: 'Container name', example: 'nginx-proxy' }),
    image: z.string().openapi({ description: 'Image name', example: 'nginx:latest' }),
    status: z.string().openapi({ description: 'Human-readable status', example: 'Up 3 hours' }),
    state: ContainerStateSchema.openapi({ description: 'Container state' }),
    created: z.coerce.date().openapi({ description: 'When the container was created' }),
    ports: z.array(ContainerPortSchema).openapi({ description: 'Port mappings' }),
  })
  .openapi('ContainerInfo');

/**
 * Container runtime statistics schema.
 * Matches the ContainerStats interface from src/lib/types/docker.ts.
 */
export const ContainerStatsSchema = z
  .object({
    id: z.string().openapi({ description: 'Container short ID', example: 'a1b2c3d4e5f6' }),
    name: z.string().openapi({ description: 'Container name', example: 'nginx-proxy' }),
    cpuPercent: z
      .number()
      .nonnegative()
      .openapi({ description: 'CPU usage percentage', example: 2.5 }),
    memoryUsed: z
      .number()
      .nonnegative()
      .openapi({ description: 'Memory used in bytes', example: 52428800 }),
    memoryLimit: z
      .number()
      .positive()
      .openapi({ description: 'Memory limit in bytes', example: 8589934592 }),
    memoryPercent: z
      .number()
      .nonnegative()
      .openapi({ description: 'Memory usage percentage', example: 0.61 }),
    networkRx: z
      .number()
      .nonnegative()
      .openapi({ description: 'Network bytes received', example: 1048576 }),
    networkTx: z
      .number()
      .nonnegative()
      .openapi({ description: 'Network bytes transmitted', example: 524288 }),
    blockRead: z
      .number()
      .nonnegative()
      .openapi({ description: 'Block I/O bytes read', example: 2097152 }),
    blockWrite: z
      .number()
      .nonnegative()
      .openapi({ description: 'Block I/O bytes written', example: 1048576 }),
  })
  .openapi('ContainerStats');

/**
 * Docker container counts schema.
 */
export const ContainerCountsSchema = z
  .object({
    total: z.number().int().nonnegative().openapi({ description: 'Total containers', example: 5 }),
    running: z
      .number()
      .int()
      .nonnegative()
      .openapi({ description: 'Running containers', example: 3 }),
    paused: z
      .number()
      .int()
      .nonnegative()
      .openapi({ description: 'Paused containers', example: 0 }),
    stopped: z
      .number()
      .int()
      .nonnegative()
      .openapi({ description: 'Stopped containers', example: 2 }),
  })
  .openapi('ContainerCounts');

/**
 * Docker daemon status schema.
 * Matches the DockerStatus interface from src/lib/types/docker.ts.
 */
export const DockerStatusSchema = z
  .object({
    available: z.boolean().openapi({ description: 'Whether Docker daemon is reachable' }),
    version: z.string().optional().openapi({ description: 'Docker version', example: '24.0.7' }),
    containers: ContainerCountsSchema.openapi({ description: 'Container counts by state' }),
    error: z.string().optional().openapi({ description: 'Error message if Docker is unavailable' }),
  })
  .openapi('DockerStatus');

/**
 * Docker container control action schema.
 */
export const ContainerControlActionSchema = z
  .enum(['start', 'stop', 'restart'])
  .openapi('ContainerControlAction');

/**
 * Docker container control result schema.
 */
export const ContainerControlResultSchema = z
  .object({
    success: z.boolean().openapi({ description: 'Whether the action succeeded' }),
    error: z.string().optional().openapi({ description: 'Error message if action failed' }),
  })
  .openapi('ContainerControlResult');

// Type exports inferred from schemas
export type ContainerState = z.infer<typeof ContainerStateSchema>;
export type ContainerPort = z.infer<typeof ContainerPortSchema>;
export type ContainerInfo = z.infer<typeof ContainerInfoSchema>;
export type ContainerStats = z.infer<typeof ContainerStatsSchema>;
export type ContainerCounts = z.infer<typeof ContainerCountsSchema>;
export type DockerStatus = z.infer<typeof DockerStatusSchema>;
export type ContainerControlAction = z.infer<typeof ContainerControlActionSchema>;
export type ContainerControlResult = z.infer<typeof ContainerControlResultSchema>;
