# CLAUDE.md - Project Context

## Overview

Homelab observability service — monitors system metrics, Docker containers, systemd services, and Ollama AI workloads. Built with Next.js 14 and TypeScript.

## Project Structure

```
homelab-observability/
├── .claude/
│   ├── settings.json          # Shared permissions (committed)
│   ├── settings.local.json    # Personal permissions (gitignored)
│   ├── rules/                 # Auto-loaded rules: code-style, testing, api-design
│   └── skills/                # Task execution skill
├── docs/
│   ├── project-plans/initial-build.md  # Master plan and task tracker
│   └── tasks/                 # Individual task specifications
├── src/
│   ├── app/                   # Pages and API routes
│   ├── components/            # React components (shadcn/ui)
│   ├── db/                    # Drizzle schema and client
│   └── lib/
│       ├── collectors/        # Data collectors (system.ts)
│       ├── schemas/           # Zod schemas for API validation
│       ├── services/          # Business logic (metrics-storage.ts)
│       ├── types/             # TypeScript types (api.ts, metrics.ts)
│       ├── openapi/           # OpenAPI registry and generator
│       └── config.ts          # Environment configuration
├── data/                      # SQLite databases (gitignored)
└── drizzle.config.ts          # Database configuration
```

## Database

SQLite with WAL mode. Environment-specific: `./data/dev.db` (dev), `./data/prod.db` (prod).

```typescript
import { db } from '@/db';
import { systemMetrics } from '@/db/schema';
```

**Tables:** `systemMetrics`, `containerMetrics` (planned), `serviceSnapshots` (planned), `ollamaMetrics` (planned)

**Commands:** `npm run db:push` (apply schema), `npm run db:studio` (GUI)

## API Endpoints

- `GET /api/metrics/system` — Current system metrics
- `GET /api/metrics/system/history?hours=24` — Historical metrics
- `GET /api/services` — List monitored systemd services
- `GET /api/services/:name` — Detailed service info
- `POST /api/services/:name/start|stop|restart` — Service control (requires sudo)
- `GET /api/docker/status` — Docker daemon status
- `GET /api/docker/containers` — List containers (`?all=false` for running only)
- `GET /api/docker/containers/:id/stats` — Container runtime stats
- `POST /api/docker/containers/:id/start|stop|restart` — Container control
- `GET /api/docker/containers/history` — Historical container metrics
- `GET /api/openapi.json` — OpenAPI spec
- `/api/docs` — Swagger UI

## Key Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm run test:run     # Run tests once
npm run lint         # ESLint
npm run deploy       # Build and restart prod service (localhost:3001)
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Database | SQLite via Drizzle ORM (WAL mode) |
| Metrics | systeminformation |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| State | React Query |
| Testing | Vitest + Playwright |
| Validation | Zod + zod-to-openapi |

## External Integrations

- **Docker**: Via `dockerode`, requires `/var/run/docker.sock`
- **Systemd**: Via `systemctl` commands
- **Ollama**: Via REST API at `http://localhost:11434`

## Documentation

| Document | Purpose |
|----------|---------|
| README.md | Getting started, full command reference |
| WALKTHROUGH.md | Deep technical architecture walkthrough |
| docs/production.md | Production deployment and troubleshooting |
| docs/project-plans/initial-build.md | Task tracker and project progress |
