import { SystemOverview } from '@/components/dashboard/system-overview';

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Homelab system metrics at a glance</p>
      </div>
      <SystemOverview />
    </div>
  );
}
