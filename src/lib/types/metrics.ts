/**
 * @deprecated Use SystemMetrics from @/lib/schemas instead.
 * This interface will be removed in a future version.
 */
export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage 0-100
    temperature: number | null; // celsius, null if unavailable
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    percent: number; // percentage 0-100
  };
  disk: {
    total: number; // bytes
    used: number; // bytes
    percent: number; // percentage 0-100
  };
}

/**
 * @deprecated Use types from @/lib/schemas instead.
 * This interface will be removed in a future version.
 */
export interface SystemMetricsSnapshot extends SystemMetrics {
  collected: boolean;
  error?: string;
}
