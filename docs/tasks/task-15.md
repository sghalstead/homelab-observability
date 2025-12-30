# Task-15: Implement Ollama API Client

**Phase:** PHASE 4 - AI Workload Monitoring
**Status:** Pending
**Dependencies:** Task-04

---

## Objective

Create an Ollama API client to retrieve server status, available models, and running inference information.

---

## Definition of Done

- [ ] Ollama client created using fetch API
- [ ] Server status check implemented
- [ ] Model listing function implemented
- [ ] Running model detection implemented
- [ ] TypeScript types defined
- [ ] Graceful handling when Ollama is not running
- [ ] Unit tests for client functions

---

## Implementation Details

### Step 1: Create Ollama Types

Create `src/lib/types/ollama.ts`:

```typescript
export interface OllamaModel {
  name: string;
  modifiedAt: Date;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    parameterSize: string;
    quantizationLevel: string;
  };
}

export interface OllamaRunningModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  expiresAt: Date;
  sizeVram: number;
}

export interface OllamaStatus {
  available: boolean;
  version?: string;
  models: OllamaModel[];
  running: OllamaRunningModel[];
  error?: string;
}

export interface OllamaGenerateStatus {
  model: string;
  createdAt: Date;
  done: boolean;
}
```

### Step 2: Create Environment Configuration

Add to `.env.local`:

```env
# Ollama API configuration
OLLAMA_HOST=http://localhost:11434
```

Update `src/lib/config.ts`:

```typescript
export const config = {
  metrics: {
    collectionIntervalMs: parseInt(
      process.env.METRICS_COLLECTION_INTERVAL_MS || '60000',
      10
    ),
    retentionHours: parseInt(
      process.env.METRICS_RETENTION_HOURS || '168',
      10
    ),
  },
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
  },
};
```

### Step 3: Create Ollama Client

Create `src/lib/clients/ollama.ts`:

```typescript
import { config } from '@/lib/config';
import type { OllamaModel, OllamaRunningModel, OllamaStatus } from '@/lib/types/ollama';

const OLLAMA_HOST = config.ollama.host;
const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${OLLAMA_HOST}/api/version`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getOllamaVersion(): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(`${OLLAMA_HOST}/api/version`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.version || null;
  } catch {
    return null;
  }
}

export async function listOllamaModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetchWithTimeout(`${OLLAMA_HOST}/api/tags`);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.models || []).map((model: any) => ({
      name: model.name,
      modifiedAt: new Date(model.modified_at),
      size: model.size,
      digest: model.digest,
      details: {
        format: model.details?.format || 'unknown',
        family: model.details?.family || 'unknown',
        parameterSize: model.details?.parameter_size || 'unknown',
        quantizationLevel: model.details?.quantization_level || 'unknown',
      },
    }));
  } catch {
    return [];
  }
}

export async function getRunningModels(): Promise<OllamaRunningModel[]> {
  try {
    const response = await fetchWithTimeout(`${OLLAMA_HOST}/api/ps`);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.models || []).map((model: any) => ({
      name: model.name,
      model: model.model,
      size: model.size,
      digest: model.digest,
      expiresAt: new Date(model.expires_at),
      sizeVram: model.size_vram || 0,
    }));
  } catch {
    return [];
  }
}

export async function getOllamaStatus(): Promise<OllamaStatus> {
  try {
    const available = await isOllamaAvailable();

    if (!available) {
      return {
        available: false,
        models: [],
        running: [],
        error: 'Ollama server is not running',
      };
    }

    const [version, models, running] = await Promise.all([
      getOllamaVersion(),
      listOllamaModels(),
      getRunningModels(),
    ]);

    return {
      available: true,
      version: version || undefined,
      models,
      running,
    };
  } catch (error) {
    return {
      available: false,
      models: [],
      running: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### Step 4: Create Tests

Create `src/lib/clients/ollama.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isOllamaAvailable, getOllamaStatus, listOllamaModels } from './ollama';

describe('Ollama Client', () => {
  describe('isOllamaAvailable', () => {
    it('returns boolean', async () => {
      const available = await isOllamaAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('getOllamaStatus', () => {
    it('returns status object with required fields', async () => {
      const status = await getOllamaStatus();
      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('models');
      expect(status).toHaveProperty('running');
      expect(Array.isArray(status.models)).toBe(true);
      expect(Array.isArray(status.running)).toBe(true);
    });
  });

  describe('listOllamaModels', () => {
    it('returns array', async () => {
      const models = await listOllamaModels();
      expect(Array.isArray(models)).toBe(true);
    });
  });
});
```

---

## Files Created/Modified

- `src/lib/types/ollama.ts` - Type definitions
- `src/lib/clients/ollama.ts` - Ollama client
- `src/lib/clients/ollama.test.ts` - Client tests
- `src/lib/config.ts` - Added Ollama configuration
- `.env.local` - Added Ollama host

---

## Notes

- Uses native fetch API (no additional dependencies)
- Implements timeout to prevent hanging if Ollama is unresponsive
- Gracefully handles Ollama being unavailable
- API endpoints based on Ollama REST API documentation

---

## Ollama API Reference

- `GET /api/version` - Server version
- `GET /api/tags` - List local models
- `GET /api/ps` - List running models

---

## Validation Steps

1. Start Ollama: `ollama serve`
2. Run tests: `npm run test:run`
3. Test manually with curl: `curl http://localhost:11434/api/tags`

---

## Commit Message

```
[claude] Task-15: Implement Ollama API client

- Created Ollama client using fetch API
- Added server status and model listing functions
- Implemented running model detection
- Added timeout handling for unresponsive server
- Defined TypeScript types for Ollama data
- Added client tests
```
