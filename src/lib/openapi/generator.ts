import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Homelab Observability API',
      version: '1.0.0',
      description:
        'API for monitoring homelab system metrics, Docker containers, systemd services, and AI workloads.',
      contact: {
        name: 'Homelab Observability',
        url: 'https://github.com/sghalstead/homelab-observability',
      },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'http://rpi5:3001', description: 'Production' },
    ],
    tags: [
      {
        name: 'Metrics',
        description: 'System metrics collection and history',
      },
      {
        name: 'Services',
        description: 'Systemd service monitoring and control',
      },
    ],
  });
}
