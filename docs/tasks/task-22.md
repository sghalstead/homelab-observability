# Task-22: Build AI Workload Monitoring Components

**Phase:** PHASE 5 - Dashboard UI
**Status:** Complete
**Dependencies:** Task-16, Task-18

---

## Objective

Create React components to display Ollama server status, available models, and running inferences.

---

## Definition of Done

- [x] Ollama API hooks created
- [x] Server status indicator component
- [x] Model list component
- [x] Running models/inferences display
- [x] Auto-refresh working
- [x] Graceful handling when Ollama unavailable

---

## Implementation Details

### Step 1: Create Ollama Hooks

Create `src/hooks/use-ollama.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@/lib/types/api';
import type { OllamaStatus, OllamaModel, OllamaRunningModel } from '@/lib/types/ollama';

async function fetchOllamaStatus(): Promise<OllamaStatus> {
  const response = await fetch('/api/ollama/status');
  const data: ApiResponse<OllamaStatus> = await response.json();
  if (!data.success || !data.data) throw new Error(data.error);
  return data.data;
}

async function fetchOllamaModels(): Promise<OllamaModel[]> {
  const response = await fetch('/api/ollama/models');
  const data: ApiResponse<OllamaModel[]> = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
}

async function fetchRunningModels(): Promise<OllamaRunningModel[]> {
  const response = await fetch('/api/ollama/running');
  const data: ApiResponse<OllamaRunningModel[]> = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
}

export function useOllamaStatus() {
  return useQuery({
    queryKey: ['ollama-status'],
    queryFn: fetchOllamaStatus,
    refetchInterval: 15000,
  });
}

export function useOllamaModels() {
  return useQuery({
    queryKey: ['ollama-models'],
    queryFn: fetchOllamaModels,
    refetchInterval: 30000,
  });
}

export function useRunningModels() {
  return useQuery({
    queryKey: ['ollama-running'],
    queryFn: fetchRunningModels,
    refetchInterval: 5000, // More frequent for active inferences
  });
}
```

### Step 2: Create Model Card Component

Create `src/components/ollama/model-card.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import type { OllamaModel } from '@/lib/types/ollama';

interface ModelCardProps {
  model: OllamaModel;
  isRunning?: boolean;
}

export function ModelCard({ model, isRunning }: ModelCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
        </div>
        {isRunning && <Badge variant="default">Running</Badge>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Size:</span>{' '}
            {formatBytes(model.size)}
          </div>
          <div>
            <span className="text-muted-foreground">Family:</span>{' '}
            {model.details.family}
          </div>
          <div>
            <span className="text-muted-foreground">Parameters:</span>{' '}
            {model.details.parameterSize}
          </div>
          <div>
            <span className="text-muted-foreground">Quantization:</span>{' '}
            {model.details.quantizationLevel}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create Running Model Component

Create `src/components/ollama/running-model.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import type { OllamaRunningModel } from '@/lib/types/ollama';

interface RunningModelProps {
  model: OllamaRunningModel;
}

export function RunningModel({ model }: RunningModelProps) {
  const vramPercent = model.size > 0 ? (model.sizeVram / model.size) * 100 : 0;

  return (
    <Card className="border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
        </div>
        <Badge variant="default">Active</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model Size:</span>
            <span>{formatBytes(model.size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VRAM Used:</span>
            <span>{formatBytes(model.sizeVram)}</span>
          </div>
          {model.sizeVram > 0 && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground text-xs">VRAM Load</span>
                <span className="text-xs">{vramPercent.toFixed(0)}%</span>
              </div>
              <Progress value={vramPercent} className="h-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 4: Create Ollama Overview Component

Create `src/components/dashboard/ollama-overview.tsx`:

```typescript
'use client';

import { useOllamaStatus, useRunningModels } from '@/hooks/use-ollama';
import { ModelCard } from '@/components/ollama/model-card';
import { RunningModel } from '@/components/ollama/running-model';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertCircle, CheckCircle2 } from 'lucide-react';

export function OllamaOverview() {
  const { data: status, isLoading, error } = useOllamaStatus();
  const { data: running } = useRunningModels();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
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

  if (!status?.available) {
    return (
      <Alert>
        <Bot className="h-4 w-4" />
        <AlertTitle>Ollama Unavailable</AlertTitle>
        <AlertDescription>
          Could not connect to Ollama server. Make sure Ollama is running with{' '}
          <code className="bg-muted px-1 rounded">ollama serve</code>
        </AlertDescription>
      </Alert>
    );
  }

  const runningModelNames = new Set(running?.map((r) => r.name) || []);

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ollama Server</CardTitle>
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Online
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{status.version || '-'}</div>
              <div className="text-xs text-muted-foreground">Version</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{status.models.length}</div>
              <div className="text-xs text-muted-foreground">Models</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{running?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Running Models */}
      {running && running.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Inferences</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {running.map((model) => (
              <RunningModel key={model.digest} model={model} />
            ))}
          </div>
        </div>
      )}

      {/* Available Models */}
      {status.models.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Available Models</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {status.models.map((model) => (
              <ModelCard
                key={model.digest}
                model={model}
                isRunning={runningModelNames.has(model.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Update Ollama Page

Update `src/app/ollama/page.tsx`:

```typescript
import { OllamaOverview } from '@/components/dashboard/ollama-overview';

export default function OllamaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Workloads</h1>
        <p className="text-muted-foreground">
          Monitor Ollama models and inferences
        </p>
      </div>
      <OllamaOverview />
    </div>
  );
}
```

---

## Files Created/Modified

- `src/hooks/use-ollama.ts`
- `src/components/ollama/model-card.tsx`
- `src/components/ollama/running-model.tsx`
- `src/components/dashboard/ollama-overview.tsx`
- `src/app/ollama/page.tsx`

---

## Validation Steps

1. Run `npm run dev`
2. Start Ollama: `ollama serve`
3. Navigate to `/ollama`
4. Verify server status shows online
5. Verify models list displays
6. Run a model and verify active inference shows

---

## Commit Message

```
[claude] Task-22: Build AI workload monitoring components

- Created useOllama hooks for status and models
- Added ModelCard component for available models
- Created RunningModel component for active inferences
- Built OllamaOverview with status and model lists
- Updated Ollama page
```
