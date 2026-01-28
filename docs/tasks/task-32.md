# Task-32: OpenAPI Spec Generation and Documentation UI

**Phase:** PHASE 9 - API Specification
**Status:** Not Started
**Dependencies:** Task-31

---

## Objective

Generate OpenAPI specification from Zod schemas and serve interactive API documentation.

---

## Definition of Done

- [ ] OpenAPI registry configured with all endpoints
- [ ] Spec served at `GET /api/openapi.json`
- [ ] Swagger UI accessible at `/api/docs`
- [ ] All 7 current endpoints documented
- [ ] Response examples included in spec
- [ ] Spec validates against OpenAPI 3.0 standard

---

## Implementation

### 1. Create OpenAPI Registry

**src/lib/openapi/registry.ts**
```typescript
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { SystemMetricsSchema, HistoryQuerySchema } from '@/lib/schemas';
import { ApiResponseSchema } from '@/lib/schemas/common';

export const registry = new OpenAPIRegistry();

// Register schemas
registry.register('SystemMetrics', SystemMetricsSchema);

// Register endpoints
registry.registerPath({
  method: 'get',
  path: '/api/metrics/system',
  summary: 'Get current system metrics',
  responses: {
    200: {
      description: 'Current system metrics',
      content: {
        'application/json': {
          schema: ApiResponseSchema(SystemMetricsSchema),
        },
      },
    },
  },
});

// ... register all endpoints
```

### 2. Create Spec Generator

**src/lib/openapi/generator.ts**
```typescript
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Homelab Observability API',
      version: '1.0.0',
      description: 'API for monitoring homelab system metrics, services, and workloads',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'http://rpi5:3050', description: 'Production' },
    ],
  });
}
```

### 3. Create API Endpoint

**src/app/api/openapi.json/route.ts**
```typescript
import { NextResponse } from 'next/server';
import { generateOpenApiSpec } from '@/lib/openapi/generator';

export async function GET() {
  const spec = generateOpenApiSpec();
  return NextResponse.json(spec);
}
```

### 4. Add Documentation UI

Option A: Static Swagger UI page
Option B: Use `swagger-ui-react` component

**src/app/api/docs/page.tsx** (if using React component)
```typescript
'use client';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  return <SwaggerUI url="/api/openapi.json" />;
}
```

---

## Endpoints to Document

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/metrics/system | Current system metrics |
| GET | /api/metrics/system/history | Historical metrics |
| GET | /api/services | List services |
| GET | /api/services/:name | Service details |
| POST | /api/services/:name/start | Start service |
| POST | /api/services/:name/stop | Stop service |
| POST | /api/services/:name/restart | Restart service |

---

## Validation Steps

1. `curl http://localhost:3000/api/openapi.json` returns valid JSON
2. Spec passes [Swagger Editor](https://editor.swagger.io/) validation
3. `/api/docs` renders interactive documentation
4. All endpoints testable from Swagger UI
5. `npm run build` succeeds

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/openapi/registry.ts` | Create |
| `src/lib/openapi/generator.ts` | Create |
| `src/lib/openapi/index.ts` | Create |
| `src/app/api/openapi.json/route.ts` | Create |
| `src/app/api/docs/page.tsx` | Create |
| `package.json` | Add swagger-ui-react (if needed) |

---

## Commit Message

[claude] Task-32: OpenAPI spec generation and Swagger UI
