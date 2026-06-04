"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("getSocket must be called in the browser");
  }
  if (!socket) {
    socket = io({
      path: "/api/socket",
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}
