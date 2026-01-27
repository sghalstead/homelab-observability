'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Layers } from 'lucide-react';
import { useServiceControl } from '@/hooks/use-services';
import type { ServiceInfo } from '@/lib/types/systemd';

interface ServiceCardProps {
  service: ServiceInfo;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const controlMutation = useServiceControl();
  const isActive = service.activeState === 'active';
  const isLoaded = service.loadState === 'loaded';

  const getStateBadge = (state: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      failed: 'destructive',
      activating: 'outline',
      deactivating: 'outline',
    };
    return variants[state] || 'secondary';
  };

  if (!isLoaded) {
    return (
      <Card className="opacity-60">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
          </div>
          <Badge variant="outline">not found</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Service not installed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
        </div>
        <Badge variant={getStateBadge(service.activeState)}>
          {service.activeState} ({service.subState})
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{service.description}</p>

        <div className="flex gap-2 flex-wrap">
          {!isActive && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => controlMutation.mutate({ name: service.name, action: 'start' })}
              disabled={controlMutation.isPending}
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}
          {isActive && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => controlMutation.mutate({ name: service.name, action: 'stop' })}
                disabled={controlMutation.isPending}
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => controlMutation.mutate({ name: service.name, action: 'restart' })}
                disabled={controlMutation.isPending}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restart
              </Button>
            </>
          )}
        </div>

        {controlMutation.isError && (
          <p className="text-xs text-destructive mt-2">{controlMutation.error.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
