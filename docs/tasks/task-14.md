# Task-14: Add Service Control Endpoints

**Phase:** PHASE 3 - Systemd Integration
**Status:** Pending
**Dependencies:** Task-13

---

## Objective

Add API endpoints to control systemd services (start, stop, restart) with proper authorization checks.

---

## Definition of Done

- [ ] Service control functions added to client
- [ ] POST /api/services/:name/start endpoint created
- [ ] POST /api/services/:name/stop endpoint created
- [ ] POST /api/services/:name/restart endpoint created
- [ ] Authorization/permission checks documented
- [ ] Error handling for permission denied

---

## Implementation Details

### Step 1: Add Control Functions to Client

Update `src/lib/clients/systemd.ts`:

```typescript
// Add these functions to the existing file

export async function startService(serviceName: string): Promise<{ success: boolean; error?: string }> {
  try {
    await execAsync(`sudo systemctl start ${serviceName}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('permission denied') || message.includes('not permitted')) {
      return { success: false, error: 'Permission denied. Service control requires elevated privileges.' };
    }
    return { success: false, error: message };
  }
}

export async function stopService(serviceName: string): Promise<{ success: boolean; error?: string }> {
  try {
    await execAsync(`sudo systemctl stop ${serviceName}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('permission denied') || message.includes('not permitted')) {
      return { success: false, error: 'Permission denied. Service control requires elevated privileges.' };
    }
    return { success: false, error: message };
  }
}

export async function restartService(serviceName: string): Promise<{ success: boolean; error?: string }> {
  try {
    await execAsync(`sudo systemctl restart ${serviceName}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('permission denied') || message.includes('not permitted')) {
      return { success: false, error: 'Permission denied. Service control requires elevated privileges.' };
    }
    return { success: false, error: message };
  }
}

// Security: Only allow controlling monitored services
export function isAllowedService(serviceName: string): boolean {
  const allowedServices = getMonitoredServices();
  return allowedServices.includes(serviceName);
}
```

### Step 2: Create Start Endpoint

Create `src/app/api/services/[name]/start/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { startService, isAllowedService } from '@/lib/clients/systemd';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse<ApiResponse<{ started: boolean }>>> {
  try {
    if (!isAllowedService(params.name)) {
      return NextResponse.json(
        {
          success: false,
          error: `Service '${params.name}' is not in the allowed services list`,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    const result = await startService(params.name);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to start service',
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

### Step 3: Create Stop Endpoint

Create `src/app/api/services/[name]/stop/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stopService, isAllowedService } from '@/lib/clients/systemd';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse<ApiResponse<{ stopped: boolean }>>> {
  try {
    if (!isAllowedService(params.name)) {
      return NextResponse.json(
        {
          success: false,
          error: `Service '${params.name}' is not in the allowed services list`,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    const result = await stopService(params.name);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to stop service',
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

### Step 4: Create Restart Endpoint

Create `src/app/api/services/[name]/restart/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { restartService, isAllowedService } from '@/lib/clients/systemd';
import type { ApiResponse } from '@/lib/types/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse<ApiResponse<{ restarted: boolean }>>> {
  try {
    if (!isAllowedService(params.name)) {
      return NextResponse.json(
        {
          success: false,
          error: `Service '${params.name}' is not in the allowed services list`,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    const result = await restartService(params.name);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to restart service',
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

- `src/lib/clients/systemd.ts` - Added control functions
- `src/app/api/services/[name]/start/route.ts`
- `src/app/api/services/[name]/stop/route.ts`
- `src/app/api/services/[name]/restart/route.ts`

---

## Security Notes

1. **Service Allowlist**: Only services in `MONITORED_SERVICES` can be controlled
2. **Sudo Required**: Service control requires passwordless sudo for the app user
3. **Sudoers Configuration** (if needed):
   ```
   # /etc/sudoers.d/observability
   www-data ALL=(ALL) NOPASSWD: /usr/bin/systemctl start docker
   www-data ALL=(ALL) NOPASSWD: /usr/bin/systemctl stop docker
   www-data ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart docker
   # Add more services as needed
   ```

---

## Validation Steps

1. Run `npm run dev`
2. Test (requires sudo): `curl -X POST http://localhost:3000/api/services/docker/restart`
3. Verify appropriate error messages for unauthorized services

---

## Commit Message

```
[claude] Task-14: Add service control endpoints

- Added start/stop/restart functions to systemd client
- Created control API endpoints
- Implemented service allowlist for security
- Added permission error handling
```
