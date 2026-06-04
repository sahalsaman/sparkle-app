import { signOutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { initialsFromName } from "@/lib/utils";

export function AppTopbar({
  name,
  email,
  avatar,
  role,
}: {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/70 px-6 py-3 backdrop-blur">
      <div>
        <p className="text-xs text-muted-foreground">Welcome back</p>
        <p className="text-sm font-medium">{name ?? email}</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-3 rounded-2xl border bg-card/60 px-3 py-1.5">
          <Avatar className="h-8 w-8">
            {avatar && <AvatarImage src={avatar} alt={name ?? "User"} />}
            <AvatarFallback>{initialsFromName(name)}</AvatarFallback>
          </Avatar>
          <div className="hidden text-right text-xs sm:block">
            <p className="font-medium leading-tight">{name}</p>
            <p className="text-muted-foreground">{role.replaceAll("_", " ").toLowerCase()}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
