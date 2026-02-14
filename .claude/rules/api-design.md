# API Design

## Schema Approach: Zod as Single Source of Truth

This project uses Zod schemas for TypeScript types (`z.infer<>`), runtime validation, and OpenAPI spec generation via `@asteasolutions/zod-to-openapi`.

## Two-Layer Schema Design

| Layer | Shape | Location | Example |
|-------|-------|----------|---------|
| Database | Flat columns | `drizzle-zod` auto-generated | `{ cpu_usage: 45.2, memory_total: 8589934592 }` |
| API | Nested objects | `src/lib/schemas/` (manual Zod) | `{ cpu: { usage: 45.2 }, memory: { total: 8589934592 } }` |

These are intentionally different shapes. API schemas are written manually, not derived from DB schemas.

## Key Patterns

- New endpoints must be registered in the OpenAPI registry (`src/lib/openapi/registry.ts`)
- Request parameters must be validated with Zod schemas
- Use `ApiResponseSchema(dataSchema)` wrapper for all endpoint responses
- Swagger UI is served at `/api/docs`, spec at `/api/openapi.json`

## Dependencies

- `zod` — Schema definition and validation
- `@asteasolutions/zod-to-openapi` — OpenAPI generation
- `drizzle-zod` — DB schema to Zod conversion
