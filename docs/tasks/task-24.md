# Task-24: Final Polish, Error Handling, and Documentation

**Phase:** PHASE 7 - Polish & Documentation
**Status:** Pending
**Dependencies:** All previous tasks

---

## Objective

Final polish including improved error handling, loading states, README documentation, and deployment configuration.

---

## Definition of Done

- [ ] Error boundaries added for graceful failures
- [ ] All loading states have skeleton placeholders
- [ ] Toast notifications for actions (start/stop/restart)
- [ ] README.md with setup and usage instructions
- [ ] Environment variables documented
- [ ] Production build succeeds
- [ ] All tests pass
- [ ] Basic deployment guide

---

## Implementation Details

### Step 1: Add Error Boundary Component

Create `src/components/error-boundary.tsx`:

```typescript
'use client';

import { Component, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => this.setState({ hasError: false })}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

### Step 2: Add Toast Notifications

Install sonner:
```bash
npm install sonner
```

Create `src/components/toast-provider.tsx`:

```typescript
'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
      }}
    />
  );
}
```

Update layout to include ToastProvider.

Update hooks to show toast notifications:

```typescript
// Example update to use-docker.ts
import { toast } from 'sonner';

const startMutation = useMutation({
  mutationFn: async (id: string) => {
    const res = await fetch(`/api/docker/containers/${id}/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start container');
  },
  onSuccess: () => {
    toast.success('Container started');
    queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
  },
  onError: (error) => {
    toast.error(`Failed to start: ${error.message}`);
  },
});
```

### Step 3: Create Overview Dashboard Page

Update `src/app/page.tsx`:

```typescript
import { SystemOverview } from '@/components/dashboard/system-overview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Box, Layers, Bot, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor your homelab at a glance
        </p>
      </div>

      {/* Quick Stats */}
      <SystemOverview />

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/docker">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-2">
              <Box className="h-5 w-5" />
              <CardTitle className="text-sm">Docker Containers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                View and manage running containers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/services">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-2">
              <Layers className="h-5 w-5" />
              <CardTitle className="text-sm">System Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Control systemd services
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ollama">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm">AI Workloads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Monitor Ollama models and inferences
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
```

### Step 4: Create README.md

Create `README.md`:

```markdown
# Homelab Observatory

A real-time monitoring dashboard for homelab environments, built with Next.js and TypeScript.

## Features

- **System Metrics**: CPU, memory, temperature, and disk monitoring
- **Docker Monitoring**: Container status, stats, and control
- **Systemd Services**: View and control system services
- **Ollama Integration**: Monitor AI models and active inferences
- **Historical Data**: Time-series charts with configurable ranges
- **Dark Mode**: Full dark/light theme support
- **Responsive**: Works on desktop and mobile

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for container monitoring)
- Systemd-based Linux (for service monitoring)
- Ollama (optional, for AI workload monitoring)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd homelab-observability

# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev
```

Visit http://localhost:3000

### Environment Variables

Create a `.env.local` file:

```env
# Metrics collection interval (ms)
METRICS_COLLECTION_INTERVAL_MS=60000

# Data retention (hours)
METRICS_RETENTION_HOURS=168

# Ollama server URL
OLLAMA_HOST=http://localhost:11434

# Services to monitor (comma-separated)
MONITORED_SERVICES=docker,ollama,nginx,ssh
```

## Docker Socket Access

For Docker monitoring, ensure the app user has access to the Docker socket:

```bash
sudo usermod -aG docker $USER
```

## Service Control (Optional)

For service start/stop/restart, configure passwordless sudo:

```bash
# /etc/sudoers.d/observability
your-user ALL=(ALL) NOPASSWD: /usr/bin/systemctl start *
your-user ALL=(ALL) NOPASSWD: /usr/bin/systemctl stop *
your-user ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart *
```

## Development

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## Deployment

### Using PM2

```bash
npm run build
pm2 start npm --name "observatory" -- start
```

### Using Docker

```bash
docker build -t homelab-observatory .
docker run -d -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  homelab-observatory
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **State**: React Query

## License

MIT
```

### Step 5: Create Environment Example

Create `.env.example`:

```env
# Metrics Configuration
METRICS_COLLECTION_INTERVAL_MS=60000
METRICS_RETENTION_HOURS=168

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434

# Monitored Services (comma-separated)
MONITORED_SERVICES=docker,ollama,nginx,postgresql,redis,ssh
```

### Step 6: Final Verification

```bash
# Run all checks
npm run lint
npm run type-check
npm run test:run
npm run build
```

---

## Files Created/Modified

- `src/components/error-boundary.tsx`
- `src/components/toast-provider.tsx`
- `src/app/page.tsx` - Overview dashboard
- `README.md` - Documentation
- `.env.example` - Environment template
- Various hook files - Added toast notifications

---

## Validation Steps

1. Run `npm run build` - Should succeed
2. Run `npm run lint` - No errors
3. Run `npm run test:run` - All tests pass
4. Start production build: `npm start`
5. Verify all pages load correctly
6. Test error boundary by introducing an error
7. Verify toast notifications work

---

## Commit Message

```
[claude] Task-24: Final polish, error handling, and documentation

- Added error boundary for graceful failure handling
- Implemented toast notifications for actions
- Created comprehensive README with setup guide
- Added .env.example with all configuration options
- Created overview dashboard page
- Verified production build succeeds
```
