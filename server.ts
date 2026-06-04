import { createServer } from "node:http";
import next from "next";
import { Server, type Socket } from "socket.io";
import { getToken } from "next-auth/jwt";
import type { Role } from "./src/types";

const port = Number(process.env.PORT) || 3010;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

type SocketUser = {
  id: string;
  companyId: string | null;
  role: Role;
};

declare module "socket.io" {
  interface SocketData {
    user: SocketUser;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __io: Server | undefined;
}

void app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: { origin: false },
  });

  const cookieName = dev ? "authjs.session-token" : "__Secure-authjs.session-token";

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie ?? "";
      const token = await getToken({
        req: { headers: { cookie: cookieHeader } },
        secret: process.env.AUTH_SECRET!,
        salt: cookieName,
        cookieName,
        secureCookie: !dev,
      });
      if (!token?.sub) return next(new Error("unauthorized"));
      socket.data.user = {
        id: String(token.id ?? token.sub),
        companyId: (token.companyId as string | null | undefined) ?? null,
        role: ((token.role as Role | undefined) ?? "EMPLOYEE"),
      };
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const { id, companyId } = socket.data.user;
    socket.join(`user:${id}`);
    if (companyId) socket.join(`company:${companyId}`);

    socket.on("room:join", (roomId: unknown) => {
      if (typeof roomId === "string" && roomId.length === 24) {
        socket.join(`room:${roomId}`);
      }
    });

    socket.on("room:leave", (roomId: unknown) => {
      if (typeof roomId === "string") socket.leave(`room:${roomId}`);
    });
  });

  globalThis.__io = io;

  httpServer.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`> ready on http://localhost:${port} (${dev ? "dev" : "prod"})`);
  });
});
