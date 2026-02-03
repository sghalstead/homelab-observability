import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import type { OllamaModel } from '@/lib/types/ollama';

interface ModelCardProps {
  model: OllamaModel;
  isRunning?: boolean;
}

export function ModelCard({ model, isRunning }: ModelCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
        </div>
        {isRunning && <Badge variant="default">Running</Badge>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Size:</span> {formatBytes(model.size)}
          </div>
          <div>
            <span className="text-muted-foreground">Family:</span> {model.details.family}
          </div>
          <div>
            <span className="text-muted-foreground">Parameters:</span> {model.details.parameterSize}
          </div>
          <div>
            <span className="text-muted-foreground">Quantization:</span>{' '}
            {model.details.quantizationLevel}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
