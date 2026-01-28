# Task-31: Domain Schemas and Validation

**Phase:** PHASE 9 - API Specification
**Status:** Not Started
**Dependencies:** Task-30

---

## Objective

Convert existing TypeScript interfaces to Zod schemas and add runtime validation to API endpoints.

---

## Definition of Done

- [ ] SystemMetrics schema defined with OpenAPI metadata
- [ ] ServiceStatus schema defined with OpenAPI metadata
- [ ] Request validation middleware created
- [ ] At least one endpoint uses schema validation
- [ ] Types inferred from schemas (replace interfaces)
- [ ] All existing tests still pass

---

## Implementation

### 1. Create Domain Schemas

**src/lib/schemas/metrics.ts**
```typescript
import { z } from './openapi';

export const CpuMetricsSchema = z.object({
  usage: z.number().min(0).max(100),
  temperature: z.number().nullable(),
}).openapi('CpuMetrics');

export const MemoryMetricsSchema = z.object({
  total: z.number().nonnegative(),
  used: z.number().nonnegative(),
  percent: z.number().min(0).max(100),
}).openapi('MemoryMetrics');

export const DiskMetricsSchema = z.object({
  total: z.number().nonnegative(),
  used: z.number().nonnegative(),
  percent: z.number().min(0).max(100),
}).openapi('DiskMetrics');

export const SystemMetricsSchema = z.object({
  timestamp: z.coerce.date(),
  cpu: CpuMetricsSchema,
  memory: MemoryMetricsSchema,
  disk: DiskMetricsSchema,
}).openapi('SystemMetrics');

export type SystemMetrics = z.infer<typeof SystemMetricsSchema>;
```

**src/lib/schemas/services.ts**
```typescript
import { z } from './openapi';

export const ServiceStatusSchema = z.object({
  name: z.string(),
  description: z.string(),
  loadState: z.string(),
  activeState: z.enum(['active', 'inactive', 'failed', 'activating', 'deactivating']),
  subState: z.string(),
  unitFileState: z.string(),
}).openapi('ServiceStatus');

export const ServiceControlActionSchema = z.enum(['start', 'stop', 'restart'])
  .openapi('ServiceControlAction');

export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
```

### 2. Add Validation to Endpoints

Update `GET /api/metrics/system/history` to validate query params:

```typescript
import { HistoryQuerySchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = HistoryQuerySchema.safeParse({
    hours: searchParams.get('hours'),
  });

  if (!result.success) {
    return NextResponse.json({
      success: false,
      error: result.error.message,
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }

  const { hours } = result.data;
  // ... rest of handler
}
```

---

## Migration Notes

- Keep existing interfaces in `src/lib/types/` during migration
- Add `// @deprecated - use schema from @/lib/schemas` comments
- Update imports incrementally across codebase

---

## Validation Steps

1. `npm run test:run` - all tests pass
2. `npm run lint` - no errors
3. `npm run build` - succeeds
4. Manual test: invalid query params return 400 with error message

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/schemas/metrics.ts` | Create |
| `src/lib/schemas/services.ts` | Create |
| `src/lib/schemas/index.ts` | Update exports |
| `src/app/api/metrics/system/history/route.ts` | Add validation |
| `src/lib/types/metrics.ts` | Add deprecation notice |

---

## Commit Message

[claude] Task-31: Domain schemas with Zod validation
