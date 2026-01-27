'use client';

import { useServices } from '@/hooks/use-services';
import { ServiceCard } from '@/components/services/service-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Layers } from 'lucide-react';

export function ServicesOverview() {
  const { data, isLoading, error } = useServices();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (!data?.systemd.available) {
    return (
      <Alert>
        <Layers className="h-4 w-4" />
        <AlertTitle>Systemd Unavailable</AlertTitle>
        <AlertDescription>
          Could not connect to systemd. This feature requires a systemd-based system.
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.services.map((service) => (
        <ServiceCard key={service.name} service={service} />
      ))}
    </div>
  );
}
