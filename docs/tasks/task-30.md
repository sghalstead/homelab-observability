# Task-30: API Schema Foundation

**Phase:** PHASE 9 - API Specification
**Status:** Not Started
**Dependencies:** Task-29

---

## Objective

Set up Zod schema infrastructure and define core wrapper schemas for the API specification system.

---

## Definition of Done

- [ ] Dependencies installed (zod, @asteasolutions/zod-to-openapi, drizzle-zod)
- [ ] Schema directory structure created
- [ ] `ApiResponse<T>` wrapper defined as Zod schema
- [ ] `PaginatedResponse<T>` wrapper defined as Zod schema
- [ ] Common query parameter schemas defined (hours, limit, etc.)
- [ ] Unit tests for schema validation

---

## Implementation

### 1. Install Dependencies

```bash
npm install zod @asteasolutions/zod-to-openapi drizzle-zod
```

### 2. Create Directory Structure

```
src/lib/schemas/
├── index.ts         # Re-exports
├── common.ts        # ApiResponse, pagination, query params
└── openapi.ts       # OpenAPI extension setup
```

### 3. Define Common Schemas

**src/lib/schemas/openapi.ts**
```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export { z };
```

**src/lib/schemas/common.ts**
```typescript
import { z } from './openapi';

// Generic API response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: z.string().datetime(),
  });

// Pagination metadata
export const PaginationSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
}).openapi('Pagination');

// Common query parameters
export const HistoryQuerySchema = z.object({
  hours: z.coerce.number().int().positive().default(24),
}).openapi('HistoryQuery');
```

---

## Validation Steps

1. `npm install` completes without errors
2. Schema files pass TypeScript compilation
3. Unit tests pass for schema validation
4. `npm run build` succeeds

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `package.json` | Add dependencies |
| `src/lib/schemas/openapi.ts` | Create |
| `src/lib/schemas/common.ts` | Create |
| `src/lib/schemas/index.ts` | Create |
| `src/lib/schemas/__tests__/common.test.ts` | Create |

---

## Commit Message

[claude] Task-30: API schema foundation with Zod setup
