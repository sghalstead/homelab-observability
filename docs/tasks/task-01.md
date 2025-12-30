# Task-01: Initialize Next.js Project with TypeScript

**Phase:** PHASE 0 - Project Setup
**Status:** Complete
**Dependencies:** None (initial task)

---

## Objective

Create a new Next.js 14 project with TypeScript, App Router, and strict mode enabled.

---

## Definition of Done

- [x] Next.js project created with `create-next-app`
- [x] TypeScript strict mode enabled in `tsconfig.json`
- [x] App Router structure in place (`app/` directory)
- [x] Development server starts without errors
- [x] Basic page renders at `http://localhost:3000`
- [x] Git repository initialized with initial commit

---

## Implementation Details

### Step 1: Create Next.js Project

```bash
cd /home/steven/code/observability
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Options to select:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: `@/*`

### Step 2: Configure TypeScript Strict Mode

Update `tsconfig.json` to ensure strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Step 3: Update Package.json

Add project metadata:

```json
{
  "name": "homelab-observability",
  "description": "Observability service for homelab monitoring",
  "version": "0.1.0"
}
```

### Step 4: Verify Setup

```bash
npm run dev
npm run build
npm run lint
```

---

## Files Created/Modified

- `package.json` - Project configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind configuration
- `src/app/` - App Router pages
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Home page

---

## Validation Steps

1. Run `npm run dev` - should start without errors
2. Visit `http://localhost:3000` - should see Next.js welcome page
3. Run `npm run build` - should complete successfully
4. Run `npm run lint` - should pass with no errors

---

## Notes

- Using `src/` directory for better organization
- App Router is the modern Next.js approach
- Tailwind CSS included for styling (used by shadcn/ui)

---

## Commit Message

```
[claude] Task-01: Initialize Next.js project with TypeScript

- Created Next.js 14 project with App Router
- Enabled TypeScript strict mode
- Configured Tailwind CSS
- Set up ESLint
```
