# API Specification Decision

**Task:** Task-29 (API Specification Spike)
**Date:** 2026-01-27
**Status:** Decision Made

---

## Decision

**Chosen Approach:** Zod + zod-to-openapi + drizzle-zod

This approach uses Zod schemas as the single source of truth for:
- TypeScript types (via `z.infer<>`)
- Runtime request/response validation
- OpenAPI specification generation

---

## Evaluation Summary

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Zod + zod-to-openapi** | Native TypeScript, runtime validation, integrates with Drizzle, incremental adoption | Requires manual schema definition for API shapes | **Selected** |
| **Manual OpenAPI YAML** | Standard format, editor tooling | No runtime validation, drift risk, duplicate definitions | Rejected |
| **TypeSpec** | Powerful DSL, generates multiple outputs | Learning curve, separate toolchain, overkill for project size | Rejected |

---

## Architecture

### Two-Layer Schema Design

There are two distinct schema concerns:

#### 1. Database Layer (drizzle-zod)

```typescript
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { systemMetrics } from '@/db/schema';

// Auto-generated from Drizzle table definitions
const selectSystemMetricSchema = createSelectSchema(systemMetrics);
const insertSystemMetricSchema = createInsertSchema(systemMetrics);
```

Use cases:
- Validating data before database inserts
- Type-safe query results

#### 2. API Layer (manual Zod schemas)

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// API response schema (nested structure matching current interface)
export const SystemMetricsSchema = z.object({
  timestamp: z.string().datetime(),
  cpu: z.object({
    usage: z.number().min(0).max(100),
    temperature: z.number().nullable(),
  }),
  memory: z.object({
    total: z.number(),
    used: z.number(),
    percent: z.number().min(0).max(100),
  }),
  disk: z.object({
    total: z.number(),
    used: z.number(),
    percent: z.number().min(0).max(100),
  }),
}).openapi('SystemMetrics');

// Infer TypeScript type from schema
export type SystemMetrics = z.infer<typeof SystemMetricsSchema>;
```

Use cases:
- API request validation
- API response typing
- OpenAPI spec generation

### Why Two Layers?

The database stores **flat columns** (`cpu_usage`, `memory_total`) while the API returns **nested objects** (`cpu.usage`, `memory.total`). These are intentionally different shapes:

| Layer | Shape | Example |
|-------|-------|---------|
| Database | Flat | `{ cpu_usage: 45.2, memory_total: 8589934592 }` |
| API | Nested | `{ cpu: { usage: 45.2 }, memory: { total: 8589934592 } }` |

---

## Dependencies

```bash
npm install zod @asteasolutions/zod-to-openapi drizzle-zod
```

| Package | Purpose |
|---------|---------|
| `zod` | Schema definition and validation |
| `@asteasolutions/zod-to-openapi` | OpenAPI generation from Zod |
| `drizzle-zod` | Generate Zod schemas from Drizzle tables |

---

## File Structure

```
src/lib/
├── schemas/
│   ├── index.ts              # Re-exports all schemas
│   ├── common.ts             # ApiResponse, pagination schemas
│   ├── metrics.ts            # SystemMetrics, historical query params
│   └── services.ts           # ServiceStatus, control actions
├── openapi/
│   ├── registry.ts           # OpenAPI registry setup
│   └── generator.ts          # Spec generation logic
└── types/
    ├── api.ts                # Keep for backwards compat during migration
    └── metrics.ts            # Keep for backwards compat during migration
```

---

## Migration Strategy

### Phase 1: Foundation (Task-30)
- Install dependencies
- Create schema directory structure
- Define `ApiResponse` wrapper schema

### Phase 2: Core Schemas (Task-31)
- Convert `SystemMetrics` interface to Zod schema
- Convert `ServiceStatus` interface to Zod schema
- Add request validation to existing endpoints

### Phase 3: OpenAPI Generation (Task-32)
- Set up OpenAPI registry
- Register all schemas and endpoints
- Serve spec at `/api/openapi.json`
- Add Swagger UI at `/api/docs`

---

## Trade-offs Accepted

1. **Manual API schemas** - We accept writing API schemas manually rather than generating from DB schema, because the shapes are intentionally different.

2. **Incremental migration** - Existing TypeScript interfaces remain during migration to avoid breaking changes.

3. **No automatic endpoint registration** - Endpoints are manually registered in the OpenAPI registry. This is acceptable given the small number of endpoints (7 currently).

---

## Answering the Research Questions

| Question | Answer |
|----------|--------|
| **Migration effort** | Moderate - convert ~5 interfaces to Zod schemas |
| **Validation** | Yes - Zod provides runtime validation |
| **Drift prevention** | Types derived from schemas via `z.infer<>` |
| **Tooling** | Swagger UI via `swagger-ui-react` or static generation |
| **Maintenance** | Low - define schema once, types and docs follow |

---

## References

- [Zod Documentation](https://zod.dev/)
- [zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi)
- [drizzle-zod](https://orm.drizzle.team/docs/zod)
