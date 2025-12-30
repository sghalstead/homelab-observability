# Task-04: Set Up Database (SQLite + Drizzle ORM)

**Phase:** PHASE 0 - Project Setup
**Status:** Pending
**Dependencies:** Task-01

---

## Objective

Configure SQLite database with Drizzle ORM for metrics storage, including schema definitions and migrations.

---

## Definition of Done

- [ ] Drizzle ORM installed and configured
- [ ] SQLite driver installed (better-sqlite3)
- [ ] Database schema defined for metrics tables
- [ ] Drizzle Kit configured for migrations
- [ ] Initial migration created and applied
- [ ] Database connection tested

---

## Implementation Details

### Step 1: Install Dependencies

```bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

### Step 2: Create Drizzle Configuration

Create `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/observability.db',
  },
} satisfies Config;
```

### Step 3: Create Database Schema

Create `src/db/schema.ts`:

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

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

// Container metrics table
export const containerMetrics = sqliteTable('container_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  containerId: text('container_id').notNull(),
  containerName: text('container_name').notNull(),
  status: text('status').notNull(),
  cpuPercent: real('cpu_percent').notNull(),
  memoryUsed: integer('memory_used').notNull(),
  memoryLimit: integer('memory_limit').notNull(),
  networkRx: integer('network_rx').notNull(),
  networkTx: integer('network_tx').notNull(),
});

// Service status snapshots
export const serviceSnapshots = sqliteTable('service_snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  serviceName: text('service_name').notNull(),
  activeState: text('active_state').notNull(),
  subState: text('sub_state').notNull(),
});

// Ollama metrics
export const ollamaMetrics = sqliteTable('ollama_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  running: integer('running', { mode: 'boolean' }).notNull(),
  modelCount: integer('model_count').notNull(),
  activeInferences: integer('active_inferences').notNull(),
});

// Type exports
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type NewSystemMetric = typeof systemMetrics.$inferInsert;
export type ContainerMetric = typeof containerMetrics.$inferSelect;
export type NewContainerMetric = typeof containerMetrics.$inferInsert;
export type ServiceSnapshot = typeof serviceSnapshots.$inferSelect;
export type NewServiceSnapshot = typeof serviceSnapshots.$inferInsert;
export type OllamaMetric = typeof ollamaMetrics.$inferSelect;
export type NewOllamaMetric = typeof ollamaMetrics.$inferInsert;
```

### Step 4: Create Database Client

Create `src/db/index.ts`:

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./data/observability.db');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

export * from './schema';
```

### Step 5: Add Database Scripts to package.json

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Step 6: Create Data Directory

```bash
mkdir -p data
echo "data/*.db" >> .gitignore
echo "data/*.db-wal" >> .gitignore
echo "data/*.db-shm" >> .gitignore
```

### Step 7: Generate and Apply Migration

```bash
npm run db:generate
npm run db:push
```

---

## Files Created/Modified

- `drizzle.config.ts` - Drizzle Kit configuration
- `src/db/schema.ts` - Database schema definitions
- `src/db/index.ts` - Database client export
- `data/` - Database directory (gitignored)
- `drizzle/` - Migration files
- `package.json` - Database scripts
- `.gitignore` - Ignore database files

---

## Validation Steps

1. Run `npm run db:generate` - Should create migration files
2. Run `npm run db:push` - Should create database
3. Run `npm run db:studio` - Should open Drizzle Studio (optional)
4. Verify `data/observability.db` exists

---

## Notes

- Using WAL mode for better concurrency
- Schema designed for time-series metrics storage
- Consider adding indexes on timestamp columns for query performance

---

## Commit Message

```
[claude] Task-04: Set up database with SQLite and Drizzle ORM

- Installed Drizzle ORM and better-sqlite3
- Created database schema for metrics tables
- Configured Drizzle Kit for migrations
- Added database management scripts
- Enabled WAL mode for better performance
```
