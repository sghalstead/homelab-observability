# Task-10: Create API Routes for Docker Containers

**Phase:** PHASE 2 - Docker Integration
**Status:** Complete
**Dependencies:** Task-09

---

## Objective

Create Next.js API routes to expose Docker container information and control operations via REST endpoints.

---

## Definition of Done

- [ ] GET /api/docker/status endpoint created
- [ ] GET /api/docker/containers endpoint created
- [ ] GET /api/docker/containers/:id/stats endpoint created
- [ ] POST /api/docker/containers/:id/start endpoint created
- [ ] POST /api/docker/containers/:id/stop endpoint created
- [ ] POST /api/docker/containers/:id/restart endpoint created
- [ ] Proper error handling and status codes
- [ ] API tests written and passing

---

## Implementation Details

### Step 1: Create Docker Status Endpoint

Create `src/app/api/docker/status/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getDockerStatus } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';
import type { DockerStatus } from '@/lib/types/docker';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<ApiResponse<DockerStatus>>> {
  try {
    const status = await getDockerStatus();

    return NextResponse.json({
      success: true,
      data: status,
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

### Step 2: Create Container List Endpoint

Create `src/app/api/docker/containers/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { listContainers } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';
import type { ContainerInfo } from '@/lib/types/docker';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ContainerInfo[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get('all') !== 'false';

    const containers = await listContainers(all);

    return NextResponse.json({
      success: true,
      data: containers,
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

### Step 3: Create Container Stats Endpoint

Create `src/app/api/docker/containers/[id]/stats/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getContainerStats } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';
import type { ContainerStats } from '@/lib/types/docker';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<ContainerStats>>> {
  try {
    const stats = await getContainerStats(params.id);

    if (!stats) {
      return NextResponse.json(
        {
          success: false,
          error: 'Container not found or stats unavailable',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stats,
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

### Step 4: Create Container Control Endpoints

Create `src/app/api/docker/containers/[id]/start/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { startContainer } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ started: boolean }>>> {
  try {
    const success = await startContainer(params.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to start container',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { started: true },
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

Create `src/app/api/docker/containers/[id]/stop/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stopContainer } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ stopped: boolean }>>> {
  try {
    const success = await stopContainer(params.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to stop container',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { stopped: true },
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

Create `src/app/api/docker/containers/[id]/restart/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { restartContainer } from '@/lib/clients/docker';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ restarted: boolean }>>> {
  try {
    const success = await restartContainer(params.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to restart container',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { restarted: true },
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

---

## Files Created/Modified

- `src/app/api/docker/status/route.ts`
- `src/app/api/docker/containers/route.ts`
- `src/app/api/docker/containers/[id]/stats/route.ts`
- `src/app/api/docker/containers/[id]/start/route.ts`
- `src/app/api/docker/containers/[id]/stop/route.ts`
- `src/app/api/docker/containers/[id]/restart/route.ts`

---

## API Documentation

### GET /api/docker/status
Returns Docker daemon status and container counts.

### GET /api/docker/containers
Lists all containers.
- Query: `?all=false` to show only running containers

### GET /api/docker/containers/:id/stats
Returns real-time stats for a specific container.

### POST /api/docker/containers/:id/start
Starts a stopped container.

### POST /api/docker/containers/:id/stop
Stops a running container.

### POST /api/docker/containers/:id/restart
Restarts a container.

---

## Validation Steps

1. Run `npm run dev`
2. Test endpoints with curl:
   - `curl http://localhost:3000/api/docker/status`
   - `curl http://localhost:3000/api/docker/containers`
3. Verify JSON responses

---

## Commit Message

```
[claude] Task-10: Create API routes for Docker containers

- Added GET /api/docker/status for daemon info
- Added GET /api/docker/containers for listing
- Added GET /api/docker/containers/:id/stats
- Added container control endpoints (start/stop/restart)
```
