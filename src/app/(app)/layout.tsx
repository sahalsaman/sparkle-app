import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import type { Role } from "@/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user.role ?? "EMPLOYEE") as Role;

  return (
    <div className="relative flex min-h-dvh">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-40" />
      <AppSidebar role={role} />
      <div className="flex flex-1 flex-col">
        <AppTopbar
          name={session.user.name}
          email={session.user.email}
          avatar={session.user.image}
          role={role}
        />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
