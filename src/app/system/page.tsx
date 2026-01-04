import { SystemOverview } from '@/components/dashboard/system-overview';
import { MetricsHistory } from '@/components/dashboard/metrics-history';

export default function SystemPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">System Metrics</h1>
        <p className="text-muted-foreground">Real-time system resource monitoring</p>
      </div>
      <SystemOverview />
      <MetricsHistory />
    </div>
  );
}
