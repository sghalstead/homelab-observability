# Task-20: Build Docker Monitoring Components

**Phase:** PHASE 5 - Dashboard UI
**Status:** Pending
**Dependencies:** Task-10, Task-18

---

## Objective

Create React components to display Docker containers with status, stats, and control actions.

---

## Definition of Done

- [ ] Docker API hooks created
- [ ] Container list component with status indicators
- [ ] Container stats display component
- [ ] Container control buttons (start/stop/restart)
- [ ] Auto-refresh for container list
- [ ] Loading and error states handled
- [ ] Mobile-responsive table/cards

---

## Implementation Details

### Step 1: Create Docker Hooks

Create `src/hooks/use-docker.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { ContainerInfo, ContainerStats, DockerStatus } from '@/lib/types/docker';

async function fetchDockerStatus(): Promise<DockerStatus> {
  const response = await fetch('/api/docker/status');
  const data: ApiResponse<DockerStatus> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

async function fetchContainers(): Promise<ContainerInfo[]> {
  const response = await fetch('/api/docker/containers');
  const data: ApiResponse<ContainerInfo[]> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

async function fetchContainerStats(id: string): Promise<ContainerStats> {
  const response = await fetch(`/api/docker/containers/${id}/stats`);
  const data: ApiResponse<ContainerStats> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

export function useDockerStatus() {
  return useQuery({
    queryKey: ['docker-status'],
    queryFn: fetchDockerStatus,
    refetchInterval: 30000,
  });
}

export function useContainers() {
  return useQuery({
    queryKey: ['docker-containers'],
    queryFn: fetchContainers,
    refetchInterval: 10000,
  });
}

export function useContainerStats(id: string, enabled = true) {
  return useQuery({
    queryKey: ['docker-container-stats', id],
    queryFn: () => fetchContainerStats(id),
    refetchInterval: 10000,
    enabled,
  });
}

export function useContainerControl() {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/docker/containers/${id}/start`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start container');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/docker/containers/${id}/stop`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to stop container');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
    },
  });

  const restartMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/docker/containers/${id}/restart`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to restart container');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker-containers'] });
    },
  });

  return { startMutation, stopMutation, restartMutation };
}
```

### Step 2: Create Container Card Component

Create `src/components/docker/container-card.tsx`:

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Box } from 'lucide-react';
import { useContainerStats, useContainerControl } from '@/hooks/use-docker';
import { formatBytes } from '@/lib/utils/format';
import type { ContainerInfo } from '@/lib/types/docker';

interface ContainerCardProps {
  container: ContainerInfo;
}

export function ContainerCard({ container }: ContainerCardProps) {
  const isRunning = container.state === 'running';
  const { data: stats } = useContainerStats(container.id, isRunning);
  const { startMutation, stopMutation, restartMutation } = useContainerControl();

  const getStateBadge = (state: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      running: 'default',
      exited: 'secondary',
      paused: 'outline',
      dead: 'destructive',
    };
    return variants[state] || 'secondary';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">{container.name}</CardTitle>
        </div>
        <Badge variant={getStateBadge(container.state)}>{container.state}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">{container.image}</p>

        {isRunning && stats && (
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-muted-foreground">CPU:</span>{' '}
              {stats.cpuPercent.toFixed(1)}%
            </div>
            <div>
              <span className="text-muted-foreground">Memory:</span>{' '}
              {formatBytes(stats.memoryUsed)}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isRunning && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => startMutation.mutate(container.id)}
              disabled={startMutation.isPending}
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}
          {isRunning && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => stopMutation.mutate(container.id)}
                disabled={stopMutation.isPending}
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => restartMutation.mutate(container.id)}
                disabled={restartMutation.isPending}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restart
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create Docker Overview Component

Create `src/components/dashboard/docker-overview.tsx`:

```typescript
'use client';

import { useContainers, useDockerStatus } from '@/hooks/use-docker';
import { ContainerCard } from '@/components/docker/container-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Box } from 'lucide-react';

export function DockerOverview() {
  const { data: status, isLoading: statusLoading } = useDockerStatus();
  const { data: containers, isLoading, error } = useContainers();

  if (statusLoading || isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (!status?.available) {
    return (
      <Alert>
        <Box className="h-4 w-4" />
        <AlertTitle>Docker Unavailable</AlertTitle>
        <AlertDescription>
          Could not connect to Docker daemon. Make sure Docker is running.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!containers?.length) {
    return (
      <Alert>
        <Box className="h-4 w-4" />
        <AlertTitle>No Containers</AlertTitle>
        <AlertDescription>No Docker containers found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {containers.map((container) => (
        <ContainerCard key={container.id} container={container} />
      ))}
    </div>
  );
}
```

### Step 4: Update Docker Page

Update `src/app/docker/page.tsx`:

```typescript
import { DockerOverview } from '@/components/dashboard/docker-overview';

export default function DockerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Docker Containers</h1>
        <p className="text-muted-foreground">
          Monitor and control Docker containers
        </p>
      </div>
      <DockerOverview />
    </div>
  );
}
```

---

## Files Created/Modified

- `src/hooks/use-docker.ts`
- `src/components/docker/container-card.tsx`
- `src/components/dashboard/docker-overview.tsx`
- `src/app/docker/page.tsx`

---

## Validation Steps

1. Run `npm run dev`
2. Navigate to `/docker`
3. Verify containers display with status
4. Test start/stop/restart buttons
5. Verify stats update for running containers
6. Test with Docker unavailable

---

## Commit Message

```
[claude] Task-20: Build Docker monitoring components

- Created useDocker hooks with mutations
- Added ContainerCard with stats and controls
- Built DockerOverview grid component
- Updated Docker page with container list
```
