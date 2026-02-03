import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import type { OllamaRunningModel } from '@/lib/types/ollama';

interface RunningModelProps {
  model: OllamaRunningModel;
}

export function RunningModel({ model }: RunningModelProps) {
  const vramPercent = model.size > 0 ? (model.sizeVram / model.size) * 100 : 0;

  return (
    <Card className="border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
        </div>
        <Badge variant="default">Active</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model Size:</span>
            <span>{formatBytes(model.size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VRAM Used:</span>
            <span>{formatBytes(model.sizeVram)}</span>
          </div>
          {model.sizeVram > 0 && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground text-xs">VRAM Load</span>
                <span className="text-xs">{vramPercent.toFixed(0)}%</span>
              </div>
              <Progress value={vramPercent} className="h-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
