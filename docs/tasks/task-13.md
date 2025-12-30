# Task-13: Create API Routes for Systemd Services

**Phase:** PHASE 3 - Systemd Integration
**Status:** Pending
**Dependencies:** Task-12

---

## Objective

Create Next.js API routes to expose systemd service information via REST endpoints.

---

## Definition of Done

- [ ] GET /api/services endpoint created
- [ ] GET /api/services/:name endpoint created
- [ ] Proper error handling for unavailable services
- [ ] API tests written

---

## Implementation Details

### Step 1: Create Services List Endpoint

Create `src/app/api/services/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { listServices, getSystemdStatus } from '@/lib/clients/systemd';
import type { ApiResponse } from '@/lib/types/api';
import type { ServiceInfo, SystemdStatus } from '@/lib/types/systemd';

export const dynamic = 'force-dynamic';

interface ServicesResponse {
  systemd: SystemdStatus;
  services: ServiceInfo[];
}

export async function GET(): Promise<NextResponse<ApiResponse<ServicesResponse>>> {
  try {
    const [systemdStatus, services] = await Promise.all([
      getSystemdStatus(),
      listServices(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        systemd: systemdStatus,
        services,
      },
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

### Step 2: Create Service Details Endpoint

Create `src/app/api/services/[name]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServiceDetails } from '@/lib/clients/systemd';
import type { ApiResponse } from '@/lib/types/api';
import type { ServiceDetails } from '@/lib/types/systemd';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse<ApiResponse<ServiceDetails>>> {
  try {
    const service = await getServiceDetails(params.name);

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: `Service '${params.name}' not found`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
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

- `src/app/api/services/route.ts` - Services list endpoint
- `src/app/api/services/[name]/route.ts` - Service details endpoint

---

## API Documentation

### GET /api/services
Returns list of monitored services and their status.

**Response:**
```json
{
  "success": true,
  "data": {
    "systemd": {
      "available": true,
      "version": "252"
    },
    "services": [
      {
        "name": "docker",
        "description": "Docker Application Container Engine",
        "loadState": "loaded",
        "activeState": "active",
        "subState": "running",
        "unitFileState": "enabled"
      }
    ]
  }
}
```

### GET /api/services/:name
Returns detailed information about a specific service.

---

## Validation Steps

1. Run `npm run dev`
2. Test: `curl http://localhost:3000/api/services`
3. Test: `curl http://localhost:3000/api/services/docker`

---

## Commit Message

```
[claude] Task-13: Create API routes for systemd services

- Added GET /api/services for listing monitored services
- Added GET /api/services/:name for service details
- Included systemd status in response
```
