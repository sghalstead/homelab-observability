export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startMetricsCollection } = await import('@/lib/services/metrics-scheduler');
    startMetricsCollection();
  }
}
