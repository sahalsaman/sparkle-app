import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "amber" | "emerald" | "blue";
}) {
  const accentClass =
    accent === "amber"
      ? "bg-amber-500/15 text-amber-500"
      : accent === "emerald"
      ? "bg-emerald-500/15 text-emerald-500"
      : accent === "blue"
      ? "bg-sky-500/15 text-sky-500"
      : "bg-primary/15 text-primary";

  return (
    <Card glass>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
