# CLAUDE.md - Project Context for AI Assistants

## Project Overview

This is a homelab observability service that monitors system metrics, Docker containers, systemd services, and Ollama AI workloads. Built with Next.js 14 and TypeScript.

## Development Approach

This project follows **Spec-Driven Development (SDD)** and **Test-Driven Development (TDD)**:

1. Document behavior first (task files in `docs/tasks/`)
2. Write tests for the specified behavior
3. Implement code to pass tests
4. Validate with tests before committing

## Project Structure

```
homelab-observability/
├── docs/
│   ├── project-plan.md      # Master plan with 24 tasks across 7 phases
│   ├── task-approach.md     # Development standards, commit format, DoD
│   └── tasks/               # Individual task specifications (task-01.md to task-24.md)
├── src/                     # Source code (Next.js App Router)
│   ├── app/                 # Pages and API routes
│   ├── components/          # React components
│   ├── lib/                 # Utilities, clients, collectors
│   ├── hooks/               # React Query hooks
│   ├── db/                  # Drizzle schema and client
│   └── providers/           # React context providers
└── data/                    # SQLite database (gitignored)
```

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run Vitest tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # ESLint
npm run db:push      # Apply database schema
npm run db:studio    # Open Drizzle Studio
```

## Commit Convention

- Format: `[claude] Task-NN: Brief description`
- One task = one commit (squash intermediate work)
- Update task status in `docs/project-plan.md` before committing
- All tests must pass before committing

## Task Execution Workflow

1. Read the task file in `docs/tasks/task-NN.md`
2. Verify dependencies are complete
3. Write tests first (TDD)
4. Implement the feature
5. Run validation (tests, lint, type-check)
6. Update task status in `docs/project-plan.md`
7. Commit with standardized message

## Current Status

Check `docs/project-plan.md` for:
- Current phase and task in progress
- Completed vs pending tasks
- Dependencies between tasks

## Tech Stack Details

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Next.js 14 | App Router, Server Components |
| Language | TypeScript | Strict mode enabled |
| Database | SQLite | Via Drizzle ORM, WAL mode |
| UI | shadcn/ui | Tailwind-based components |
| Charts | Recharts | Time-series visualization |
| State | React Query | Auto-refresh, caching |
| Testing | Vitest + Playwright | Unit/integration + E2E |

## External Integrations

- **Docker**: Via `dockerode` library, requires socket access
- **Systemd**: Via `systemctl` commands
- **Ollama**: Via REST API (default: http://localhost:11434)

## Environment Variables

```env
METRICS_COLLECTION_INTERVAL_MS=60000  # Collection interval
METRICS_RETENTION_HOURS=168           # Data retention (7 days)
OLLAMA_HOST=http://localhost:11434    # Ollama API URL
MONITORED_SERVICES=docker,ollama      # Systemd services to monitor
```

## Important Patterns

- API routes return `ApiResponse<T>` with `success`, `data`, `error`, `timestamp`
- Collectors are in `src/lib/collectors/`
- External clients are in `src/lib/clients/`
- React Query hooks are in `src/hooks/`
- All database operations use Drizzle ORM
