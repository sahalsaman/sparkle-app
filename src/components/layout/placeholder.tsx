import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Placeholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Icon className="h-7 w-7 text-primary" /> {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card glass>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <Badge variant="secondary">Coming next</Badge>
          <p className="max-w-md text-sm text-muted-foreground">
            This module is part of Phase 2 of the build. The data layer, models, and API surface
            are already in place — the UI and realtime wiring land in the next iteration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
