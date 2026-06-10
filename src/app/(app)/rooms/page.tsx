import Link from "next/link";
import { MessagesSquare, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateRoomDialog } from "@/components/rooms/create-room-dialog";

export const dynamic = "force-dynamic";

type RoomRow = {
  _id: { toString(): string };
  name: string;
  type: string;
  lastMessageAt: Date;
  members: Array<{ toString(): string }>;
};

async function loadRooms() {
  try {
    await connectDB();
    return await Room.find({})
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean<RoomRow[]>();
  } catch {
    return [];
  }
}

export default async function RoomsPage() {
  await auth();
  const rooms = await loadRooms();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <MessagesSquare className="h-7 w-7 text-primary" /> Rooms
          </h1>
          <p className="text-muted-foreground">Public chat rooms — realtime via Socket.io.</p>
        </div>
        <CreateRoomDialog>
          <span className="inline-flex cursor-pointer items-center gap-1 rounded-2xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:brightness-110">
            <Plus className="h-4 w-4" /> New room
          </span>
        </CreateRoomDialog>
      </div>

      {rooms.length === 0 ? (
        <Card glass>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No rooms yet. Create one to start chatting with other players.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rooms.map((r) => (
            <Link key={r._id.toString()} href={`/rooms/${r._id.toString()}`}>
              <Card glass className="transition-colors hover:bg-accent/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium"># {r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.members.length} member{r.members.length === 1 ? "" : "s"} · last activity {timeAgo(r.lastMessageAt)}
                    </p>
                  </div>
                  <Badge variant="secondary">{r.type}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(d: Date) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
