import { SystemOverview } from '@/components/dashboard/system-overview';

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Metrics</h1>
        <p className="text-muted-foreground">Real-time system resource monitoring</p>
      </div>
      <SystemOverview />
    </div>
  );
}
