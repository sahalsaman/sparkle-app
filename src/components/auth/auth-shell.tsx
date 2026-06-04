import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--grad-from)),hsl(var(--grad-via)),hsl(var(--grad-to)))] shadow-lg shadow-primary/30">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          Sparkle
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-md flex-col px-6 pb-16">
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
