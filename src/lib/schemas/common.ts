import { z } from './openapi';

/**
 * Generic API response wrapper schema factory.
 * Creates a schema for the standard API response format.
 */
export function ApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean().openapi({ description: 'Whether the request succeeded' }),
    data: dataSchema.optional().openapi({ description: 'Response payload' }),
    error: z.string().optional().openapi({ description: 'Error message if success is false' }),
    timestamp: z.string().datetime().openapi({ description: 'ISO 8601 timestamp' }),
  });
}

/**
 * Pagination metadata schema.
 */
export const PaginationSchema = z
  .object({
    total: z.number().int().nonnegative().openapi({ description: 'Total number of items' }),
    page: z.number().int().positive().openapi({ description: 'Current page number (1-indexed)' }),
    limit: z.number().int().positive().openapi({ description: 'Items per page' }),
    hasMore: z.boolean().openapi({ description: 'Whether more pages exist' }),
  })
  .openapi('Pagination');

/**
 * Generic paginated response wrapper schema factory.
 * Creates a schema for paginated API responses.
 */
export function PaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    success: z.boolean().openapi({ description: 'Whether the request succeeded' }),
    data: z.array(itemSchema).optional().openapi({ description: 'Array of items' }),
    error: z.string().optional().openapi({ description: 'Error message if success is false' }),
    timestamp: z.string().datetime().openapi({ description: 'ISO 8601 timestamp' }),
    pagination: PaginationSchema.openapi({ description: 'Pagination metadata' }),
  });
}

/**
 * Query parameters for historical data endpoints.
 */
export const HistoryQuerySchema = z
  .object({
    hours: z.coerce
      .number()
      .int()
      .positive()
      .default(24)
      .openapi({ description: 'Number of hours of history to retrieve', example: 24 }),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(5000)
      .default(1000)
      .openapi({ description: 'Maximum number of records to return (max 5000)', example: 1000 }),
  })
  .openapi('HistoryQuery');

/**
 * Query parameters for paginated list endpoints.
 */
export const PaginationQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1)
      .openapi({ description: 'Page number (1-indexed)', example: 1 }),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20)
      .openapi({ description: 'Items per page (max 100)', example: 20 }),
  })
  .openapi('PaginationQuery');

/**
 * Error response schema for error-only API responses.
 * Used for 4xx and 5xx responses where there is no data payload.
 */
export const ErrorResponseSchema = z
  .object({
    success: z.literal(false).openapi({ description: 'Always false for error responses' }),
    error: z.string().openapi({ description: 'Error message describing what went wrong' }),
    timestamp: z.string().datetime().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('ErrorResponse');

// Type exports inferred from schemas
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
