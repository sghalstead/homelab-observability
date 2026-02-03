import { describe, it, expect } from 'vitest';
import {
  isOllamaAvailable,
  getOllamaVersion,
  listOllamaModels,
  getRunningModels,
  getOllamaStatus,
} from './ollama';

// Note: These tests run against real Ollama server if available
// They are designed to work whether Ollama is running or not

describe('Ollama Client', () => {
  describe('isOllamaAvailable', () => {
    it('returns a boolean', async () => {
      const available = await isOllamaAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('getOllamaVersion', () => {
    it('returns string or null', async () => {
      const version = await getOllamaVersion();
      expect(version === null || typeof version === 'string').toBe(true);
    });
  });

  describe('listOllamaModels', () => {
    it('returns an array', async () => {
      const models = await listOllamaModels();
      expect(Array.isArray(models)).toBe(true);
    });

    it('returns models with correct structure if available', async () => {
      const models = await listOllamaModels();
      if (models.length > 0) {
        const model = models[0];
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('modifiedAt');
        expect(model).toHaveProperty('size');
        expect(model).toHaveProperty('digest');
        expect(model).toHaveProperty('details');
        expect(model.details).toHaveProperty('format');
        expect(model.details).toHaveProperty('family');
        expect(model.details).toHaveProperty('parameterSize');
        expect(model.details).toHaveProperty('quantizationLevel');
      }
    });
  });

  describe('getRunningModels', () => {
    it('returns an array', async () => {
      const running = await getRunningModels();
      expect(Array.isArray(running)).toBe(true);
    });

    it('returns running models with correct structure if available', async () => {
      const running = await getRunningModels();
      if (running.length > 0) {
        const model = running[0];
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('model');
        expect(model).toHaveProperty('size');
        expect(model).toHaveProperty('digest');
        expect(model).toHaveProperty('expiresAt');
        expect(model).toHaveProperty('sizeVram');
      }
    });
  });

  describe('getOllamaStatus', () => {
    it('returns status object with required fields', async () => {
      const status = await getOllamaStatus();
      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('models');
      expect(status).toHaveProperty('running');
      expect(typeof status.available).toBe('boolean');
      expect(Array.isArray(status.models)).toBe(true);
      expect(Array.isArray(status.running)).toBe(true);
    });

    it('includes error message when not available', async () => {
      const status = await getOllamaStatus();
      if (!status.available) {
        expect(status.error).toBeDefined();
        expect(typeof status.error).toBe('string');
      }
    });

    it('includes version when available', async () => {
      const status = await getOllamaStatus();
      if (status.available) {
        expect(status.version).toBeDefined();
        expect(typeof status.version).toBe('string');
      }
    });
  });
});
