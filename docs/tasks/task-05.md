# Task-05: Add UI Dependencies (Tailwind, shadcn/ui, Recharts)

**Phase:** PHASE 0 - Project Setup
**Status:** Pending
**Dependencies:** Task-01

---

## Objective

Install and configure UI libraries including shadcn/ui components and Recharts for data visualization.

---

## Definition of Done

- [ ] shadcn/ui initialized with default theme
- [ ] Core UI components installed (Button, Card, etc.)
- [ ] Recharts installed for charts
- [ ] React Query installed for data fetching
- [ ] Sample component renders correctly
- [ ] Dark mode support configured

---

## Implementation Details

### Step 1: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Select options:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### Step 2: Install Core shadcn/ui Components

```bash
npx shadcn@latest add button card badge tabs table skeleton alert progress
```

### Step 3: Install Additional Dependencies

```bash
npm install recharts @tanstack/react-query lucide-react
```

### Step 4: Set Up React Query Provider

Create `src/providers/query-provider.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            refetchInterval: 10 * 1000, // 10 seconds
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Step 5: Update Root Layout

Update `src/app/layout.tsx` to include providers:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Homelab Observability',
  description: 'Monitor your homelab services and metrics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

### Step 6: Create Theme Configuration

Create `src/lib/utils.ts` (if not created by shadcn):

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 7: Install React Query DevTools (dev only)

```bash
npm install -D @tanstack/react-query-devtools
```

### Step 8: Create Sample Component to Verify Setup

Create `src/components/sample-card.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function SampleCard() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          System Status
          <Badge variant="default">Online</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          All systems operational
        </p>
        <Button className="mt-4" size="sm">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Files Created/Modified

- `components.json` - shadcn/ui configuration
- `src/components/ui/*` - shadcn/ui components
- `src/providers/query-provider.tsx` - React Query provider
- `src/components/sample-card.tsx` - Sample component
- `src/app/layout.tsx` - Updated with providers
- `src/lib/utils.ts` - Utility functions
- `tailwind.config.ts` - Updated by shadcn/ui
- `src/app/globals.css` - Updated with CSS variables

---

## Validation Steps

1. Run `npm run dev` - Should start without errors
2. Import and render `SampleCard` on home page
3. Verify styling looks correct
4. Check React Query DevTools appears in dev mode

---

## Notes

- shadcn/ui components are copied to project (not installed as dependency)
- Recharts will be used in Task-23 for historical charts
- React Query provides automatic refetching for real-time updates

---

## Commit Message

```
[claude] Task-05: Add UI dependencies

- Initialized shadcn/ui with default theme
- Added core UI components (Button, Card, Badge, etc.)
- Installed Recharts for data visualization
- Configured React Query with auto-refetch
- Added QueryProvider to app layout
```
