import { OllamaOverview } from '@/components/dashboard/ollama-overview';

export default function OllamaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Workloads</h1>
        <p className="text-muted-foreground">Monitor Ollama models and inferences</p>
      </div>
      <OllamaOverview />
    </div>
  );
}
