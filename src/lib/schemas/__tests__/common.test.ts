import { describe, it, expect } from 'vitest';
import {
  z,
  ApiResponseSchema,
  PaginatedResponseSchema,
  PaginationSchema,
  HistoryQuerySchema,
  PaginationQuerySchema,
} from '../index';

describe('ApiResponseSchema', () => {
  const StringDataSchema = z.string();
  const ResponseSchema = ApiResponseSchema(StringDataSchema);

  it('validates a successful response with data', () => {
    const response = {
      success: true,
      data: 'test data',
      timestamp: '2024-01-15T10:30:00.000Z',
    };

    const result = ResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.success).toBe(true);
      expect(result.data.data).toBe('test data');
    }
  });

  it('validates an error response without data', () => {
    const response = {
      success: false,
      error: 'Something went wrong',
      timestamp: '2024-01-15T10:30:00.000Z',
    };

    const result = ResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.success).toBe(false);
      expect(result.data.error).toBe('Something went wrong');
      expect(result.data.data).toBeUndefined();
    }
  });

  it('rejects response missing required fields', () => {
    const response = {
      data: 'test data',
    };

    const result = ResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects invalid timestamp format', () => {
    const response = {
      success: true,
      data: 'test',
      timestamp: 'not-a-valid-timestamp',
    };

    const result = ResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});

describe('PaginationSchema', () => {
  it('validates correct pagination metadata', () => {
    const pagination = {
      total: 100,
      page: 1,
      limit: 20,
      hasMore: true,
    };

    const result = PaginationSchema.safeParse(pagination);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(pagination);
    }
  });

  it('rejects negative total', () => {
    const pagination = {
      total: -1,
      page: 1,
      limit: 20,
      hasMore: false,
    };

    const result = PaginationSchema.safeParse(pagination);
    expect(result.success).toBe(false);
  });

  it('rejects zero page number', () => {
    const pagination = {
      total: 100,
      page: 0,
      limit: 20,
      hasMore: true,
    };

    const result = PaginationSchema.safeParse(pagination);
    expect(result.success).toBe(false);
  });

  it('rejects zero limit', () => {
    const pagination = {
      total: 100,
      page: 1,
      limit: 0,
      hasMore: true,
    };

    const result = PaginationSchema.safeParse(pagination);
    expect(result.success).toBe(false);
  });
});

describe('PaginatedResponseSchema', () => {
  const ItemSchema = z.object({ id: z.number(), name: z.string() });
  const ResponseSchema = PaginatedResponseSchema(ItemSchema);

  it('validates a paginated response', () => {
    const response = {
      success: true,
      data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      timestamp: '2024-01-15T10:30:00.000Z',
      pagination: {
        total: 50,
        page: 1,
        limit: 20,
        hasMore: true,
      },
    };

    const result = ResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toHaveLength(2);
      expect(result.data.pagination.total).toBe(50);
    }
  });

  it('validates data as array of items', () => {
    const response = {
      success: true,
      data: [{ id: 'not-a-number', name: 'Item' }],
      timestamp: '2024-01-15T10:30:00.000Z',
      pagination: {
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      },
    };

    const result = ResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});

describe('HistoryQuerySchema', () => {
  it('validates hours parameter', () => {
    const query = { hours: 48 };
    const result = HistoryQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hours).toBe(48);
    }
  });

  it('coerces string to number', () => {
    const query = { hours: '24' };
    const result = HistoryQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hours).toBe(24);
    }
  });

  it('provides default value for hours', () => {
    const query = {};
    const result = HistoryQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hours).toBe(24);
    }
  });

  it('rejects negative hours', () => {
    const query = { hours: -1 };
    const result = HistoryQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
  });

  it('rejects zero hours', () => {
    const query = { hours: 0 };
    const result = HistoryQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
  });

  it('rejects non-integer hours', () => {
    const query = { hours: 24.5 };
    const result = HistoryQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
  });
});

describe('PaginationQuerySchema', () => {
  it('validates page and limit parameters', () => {
    const query = { page: 2, limit: 50 };
    const result = PaginationQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it('coerces strings to numbers', () => {
    const query = { page: '3', limit: '25' };
    const result = PaginationQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
    }
  });

  it('provides default values', () => {
    const query = {};
    const result = PaginationQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('rejects limit over 100', () => {
    const query = { page: 1, limit: 101 };
    const result = PaginationQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
  });

  it('rejects zero page', () => {
    const query = { page: 0, limit: 20 };
    const result = PaginationQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
  });
});
