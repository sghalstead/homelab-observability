'use client';

import { useContainers, useDockerStatus } from '@/hooks/use-docker';
import { ContainerCard } from '@/components/docker/container-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Box, CheckCircle2 } from 'lucide-react';

export function DockerOverview() {
  const { data: status, isLoading: statusLoading } = useDockerStatus();
  const { data: containers, isLoading, error } = useContainers();

  if (statusLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!status?.available) {
    return (
      <Alert>
        <Box className="h-4 w-4" />
        <AlertTitle>Docker Unavailable</AlertTitle>
        <AlertDescription>
          Could not connect to Docker daemon. Make sure Docker is running.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Docker Engine</CardTitle>
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Online
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{status.version || '-'}</div>
              <div className="text-xs text-muted-foreground">Version</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{status.containers.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{status.containers.running}</div>
              <div className="text-xs text-muted-foreground">Running</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{status.containers.stopped}</div>
              <div className="text-xs text-muted-foreground">Stopped</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container Cards */}
      {containers && containers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {containers.map((container) => (
            <ContainerCard key={container.id} container={container} />
          ))}
        </div>
      ) : (
        <Alert>
          <Box className="h-4 w-4" />
          <AlertTitle>No Containers</AlertTitle>
          <AlertDescription>No Docker containers found.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
