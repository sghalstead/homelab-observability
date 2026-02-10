import { DockerOverview } from '@/components/dashboard/docker-overview';

export default function DockerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Docker Containers</h1>
        <p className="text-muted-foreground">Monitor and manage Docker containers</p>
      </div>
      <DockerOverview />
    </div>
  );
}
