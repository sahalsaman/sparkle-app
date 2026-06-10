import type { Server } from "socket.io";

export function getIO(): Server | null {
  return globalThis.__io ?? null;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  getIO()?.to(`user:${userId}`).emit(event, payload);
}

export function emitToRoom(roomId: string, event: string, payload: unknown) {
  getIO()?.to(`room:${roomId}`).emit(event, payload);
}
