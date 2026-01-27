# CLAUDE.md - Project Context for AI Assistants

## Project Overview

This is a homelab observability service that monitors system metrics, Docker containers, systemd services, and Ollama AI workloads. Built with Next.js 14 and TypeScript.

**Current Status:** 19/28 tasks complete (68%) - Phase 3 Complete

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
│   ├── project-plan.md      # Master plan with 27 tasks across 8 phases
│   ├── task-approach.md     # Development standards, commit format, DoD
│   └── tasks/               # Individual task specifications
├── scripts/
│   └── service-install.sh   # Install systemd service
├── homelab-observability.service  # Systemd unit file
├── src/
│   ├── app/                 # Pages and API routes
│   │   └── api/metrics/     # System metrics endpoints
│   ├── components/          # React components (shadcn/ui)
│   ├── db/                  # Drizzle schema and client
│   ├── lib/
│   │   ├── collectors/      # Data collectors (system.ts)
│   │   ├── services/        # Business logic (metrics-storage.ts)
│   │   ├── types/           # TypeScript types (api.ts, metrics.ts)
│   │   ├── config.ts        # Environment configuration
│   │   └── utils.ts         # Utility functions
│   ├── providers/           # React context providers
│   └── test/                # Test setup
├── data/                    # SQLite database (gitignored)
└── drizzle.config.ts        # Database configuration
```

## Database

SQLite with WAL mode. Files are environment-specific: `./data/dev.db` (dev), `./data/prod.db` (prod).

**Code access:**
```typescript
import { db } from '@/db';
import { systemMetrics } from '@/db/schema';

const metrics = await db.select().from(systemMetrics).limit(10);
```

**Schema tables:** `systemMetrics`, `containerMetrics` (planned), `serviceSnapshots` (planned), `ollamaMetrics` (planned)

**Commands:** `npm run db:push` (apply schema), `npm run db:studio` (GUI)

## API Endpoints

### Implemented
- `GET /api/metrics/system` - Current system metrics
- `GET /api/metrics/system/history?hours=24` - Historical metrics
- `GET /api/services` - List monitored systemd services with status
- `GET /api/services/:name` - Detailed info for a specific service
- `POST /api/services/:name/start` - Start a service (requires sudo)
- `POST /api/services/:name/stop` - Stop a service (requires sudo)
- `POST /api/services/:name/restart` - Restart a service (requires sudo)

### Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

## Key Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm run test:run     # Run tests once
npm run lint         # ESLint
npm run deploy       # Build and restart prod service
```

See README for full command reference.

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
5. Run validation: `npm run test:run && npm run lint && npm run build`
6. Update task status in `docs/project-plan.md`
7. Commit with standardized message

## Tech Stack Details

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Next.js 14 | App Router, Server Components |
| Language | TypeScript | Strict mode enabled |
| Database | SQLite | Via Drizzle ORM, WAL mode |
| Metrics | systeminformation | CPU, memory, disk, temp |
| UI | shadcn/ui | Tailwind-based components |
| Charts | Recharts | Time-series visualization |
| State | React Query | Auto-refresh, caching |
| Testing | Vitest + Playwright | Unit/integration + E2E |

## External Integrations (Planned)

- **Docker**: Via `dockerode` library, requires socket access
- **Systemd**: Via `systemctl` commands
- **Ollama**: Via REST API (default: http://localhost:11434)

## Important Patterns

- API routes return `ApiResponse<T>` with `success`, `data`, `error`, `timestamp`
- Collectors are in `src/lib/collectors/` - gather raw data
- Services are in `src/lib/services/` - business logic (storage, scheduling)
- Types are in `src/lib/types/` - shared TypeScript interfaces
- Configuration via `src/lib/config.ts` - reads environment variables

## Documentation

| Document | Purpose |
|----------|---------|
| README.md | User-facing: getting started, full command reference |
| WALKTHROUGH.md | Deep technical walkthrough of architecture and code |
| docs/production.md | Production deployment and troubleshooting |
| docs/project-plan.md | Task tracker and project progress |
