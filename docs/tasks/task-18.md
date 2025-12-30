# Task-18: Create Dashboard Layout and Navigation

**Phase:** PHASE 5 - Dashboard UI
**Status:** Pending
**Dependencies:** Task-05

---

## Objective

Create the main dashboard layout with navigation, header, and responsive design using shadcn/ui components.

---

## Definition of Done

- [ ] Dashboard layout component created
- [ ] Navigation sidebar/header implemented
- [ ] Responsive design for mobile and desktop
- [ ] Theme support (light/dark mode toggle)
- [ ] Loading states and skeleton components
- [ ] Basic routing structure set up

---

## Implementation Details

### Step 1: Create Layout Components

Create `src/components/layout/header.tsx`:

```typescript
'use client';

import { Activity, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6" />
          <span className="font-bold">Homelab Observatory</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

Create `src/components/layout/sidebar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Activity,
  Box,
  Cpu,
  Layers,
  Bot,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: Activity },
  { href: '/system', label: 'System', icon: Cpu },
  { href: '/docker', label: 'Docker', icon: Box },
  { href: '/services', label: 'Services', icon: Layers },
  { href: '/ollama', label: 'Ollama', icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

Create `src/components/layout/mobile-nav.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Activity, Box, Cpu, Layers, Bot } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: Activity },
  { href: '/system', label: 'System', icon: Cpu },
  { href: '/docker', label: 'Docker', icon: Box },
  { href: '/services', label: 'Services', icon: Layers },
  { href: '/ollama', label: 'Ollama', icon: Bot },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 text-xs',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Step 2: Create Theme Provider

Create `src/providers/theme-provider.tsx`:

```typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

Install next-themes:
```bash
npm install next-themes
```

### Step 3: Create Dashboard Layout

Create `src/components/layout/dashboard-layout.tsx`:

```typescript
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
```

### Step 4: Update Root Layout

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Homelab Observatory',
  description: 'Monitor your homelab services and metrics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 5: Create Page Stubs

Create page files for each route:

`src/app/page.tsx` (Overview)
`src/app/system/page.tsx`
`src/app/docker/page.tsx`
`src/app/services/page.tsx`
`src/app/ollama/page.tsx`

Each with basic structure:
```typescript
export default function PageName() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Page Title</h1>
      <p className="text-muted-foreground">Content coming soon...</p>
    </div>
  );
}
```

---

## Files Created/Modified

- `src/components/layout/header.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/layout/dashboard-layout.tsx`
- `src/providers/theme-provider.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/system/page.tsx`
- `src/app/docker/page.tsx`
- `src/app/services/page.tsx`
- `src/app/ollama/page.tsx`

---

## Validation Steps

1. Run `npm run dev`
2. Verify header with theme toggle renders
3. Verify sidebar navigation works on desktop
4. Verify mobile navigation appears on small screens
5. Test dark/light mode toggle

---

## Commit Message

```
[claude] Task-18: Create dashboard layout and navigation

- Added header with theme toggle
- Created sidebar navigation for desktop
- Implemented mobile bottom navigation
- Set up theme provider with next-themes
- Created page stubs for all routes
```
