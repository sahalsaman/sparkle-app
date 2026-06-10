import { Users } from "lucide-react";
import { Placeholder } from "@/components/layout/placeholder";

export default function AdminUsersPage() {
  return (
    <Placeholder
      title="Users"
      description="View, manage, and assign roles across all players."
      icon={Users}
    />
  );
}
