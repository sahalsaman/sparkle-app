"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import { Message } from "@/models/Message";
import { emitToRoom } from "@/lib/socket-server";
import { ROOM_TYPES } from "@/types";

const createSchema = z.object({
  name: z.string().min(2).max(60),
  type: z.enum(ROOM_TYPES).default("TEAM"),
});

export async function createRoom(input: { name: string; type: (typeof ROOM_TYPES)[number] }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.companyId) throw new Error("Unauthorized");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await connectDB();
  const room = await Room.create({
    name: parsed.data.name.trim(),
    type: parsed.data.type,
    companyId: session.user.companyId,
    members: [new mongoose.Types.ObjectId(session.user.id)],
    createdBy: session.user.id,
    lastMessageAt: new Date(),
  });
  revalidatePath("/rooms");
  redirect(`/rooms/${room._id.toString()}`);
}

const sendSchema = z.object({
  roomId: z.string().length(24),
  message: z.string().min(1).max(2000),
});

export async function sendMessage(input: { roomId: string; message: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid message");

  await connectDB();
  const room = await Room.findById(parsed.data.roomId).select("companyId members");
  if (!room) throw new Error("Room not found");
  if (room.companyId.toString() !== (session.user.companyId ?? ""))
    throw new Error("Wrong company");

  const msg = await Message.create({
    roomId: parsed.data.roomId,
    userId: session.user.id,
    message: parsed.data.message.trim(),
  });
  await Room.updateOne(
    { _id: parsed.data.roomId },
    { $set: { lastMessageAt: new Date() }, $addToSet: { members: session.user.id } }
  );

  emitToRoom(parsed.data.roomId, "message:new", {
    _id: msg._id.toString(),
    roomId: parsed.data.roomId,
    userId: session.user.id,
    userName: session.user.name ?? "Someone",
    userAvatar: session.user.image ?? null,
    message: msg.message,
    createdAt: msg.createdAt,
  });
}
