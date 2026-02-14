# Code Style

- TypeScript strict mode — no `any` unless absolutely necessary with a comment explaining why
- Use ES modules (`import`/`export`), not CommonJS (`require`)
- Follow existing code style in the project; don't refactor surrounding code
- Write clear, self-documenting code; add comments only for non-obvious logic
- All API routes return `ApiResponse<T>` with `success`, `data`, `error`, `timestamp` fields
- Collectors go in `src/lib/collectors/`, services in `src/lib/services/`, types in `src/lib/types/`
- Schemas go in `src/lib/schemas/` using Zod (see api-design rule for details)
- Configuration via `src/lib/config.ts` — reads environment variables
- Use shadcn/ui components from `src/components/ui/`; add new ones with `npx shadcn@latest add`
