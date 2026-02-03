/**
 * Ollama model details structure.
 */
export interface OllamaModelDetails {
  format: string;
  family: string;
  parameterSize: string;
  quantizationLevel: string;
}

/**
 * Ollama model information from /api/tags endpoint.
 */
export interface OllamaModel {
  name: string;
  modifiedAt: Date;
  size: number;
  digest: string;
  details: OllamaModelDetails;
}

/**
 * Running model information from /api/ps endpoint.
 */
export interface OllamaRunningModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  expiresAt: Date;
  sizeVram: number;
}

/**
 * Ollama server status including availability, version, models, and running inferences.
 */
export interface OllamaStatus {
  available: boolean;
  version?: string;
  models: OllamaModel[];
  running: OllamaRunningModel[];
  error?: string;
}

/**
 * Ollama generate/inference status.
 */
export interface OllamaGenerateStatus {
  model: string;
  createdAt: Date;
  done: boolean;
}
