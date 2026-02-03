'use client';

import { useOllamaStatus, useRunningModels } from '@/hooks/use-ollama';
import { ModelCard } from '@/components/ollama/model-card';
import { RunningModel } from '@/components/ollama/running-model';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertCircle, CheckCircle2 } from 'lucide-react';

export function OllamaOverview() {
  const { data: status, isLoading, error } = useOllamaStatus();
  const { data: running } = useRunningModels();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
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

  if (!status?.available) {
    return (
      <Alert>
        <Bot className="h-4 w-4" />
        <AlertTitle>Ollama Unavailable</AlertTitle>
        <AlertDescription>
          Could not connect to Ollama server. Make sure Ollama is running with{' '}
          <code className="bg-muted px-1 rounded">ollama serve</code>
        </AlertDescription>
      </Alert>
    );
  }

  const runningModelNames = new Set(running?.map((r) => r.name) || []);

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ollama Server</CardTitle>
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Online
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{status.version || '-'}</div>
              <div className="text-xs text-muted-foreground">Version</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{status.models.length}</div>
              <div className="text-xs text-muted-foreground">Models</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{running?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Running Models */}
      {running && running.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Inferences</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {running.map((model) => (
              <RunningModel key={model.digest} model={model} />
            ))}
          </div>
        </div>
      )}

      {/* Available Models */}
      {status.models.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Available Models</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {status.models.map((model) => (
              <ModelCard
                key={model.digest}
                model={model}
                isRunning={runningModelNames.has(model.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
