import { config } from '@/lib/config';
import type { OllamaModel, OllamaRunningModel, OllamaStatus } from '@/lib/types/ollama';

const OLLAMA_HOST = config.ollama.host;
const TIMEOUT_MS = config.ollama.timeoutMs;

/**
 * Fetch with timeout to prevent hanging if Ollama is unresponsive.
 */
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

/**
 * Check if Ollama server is available.
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${OLLAMA_HOST}/api/version`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get Ollama server version.
 * Returns null if server is unavailable.
 */
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

/**
 * List all locally available Ollama models.
 * Returns empty array if server is unavailable.
 */
export async function listOllamaModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetchWithTimeout(`${OLLAMA_HOST}/api/tags`);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.models || []).map((model: Record<string, unknown>) => ({
      name: model.name as string,
      modifiedAt: new Date(model.modified_at as string),
      size: model.size as number,
      digest: model.digest as string,
      details: {
        format: (model.details as Record<string, unknown>)?.format || 'unknown',
        family: (model.details as Record<string, unknown>)?.family || 'unknown',
        parameterSize: (model.details as Record<string, unknown>)?.parameter_size || 'unknown',
        quantizationLevel:
          (model.details as Record<string, unknown>)?.quantization_level || 'unknown',
      },
    }));
  } catch {
    return [];
  }
}

/**
 * Get currently running/loaded models.
 * Returns empty array if server is unavailable.
 */
export async function getRunningModels(): Promise<OllamaRunningModel[]> {
  try {
    const response = await fetchWithTimeout(`${OLLAMA_HOST}/api/ps`);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.models || []).map((model: Record<string, unknown>) => ({
      name: model.name as string,
      model: model.model as string,
      size: model.size as number,
      digest: model.digest as string,
      expiresAt: new Date(model.expires_at as string),
      sizeVram: (model.size_vram as number) || 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Get comprehensive Ollama server status.
 * Includes availability, version, models, and running inferences.
 */
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
