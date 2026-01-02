import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function SampleCard() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          System Status
          <Badge variant="default">Online</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">All systems operational</p>
        <Button className="mt-4" size="sm">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
