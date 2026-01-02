import { NextResponse } from 'next/server';
import {
  startMetricsCollection,
  isMetricsCollectionRunning,
} from '@/lib/services/metrics-scheduler';

// This endpoint is called on app startup to initialize background tasks
export async function GET() {
  if (!isMetricsCollectionRunning()) {
    startMetricsCollection();
  }

  return NextResponse.json({
    success: true,
    metricsCollectionRunning: isMetricsCollectionRunning(),
  });
}
