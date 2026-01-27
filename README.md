# Homelab Observability

A real-time monitoring dashboard for homelab environments, built with Next.js and TypeScript.

## Features

### Implemented
- **System Metrics**: CPU usage, temperature, memory, and disk monitoring
- **Metrics Persistence**: Historical data stored in SQLite with automatic cleanup
- **API Endpoints**: REST API for current and historical metrics

### Planned
- **Docker Monitoring**: Container status, stats, and control
- **Systemd Services**: View and control system services
- **Ollama Integration**: Monitor AI models and active inferences
- **Dashboard UI**: Real-time charts and visualizations

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Next.js 14 | App Router, Server Components |
| Language | TypeScript | Strict mode enabled |
| Database | SQLite | Via Drizzle ORM, WAL mode |
| UI | shadcn/ui | Tailwind-based components |
| Charts | Recharts | Time-series visualization |
| State | React Query | Auto-refresh, caching |
| Testing | Vitest + Playwright | Unit/integration + E2E |

## Project Status

**Progress:** 19/28 tasks complete (68%) - Phase 3 (Systemd Integration) Complete

See [docs/project-plan.md](docs/project-plan.md) for detailed implementation progress.

## Getting Started

```bash
# Install dependencies
npm install

# Initialize the database
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Database

The project uses SQLite with Drizzle ORM. Database files are environment-specific:
- **Development:** `./data/dev.db`
- **Production:** `./data/prod.db`

```bash
# Apply schema changes to database
npm run db:push

# Generate migrations (if needed)
npm run db:generate

# Open Drizzle Studio to browse data
npm run db:studio
```

### Connecting to the Database

**From terminal (SQLite CLI):**
```bash
sqlite3 ./data/dev.db   # Development
sqlite3 ./data/prod.db  # Production
```

**From code:**
```typescript
import { db } from '@/db';
import { systemMetrics } from '@/db/schema';

// Query example
const metrics = await db.select().from(systemMetrics).limit(10);
```

## API Endpoints

### System Metrics
- `GET /api/metrics/system` - Current system metrics (CPU, memory, disk, temperature)
- `GET /api/metrics/system/history?hours=24` - Historical metrics

### Response Format
All API responses use a standard format:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm test                 # Run unit tests (watch mode)
npm run test:run         # Run unit tests once
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI

# Database
npm run db:push          # Apply schema to database
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio

# Documentation
npm run docs:update      # Sync code snippets in WALKTHROUGH.md
npm run docs:verify      # Verify code snippets are up to date

# Production Deployment
npm run deploy           # Build and restart production service
npm run deploy:quick     # Deploy without lint checks
npm run service:restart  # Restart service only
npm run service:status   # Check service status
npm run service:logs     # Follow service logs
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` (dev) / `3001` (prod) | HTTP server port |
| `DATABASE_PATH` | `./data/dev.db` (dev) / `./data/prod.db` (prod) | SQLite database file |
| `METRICS_COLLECTION_INTERVAL_MS` | `60000` | How often to collect metrics (ms) |
| `METRICS_RETENTION_HOURS` | `168` | How long to keep metrics (7 days) |

**Note:** Dev and production use separate databases and ports, allowing both to run simultaneously.

## Production Deployment

The app can run as a systemd service for continuous operation:

```bash
# First-time setup
npm run build                    # Build production bundle
./scripts/service-install.sh     # Install systemd service

# Start the service
sudo systemctl start homelab-observability

# Deploy updates
npm run deploy                   # Build and restart
```

See [Production Deployment Guide](docs/production.md) for detailed setup, troubleshooting, and maintenance instructions.

## Documentation

- [Project Walkthrough](WALKTHROUGH.md) - Comprehensive technical overview
- [Production Guide](docs/production.md) - Deployment, troubleshooting, maintenance
- [Project Plan](docs/project-plan.md) - Task tracker and progress
- [Task Approach](docs/task-approach.md) - Development standards
- [Task Files](docs/tasks/) - Individual task specifications
- [CLAUDE.md](CLAUDE.md) - AI assistant context

## License

MIT
