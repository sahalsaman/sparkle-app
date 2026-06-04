import { Users } from "lucide-react";
import { Placeholder } from "@/components/layout/placeholder";

export default function AdminEmployeesPage() {
  return (
    <Placeholder
      title="Employees"
      description="Invite, manage, and assign roles across your company."
      icon={Users}
    />
  );
}
