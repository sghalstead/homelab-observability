# Homelab Observability - Project Walkthrough

**Last Updated:** 2026-01-27

This document provides a comprehensive technical walkthrough of the homelab-observability codebase, covering architecture, key implementations, and testing components.

> **Note:** Code snippets in this file are automatically synced from source files using [embedme](https://github.com/zakhenry/embedme). Run `npm run docs:update` to refresh them.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Key Concepts & Frameworks](#key-concepts--frameworks)
4. [Key Code Files](#key-code-files)
5. [Database](#database)
6. [UI Components](#ui-components)
7. [Testing Components](#testing-components)
8. [Data Flow](#data-flow)
9. [Project Structure](#project-structure)

---

## Project Overview

This is a **real-time monitoring dashboard** for homelab environments, built with Next.js 14 and TypeScript. It monitors:

- **System Metrics**: CPU usage, temperature, memory, disk
- **Docker Containers**: Status, stats, and control (planned)
- **Systemd Services**: View and control system services (planned)
- **Ollama AI Workloads**: Monitor AI models and active inferences (planned)

**Current Status:** See [docs/project-plan.md](docs/project-plan.md) for detailed progress.

---

## Architecture

The application follows a clean layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  React Components → React Query Hooks → Recharts Charts     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                              │
│  Next.js API Routes (GET /api/metrics/*)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  Collectors (system.ts) → Storage Service → Scheduler       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  SQLite Database (Drizzle ORM, WAL mode, 30-day retention)  │
└─────────────────────────────────────────────────────────────┘
```

**Background Process:**
- Scheduler runs every 60s (configurable via `METRICS_COLLECTION_INTERVAL_MS`)
- Collects metrics and persists to SQLite
- Hourly cleanup removes data older than retention period (default 30 days)

---

## Key Concepts & Frameworks

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | **Next.js 14** (App Router) | Full-stack React with API routes |
| Language | **TypeScript** (strict mode) | Type safety throughout |
| Database | **SQLite + Drizzle ORM** | Embedded DB with WAL mode |
| Metrics | **systeminformation** | Collects CPU, memory, disk, temp |
| State | **React Query** | Auto-refresh, caching, stale management |
| UI | **shadcn/ui + Tailwind** | Component library with dark mode |
| Charts | **Recharts** | Time-series visualization |
| Testing | **Vitest + Playwright** | Unit/integration + E2E tests |

### Why These Choices?

- **SQLite + WAL Mode**: Lightweight for Raspberry Pi, allows concurrent reads while writing
- **better-sqlite3**: Synchronous driver with better performance than async alternatives
- **Drizzle ORM**: Type-safe queries with zero runtime overhead
- **React Query**: Built-in caching, refetching, and stale data management

---

## Key Code Files

### 1. System Collector (`src/lib/collectors/system.ts`)

Gathers raw system data using the `systeminformation` library:

```ts
// src/lib/collectors/system.ts#L51-L80

export async function collectSystemMetrics(): Promise<SystemMetricsSnapshot> {
  try {
    const [cpuUsage, cpuTemperature, memory, disk] = await Promise.all([
      collectCpuUsage(),
      collectCpuTemperature(),
      collectMemoryUsage(),
      collectDiskUsage(),
    ]);

    return {
      timestamp: new Date(),
      cpu: {
        usage: cpuUsage,
        temperature: cpuTemperature,
      },
      memory,
      disk,
      collected: true,
    };
  } catch (error) {
    return {
      timestamp: new Date(),
      cpu: { usage: 0, temperature: null },
      memory: { total: 0, used: 0, percent: 0 },
      disk: { total: 0, used: 0, percent: 0 },
      collected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Individual collectors:**
- `collectCpuUsage()` - CPU usage percentage (0-100)
- `collectCpuTemperature()` - Temperature in Celsius (or null if unavailable)
- `collectMemoryUsage()` - Total, used, and percent memory
- `collectDiskUsage()` - Root filesystem (/) or first disk

### 2. API Routes (`src/app/api/metrics/`)

**Current System Metrics** (`GET /api/metrics/system`):

```ts
// src/app/api/metrics/system/route.ts#L8-L38

export async function GET(): Promise<NextResponse<ApiResponse<SystemMetricsSnapshot>>> {
  try {
    const metrics = await collectSystemMetrics();

    if (!metrics.collected) {
      return NextResponse.json(
        {
          success: false,
          error: metrics.error || 'Failed to collect metrics',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

**Historical Metrics** (`GET /api/metrics/system/history?hours=24`):
- Queries historical data from database with time range filtering
- Supports query params: `hours` (default 24) and `limit` (default 1000, max 5000)

**Systemd Services API** (`src/app/api/services/`):
- `GET /api/services` - List all monitored services with status
- `GET /api/services/:name` - Detailed info for a specific service
- `POST /api/services/:name/start` - Start a service (requires sudo)
- `POST /api/services/:name/stop` - Stop a service (requires sudo)
- `POST /api/services/:name/restart` - Restart a service (requires sudo)

Services are configured via `MONITORED_SERVICES` environment variable.

### 3. React Query Hooks (`src/hooks/`)

**useSystemMetrics** - Current metrics with 10s auto-refresh:

```ts
// src/hooks/use-system-metrics.ts#L16-L22

export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: fetchSystemMetrics,
    refetchInterval: 10000, // 10 seconds
  });
}
```

**useSystemHistory** - Historical data with 1-minute refresh:

```ts
// src/hooks/use-metrics-history.ts#L12-L18

export function useSystemHistory(hours = 24) {
  return useQuery({
    queryKey: ['system-history', hours],
    queryFn: () => fetchSystemHistory(hours),
    refetchInterval: 60000, // 1 minute
  });
}
```

**useServices** - Systemd services with 15s auto-refresh:

```ts
// src/hooks/use-services.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { ServiceInfo, ServiceDetails, SystemdStatus } from '@/lib/types/systemd';

interface ServicesResponse {
  systemd: SystemdStatus;
  services: ServiceInfo[];
}

async function fetchServices(): Promise<ServicesResponse> {
  const response = await fetch('/api/services');
  const data: ApiResponse<ServicesResponse> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

async function fetchServiceDetails(name: string): Promise<ServiceDetails> {
  const response = await fetch(`/api/services/${name}`);
  const data: ApiResponse<ServiceDetails> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    refetchInterval: 15000,
  });
}

export function useServiceDetails(name: string, enabled = true) {
  return useQuery({
    queryKey: ['service-details', name],
    queryFn: () => fetchServiceDetails(name),
    enabled,
    refetchInterval: 15000,
  });
}

export function useServiceControl() {
  const queryClient = useQueryClient();

  const controlMutation = useMutation({
    mutationFn: async ({
      name,
      action,
    }: {
      name: string;
      action: 'start' | 'stop' | 'restart';
    }) => {
      const res = await fetch(`/api/services/${name}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || `Failed to ${action} service`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return controlMutation;
}

```

**useServiceControl** - Mutation for start/stop/restart:

```ts
// src/hooks/use-services.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { ServiceInfo, ServiceDetails, SystemdStatus } from '@/lib/types/systemd';

interface ServicesResponse {
  systemd: SystemdStatus;
  services: ServiceInfo[];
}

async function fetchServices(): Promise<ServicesResponse> {
  const response = await fetch('/api/services');
  const data: ApiResponse<ServicesResponse> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

async function fetchServiceDetails(name: string): Promise<ServiceDetails> {
  const response = await fetch(`/api/services/${name}`);
  const data: ApiResponse<ServiceDetails> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    refetchInterval: 15000,
  });
}

export function useServiceDetails(name: string, enabled = true) {
  return useQuery({
    queryKey: ['service-details', name],
    queryFn: () => fetchServiceDetails(name),
    enabled,
    refetchInterval: 15000,
  });
}

export function useServiceControl() {
  const queryClient = useQueryClient();

  const controlMutation = useMutation({
    mutationFn: async ({
      name,
      action,
    }: {
      name: string;
      action: 'start' | 'stop' | 'restart';
    }) => {
      const res = await fetch(`/api/services/${name}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || `Failed to ${action} service`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return controlMutation;
}

```

### 4. Services (`src/lib/services/`)

**metrics-storage.ts**:
- `saveSystemMetrics()` - Collects metrics and inserts into database
- `cleanupOldMetrics()` - Deletes metrics older than retention period

**metrics-scheduler.ts**:
- `startMetricsCollection()` - Initializes periodic collection
- Runs immediately on start, then every 60s
- Hourly cleanup of old data

### 5. Configuration (`src/lib/config.ts`)

```ts
// src/lib/config.ts

const isDevelopment = process.env.NODE_ENV !== 'production';

export const config = {
  database: {
    path: process.env.DATABASE_PATH || (isDevelopment ? './data/dev.db' : './data/prod.db'),
  },
  metrics: {
    collectionIntervalMs: parseInt(process.env.METRICS_COLLECTION_INTERVAL_MS || '60000', 10),
    retentionHours: parseInt(
      process.env.METRICS_RETENTION_HOURS || '720', // 30 days
      10
    ),
  },
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    timeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || '5000', 10),
  },
};

```

---

## Database

### Schema (`src/db/schema.ts`)

Four tables defined using Drizzle ORM (showing systemMetrics):

```ts
// src/db/schema.ts#L3-L15

// System metrics table
export const systemMetrics = sqliteTable('system_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  cpuUsage: real('cpu_usage').notNull(),
  cpuTemperature: real('cpu_temperature'),
  memoryTotal: integer('memory_total').notNull(),
  memoryUsed: integer('memory_used').notNull(),
  memoryPercent: real('memory_percent').notNull(),
  diskTotal: integer('disk_total').notNull(),
  diskUsed: integer('disk_used').notNull(),
  diskPercent: real('disk_percent').notNull(),
});
```

Additional tables (stubs for future implementation):
- `containerMetrics` - Docker container stats
- `serviceSnapshots` - Systemd service states
- `ollamaMetrics` - Ollama AI workload data

### Connection (`src/db/index.ts`)

```ts
// src/db/index.ts

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { config } from '@/lib/config';

const sqlite = new Database(config.database.path);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

export * from './schema';

```

### CLI Access

```bash
sqlite3 ./data/dev.db   # Development database
sqlite3 ./data/prod.db  # Production database

# Useful commands:
.tables                    # List all tables
.schema system_metrics     # Show table schema
SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 5;
```

---

## UI Components

### Layout Structure

```
RootLayout (src/app/layout.tsx)
├── ThemeProvider (dark mode support)
├── QueryProvider (React Query)
└── DashboardLayout
    ├── Header
    ├── Sidebar (navigation)
    ├── Main content
    └── Mobile nav
```

### Key Components

**MetricCard** (`src/components/metrics/metric-card.tsx`):
- Displays single metric (CPU, Memory, Temp, Disk)
- Color-coded by percentage: green (0-70%), yellow (70-90%), red (90%+)
- Shows progress bar and skeleton loader during loading

**SystemOverview** (`src/components/dashboard/system-overview.tsx`):
- Displays 4 metric cards in responsive grid
- Uses `useSystemMetrics()` hook

**MetricsHistory** (`src/components/dashboard/metrics-history.tsx`):
- Historical charts with time range selector (1h, 6h, 24h, 7d)
- Two Recharts LineCharts: CPU/Memory/Disk % and Temperature

**SystemMetricsChart** (`src/components/charts/system-metrics-chart.tsx`):
- Recharts LineChart with multiple metrics
- Transforms timestamp to HH:MM format for X-axis

**ServiceCard** (`src/components/services/service-card.tsx`):
- Displays single systemd service with status badge
- Color-coded status: green (active), yellow (inactive), red (failed)
- Control buttons for start/stop/restart with loading states

**ServicesOverview** (`src/components/dashboard/services-overview.tsx`):
- Displays monitored services in responsive grid
- Uses `useServices()` and `useServiceControl()` hooks
- Shows loading skeletons and error states

### Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | SystemOverview | Dashboard with current metrics |
| `/system` | SystemOverview + MetricsHistory | Full monitoring with charts |
| `/docker` | (stub) | Docker container monitoring |
| `/services` | ServicesOverview | Systemd service monitoring and control |
| `/ollama` | (stub) | Ollama AI workload monitoring |

---

## Testing Components

### Unit Tests (Vitest)

**Configuration** (`vitest.config.ts`):
- Environment: jsdom (for React components)
- Setup: `@testing-library/jest-dom`
- Coverage provider: v8

**Test Files:**

| File | Purpose |
|------|---------|
| `src/lib/collectors/system.test.ts` | Tests collector functions against real system data |
| `src/lib/services/metrics-storage.test.ts` | Mocked database operations |
| `src/app/api/metrics/system/route.test.ts` | API route testing |
| `src/app/page.test.tsx` | Basic page render test |

### E2E Tests (Playwright)

**Configuration** (`playwright.config.ts`):
- Test directory: `e2e/`
- Auto-starts dev server
- Chromium-only for speed

**Test Files:**

| File | Purpose |
|------|---------|
| `e2e/home.spec.ts` | Homepage load verification |

### Running Tests

```bash
# Unit tests
npm run test:run     # Single run
npm test             # Watch mode
npm run test:coverage

# E2E tests
npm run test:e2e     # Headless
npm run test:e2e:ui  # With UI
```

---

## Data Flow

### Current Metrics Request

```
Browser → SystemOverview component
       → useSystemMetrics() hook
       → fetch('/api/metrics/system')
       → collectSystemMetrics()
       → systeminformation library
       → System kernel
       → Returns CPU, memory, disk, temp
       → ApiResponse wrapper
       → MetricCard components
       → Rendered UI
```

### Historical Metrics Request

```
Browser → MetricsHistory component
       → useSystemHistory(hours) hook
       → fetch('/api/metrics/system/history?hours=24')
       → Drizzle ORM query
       → SQLite database
       → Array of records
       → Recharts visualization
```

### Background Collection

```
Next.js Startup
       → instrumentation.ts
       → startMetricsCollection()
       → setInterval (every 60s)
       → saveSystemMetrics()
       → collectSystemMetrics()
       → db.insert(systemMetrics)
       → SQLite database
       → Cleanup hourly (delete > 30 days)
```

---

## Project Structure

```
homelab-observability/
├── docs/
│   ├── project-plan.md      # Master plan with tasks
│   ├── task-approach.md     # Development standards
│   └── tasks/               # Individual task specifications
├── e2e/                     # Playwright E2E tests
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   │   ├── internal/    # Startup hooks
│   │   │   └── metrics/     # Metrics endpoints
│   │   ├── page.tsx         # Home page
│   │   └── system/          # System monitoring page
│   ├── components/
│   │   ├── charts/          # Recharts components
│   │   ├── dashboard/       # Dashboard panels
│   │   ├── layout/          # Layout structure
│   │   ├── metrics/         # Metric display cards
│   │   └── ui/              # shadcn/ui components
│   ├── db/
│   │   ├── index.ts         # Database connection
│   │   └── schema.ts        # Drizzle schema
│   ├── hooks/               # React Query hooks
│   ├── lib/
│   │   ├── collectors/      # Data collection
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript interfaces
│   │   ├── config.ts        # Environment config
│   │   └── utils/           # Utility functions
│   ├── providers/           # React context providers
│   └── test/                # Test setup
├── data/                    # SQLite database (gitignored)
├── CLAUDE.md                # AI assistant context
├── README.md                # Project documentation
└── WALKTHROUGH.md           # This file
```

---

## Related Documentation

- [README.md](README.md) - Quick start and commands
- [CLAUDE.md](CLAUDE.md) - AI assistant context
- [docs/project-plan.md](docs/project-plan.md) - Task tracker
- [docs/task-approach.md](docs/task-approach.md) - Development standards
