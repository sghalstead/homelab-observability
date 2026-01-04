# CLAUDE.md - Project Context for AI Assistants

## Project Overview

This is a homelab observability service that monitors system metrics, Docker containers, systemd services, and Ollama AI workloads. Built with Next.js 14 and TypeScript.

**Current Status:** 8/24 tasks complete (33%) - Phase 2 (Docker Integration)

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
│   └── tasks/               # Individual task specifications
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

### Connection
The database is SQLite with WAL mode, located at `./data/observability.db`.

**From terminal (SQLite CLI):**
```bash
sqlite3 ./data/observability.db

# Useful commands inside sqlite3:
.tables              # List all tables
.schema system_metrics  # Show table schema
SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 5;
.quit                # Exit
```

**From code:**
```typescript
// Import the database client
import { db } from '@/db';
import { systemMetrics } from '@/db/schema';

// Query example
const metrics = await db.select().from(systemMetrics).limit(10);

// Insert example
await db.insert(systemMetrics).values({
  timestamp: new Date(),
  cpuUsage: 45.2,
  cpuTemperature: 55.0,
  memoryTotal: 8000000000,
  memoryUsed: 4000000000,
  memoryPercent: 50.0,
  diskTotal: 100000000000,
  diskUsed: 50000000000,
  diskPercent: 50.0,
});
```

### Schema Tables
- `systemMetrics` - CPU, memory, disk, temperature readings
- `containerMetrics` - Docker container stats (not yet implemented)
- `serviceSnapshots` - Systemd service states (not yet implemented)
- `ollamaMetrics` - Ollama AI workload data (not yet implemented)

### Database Commands
```bash
npm run db:push      # Apply schema to database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio GUI
```

## API Endpoints

### Implemented
- `GET /api/metrics/system` - Current system metrics
- `GET /api/metrics/system/history?hours=24` - Historical metrics

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
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier

# Testing
npm test             # Vitest watch mode
npm run test:run     # Vitest single run
npm run test:e2e     # Playwright E2E tests
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

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `METRICS_COLLECTION_INTERVAL_MS` | `60000` | Collection interval (ms) |
| `METRICS_RETENTION_HOURS` | `168` | Data retention (7 days) |

## Important Patterns

- API routes return `ApiResponse<T>` with `success`, `data`, `error`, `timestamp`
- Collectors are in `src/lib/collectors/` - gather raw data
- Services are in `src/lib/services/` - business logic (storage, scheduling)
- Types are in `src/lib/types/` - shared TypeScript interfaces
- Configuration via `src/lib/config.ts` - reads environment variables
