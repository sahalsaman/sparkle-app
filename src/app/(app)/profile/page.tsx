import { UserCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initialsFromName } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user;
  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
        <UserCircle2 className="h-7 w-7 text-primary" /> Profile
      </h1>
      <Card glass>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <Avatar className="h-20 w-20">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? "User"} />}
            <AvatarFallback className="text-2xl">{initialsFromName(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="gradient">{user.role.replaceAll("_", " ")}</Badge>
              {user.companyId && <Badge variant="secondary">Company member</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
