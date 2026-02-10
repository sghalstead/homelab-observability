'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Box } from 'lucide-react';
import { useContainerStats, useContainerControl } from '@/hooks/use-docker';
import { formatBytes } from '@/lib/utils/format';
import type { ContainerInfo } from '@/lib/types/docker';

interface ContainerCardProps {
  container: ContainerInfo;
}

const stateBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  running: 'default',
  exited: 'secondary',
  paused: 'outline',
  dead: 'destructive',
  restarting: 'outline',
  created: 'secondary',
};

export function ContainerCard({ container }: ContainerCardProps) {
  const isRunning = container.state === 'running';
  const { data: stats } = useContainerStats(container.id, isRunning);
  const { startMutation, stopMutation, restartMutation } = useContainerControl();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Box className="h-4 w-4 shrink-0" />
          <CardTitle className="text-sm font-medium truncate">{container.name}</CardTitle>
        </div>
        <Badge variant={stateBadgeVariant[container.state] || 'secondary'}>{container.state}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-1 truncate">{container.image}</p>
        <p className="text-xs text-muted-foreground mb-3">{container.status}</p>

        {isRunning && stats && (
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-muted-foreground">CPU:</span> {stats.cpuPercent.toFixed(1)}%
            </div>
            <div>
              <span className="text-muted-foreground">Mem:</span> {formatBytes(stats.memoryUsed)}
            </div>
            <div>
              <span className="text-muted-foreground">Net RX:</span> {formatBytes(stats.networkRx)}
            </div>
            <div>
              <span className="text-muted-foreground">Net TX:</span> {formatBytes(stats.networkTx)}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isRunning && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => startMutation.mutate(container.id)}
              disabled={startMutation.isPending}
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}
          {isRunning && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => stopMutation.mutate(container.id)}
                disabled={stopMutation.isPending}
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => restartMutation.mutate(container.id)}
                disabled={restartMutation.isPending}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restart
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
