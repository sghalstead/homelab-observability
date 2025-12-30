# Task-02: Set Up Testing Infrastructure

**Phase:** PHASE 0 - Project Setup
**Status:** Pending
**Dependencies:** Task-01

---

## Objective

Configure Vitest for unit/integration testing, React Testing Library for component tests, and Playwright for E2E tests.

---

## Definition of Done

- [ ] Vitest installed and configured
- [ ] React Testing Library installed
- [ ] Playwright installed for E2E tests
- [ ] Test scripts added to package.json
- [ ] Sample tests pass for each testing layer
- [ ] Test coverage reporting configured

---

## Implementation Details

### Step 1: Install Vitest and Related Packages

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Step 2: Create Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Step 3: Create Test Setup File

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

### Step 4: Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Step 5: Create Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 6: Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Step 7: Create Sample Tests

Create `src/app/page.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(document.body).toBeInTheDocument();
  });
});
```

Create `e2e/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Next/);
});
```

---

## Files Created/Modified

- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `src/test/setup.ts` - Test setup file
- `src/app/page.test.tsx` - Sample unit test
- `e2e/home.spec.ts` - Sample E2E test
- `package.json` - Updated scripts

---

## Validation Steps

1. Run `npm test` - Vitest should start in watch mode
2. Run `npm run test:run` - Tests should pass
3. Run `npm run test:e2e` - Playwright tests should pass

---

## Commit Message

```
[claude] Task-02: Set up testing infrastructure

- Configured Vitest for unit/integration tests
- Added React Testing Library
- Set up Playwright for E2E tests
- Added test scripts to package.json
- Created sample tests for each layer
```
