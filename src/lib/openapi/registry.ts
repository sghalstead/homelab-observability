import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  z,
  ApiResponseSchema,
  ErrorResponseSchema,
  HistoryQuerySchema,
  SystemMetricsSchema,
  SystemMetricsApiSchema,
  ServiceInfoSchema,
  ServiceDetailsSchema,
  ServiceControlResultSchema,
} from '@/lib/schemas';

export const registry = new OpenAPIRegistry();

// Register component schemas
registry.register('SystemMetrics', SystemMetricsSchema);
registry.register('SystemMetricsApi', SystemMetricsApiSchema);
registry.register('ServiceInfo', ServiceInfoSchema);
registry.register('ServiceDetails', ServiceDetailsSchema);
registry.register('ServiceControlResult', ServiceControlResultSchema);
registry.register('ErrorResponse', ErrorResponseSchema);

// ============================================
// System Metrics Endpoints
// ============================================

registry.registerPath({
  method: 'get',
  path: '/api/metrics/system',
  tags: ['Metrics'],
  summary: 'Get current system metrics',
  description: 'Returns the current CPU, memory, and disk metrics for the system.',
  responses: {
    200: {
      description: 'Current system metrics',
      content: {
        'application/json': {
          schema: ApiResponseSchema(SystemMetricsSchema),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/metrics/system/history',
  tags: ['Metrics'],
  summary: 'Get historical system metrics',
  description: 'Returns historical CPU, memory, and disk metrics for the specified time range.',
  request: {
    query: HistoryQuerySchema,
  },
  responses: {
    200: {
      description: 'Historical system metrics',
      content: {
        'application/json': {
          schema: ApiResponseSchema(z.array(SystemMetricsApiSchema)),
        },
      },
    },
    400: {
      description: 'Invalid query parameters',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// ============================================
// Services Endpoints
// ============================================

registry.registerPath({
  method: 'get',
  path: '/api/services',
  tags: ['Services'],
  summary: 'List monitored services',
  description: 'Returns a list of all monitored systemd services with their current status.',
  responses: {
    200: {
      description: 'List of services',
      content: {
        'application/json': {
          schema: ApiResponseSchema(z.array(ServiceInfoSchema)),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/{name}',
  tags: ['Services'],
  summary: 'Get service details',
  description: 'Returns detailed information about a specific systemd service.',
  request: {
    params: z.object({
      name: z.string().openapi({ description: 'Service name', example: 'nginx' }),
    }),
  },
  responses: {
    200: {
      description: 'Service details',
      content: {
        'application/json': {
          schema: ApiResponseSchema(ServiceDetailsSchema),
        },
      },
    },
    404: {
      description: 'Service not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/{name}/start',
  tags: ['Services'],
  summary: 'Start a service',
  description: 'Starts a systemd service. Requires sudo privileges.',
  request: {
    params: z.object({
      name: z.string().openapi({ description: 'Service name', example: 'nginx' }),
    }),
  },
  responses: {
    200: {
      description: 'Service started successfully',
      content: {
        'application/json': {
          schema: ApiResponseSchema(ServiceControlResultSchema),
        },
      },
    },
    404: {
      description: 'Service not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Failed to start service',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/{name}/stop',
  tags: ['Services'],
  summary: 'Stop a service',
  description: 'Stops a systemd service. Requires sudo privileges.',
  request: {
    params: z.object({
      name: z.string().openapi({ description: 'Service name', example: 'nginx' }),
    }),
  },
  responses: {
    200: {
      description: 'Service stopped successfully',
      content: {
        'application/json': {
          schema: ApiResponseSchema(ServiceControlResultSchema),
        },
      },
    },
    404: {
      description: 'Service not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Failed to stop service',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/{name}/restart',
  tags: ['Services'],
  summary: 'Restart a service',
  description: 'Restarts a systemd service. Requires sudo privileges.',
  request: {
    params: z.object({
      name: z.string().openapi({ description: 'Service name', example: 'nginx' }),
    }),
  },
  responses: {
    200: {
      description: 'Service restarted successfully',
      content: {
        'application/json': {
          schema: ApiResponseSchema(ServiceControlResultSchema),
        },
      },
    },
    404: {
      description: 'Service not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Failed to restart service',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
