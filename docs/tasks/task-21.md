# Task-21: Build Systemd Service Management Components

**Phase:** PHASE 5 - Dashboard UI
**Status:** Complete
**Dependencies:** Task-13, Task-18

---

## Objective

Create React components to display and control systemd services.

---

## Definition of Done

- [x] Services API hooks created
- [x] Service list component with status indicators
- [x] Service control buttons (start/stop/restart)
- [x] Service details modal/card
- [x] Auto-refresh for service status
- [x] Loading and error states handled

---

## Implementation Details

### Step 1: Create Services Hooks

Create `src/hooks/use-services.ts`:

```typescript
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
    mutationFn: async ({ name, action }: { name: string; action: 'start' | 'stop' | 'restart' }) => {
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

### Step 2: Create Service Card Component

Create `src/components/services/service-card.tsx`:

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Layers } from 'lucide-react';
import { useServiceControl } from '@/hooks/use-services';
import type { ServiceInfo } from '@/lib/types/systemd';

interface ServiceCardProps {
  service: ServiceInfo;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const controlMutation = useServiceControl();
  const isActive = service.activeState === 'active';
  const isLoaded = service.loadState === 'loaded';

  const getStateBadge = (state: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      failed: 'destructive',
      activating: 'outline',
      deactivating: 'outline',
    };
    return variants[state] || 'secondary';
  };

  if (!isLoaded) {
    return (
      <Card className="opacity-60">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
          </div>
          <Badge variant="outline">not found</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Service not installed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
        </div>
        <Badge variant={getStateBadge(service.activeState)}>
          {service.activeState} ({service.subState})
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {service.description}
        </p>

        <div className="flex gap-2 flex-wrap">
          {!isActive && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => controlMutation.mutate({ name: service.name, action: 'start' })}
              disabled={controlMutation.isPending}
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}
          {isActive && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => controlMutation.mutate({ name: service.name, action: 'stop' })}
                disabled={controlMutation.isPending}
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => controlMutation.mutate({ name: service.name, action: 'restart' })}
                disabled={controlMutation.isPending}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restart
              </Button>
            </>
          )}
        </div>

        {controlMutation.isError && (
          <p className="text-xs text-destructive mt-2">
            {controlMutation.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create Services Overview Component

Create `src/components/dashboard/services-overview.tsx`:

```typescript
'use client';

import { useServices } from '@/hooks/use-services';
import { ServiceCard } from '@/components/services/service-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Layers } from 'lucide-react';

export function ServicesOverview() {
  const { data, isLoading, error } = useServices();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (!data?.systemd.available) {
    return (
      <Alert>
        <Layers className="h-4 w-4" />
        <AlertTitle>Systemd Unavailable</AlertTitle>
        <AlertDescription>
          Could not connect to systemd. This feature requires a systemd-based system.
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.services.map((service) => (
        <ServiceCard key={service.name} service={service} />
      ))}
    </div>
  );
}
```

### Step 4: Update Services Page

Update `src/app/services/page.tsx`:

```typescript
import { ServicesOverview } from '@/components/dashboard/services-overview';

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Services</h1>
        <p className="text-muted-foreground">
          Monitor and control systemd services
        </p>
      </div>
      <ServicesOverview />
    </div>
  );
}
```

---

## Files Created/Modified

- `src/hooks/use-services.ts`
- `src/components/services/service-card.tsx`
- `src/components/dashboard/services-overview.tsx`
- `src/app/services/page.tsx`

---

## Validation Steps

1. Run `npm run dev`
2. Navigate to `/services`
3. Verify services display with status
4. Test start/stop/restart buttons (requires sudo)
5. Verify not-found services show appropriately

---

## Commit Message

```
[claude] Task-21: Build systemd service management components

- Created useServices hooks with control mutations
- Added ServiceCard with status and controls
- Built ServicesOverview grid component
- Updated services page with service list
```
