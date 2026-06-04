import { ShieldCheck } from "lucide-react";
import { Placeholder } from "@/components/layout/placeholder";

export default function AdminPage() {
  return (
    <Placeholder
      title="HR analytics"
      description="Engagement metrics, participation rates and burnout signals across your org."
      icon={ShieldCheck}
    />
  );
}
