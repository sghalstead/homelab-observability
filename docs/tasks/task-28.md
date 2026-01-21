# Task-28: Segregate Dev and Prod Database Files

**Phase:** PHASE 8 - Production Deployment
**Status:** Complete
**Dependencies:** Task-04 (database setup)

---

## Objective

Configure separate SQLite database files for development and production environments to prevent data conflicts when running both simultaneously.

---

## Definition of Done

- [x] Add `DATABASE_PATH` environment variable support
- [x] Default to environment-specific paths: `./data/dev.db` and `./data/prod.db`
- [x] Update database connection to use configurable path
- [x] Update `.env.production` with production database path
- [x] Create `.env.development` with development database path
- [x] Update documentation (README, production.md)
- [x] Migrate existing data if needed (or document fresh start)
- [x] Tests pass with new configuration

---

## Implementation Details

### Step 1: Update Configuration (`src/lib/config.ts`)

Add database path to config:

```typescript
export const config = {
  database: {
    path: process.env.DATABASE_PATH ||
      (process.env.NODE_ENV === 'production'
        ? './data/prod.db'
        : './data/dev.db'),
  },
  metrics: {
    // ... existing config
  },
};
```

### Step 2: Update Database Connection (`src/db/index.ts`)

Use config for database path:

```typescript
import { config } from '@/lib/config';

const sqlite = new Database(config.database.path);
```

### Step 3: Create Environment Files

**.env.development:**
```bash
DATABASE_PATH=./data/dev.db
```

**.env.production:**
```bash
DATABASE_PATH=./data/prod.db
```

### Step 4: Handle Existing Data

Option A: Start fresh (recommended for clean separation)
- Rename existing `observability.db` to `dev.db`
- Production will create new `prod.db` on first run

Option B: Copy to both
- Copy existing data to both `dev.db` and `prod.db`

### Step 5: Update Documentation

- README.md: Document `DATABASE_PATH` env var
- docs/production.md: Update database section

---

## Files Created/Modified

- `src/lib/config.ts` - Add database.path config
- `src/db/index.ts` - Use config for database path
- `.env.development` - New file with dev database path
- `.env.production` - Add DATABASE_PATH
- `README.md` - Document new env var
- `docs/production.md` - Update database section

---

## Validation Steps

1. Start dev server: `npm run dev`
   - Verify creates/uses `./data/dev.db`
2. Start prod server: `npm run start`
   - Verify creates/uses `./data/prod.db`
3. Run both simultaneously
   - Dev on port 3000 with dev.db
   - Prod on port 3001 with prod.db
4. Verify data isolation (metrics don't cross over)

---

## Rollback Plan

If issues arise:
1. Revert `src/db/index.ts` to hardcoded path
2. Remove environment files
3. Rename database file back to `observability.db`

---

## Notes

- SQLite files are gitignored, so this only affects runtime
- Existing `observability.db` should be migrated to `dev.db`
- Production will start with empty database (fresh metrics collection)

---

## Commit Message

```
[claude] Task-28: Segregate dev and prod database files

- Add DATABASE_PATH environment variable support
- Default to ./data/dev.db (dev) and ./data/prod.db (prod)
- Update config and database connection
- Create .env.development and update .env.production
```
