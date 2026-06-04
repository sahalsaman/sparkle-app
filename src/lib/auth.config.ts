import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isAdminRole, type Role } from "@/types";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const googleEnabled = !!(googleClientId && googleClientSecret);

export const authConfig = {
  // Behind a reverse proxy (custom server on PORT), trust the proxy's
  // X-Forwarded-Host / X-Forwarded-Proto headers so Auth.js builds redirect
  // URLs against the public domain instead of the internal localhost:PORT.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: googleEnabled
    ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
    : [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.role = (user as { role?: Role }).role ?? "EMPLOYEE";
        token.companyId = (user as { companyId?: string | null }).companyId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? "");
        session.user.role = (token.role as Role) ?? "EMPLOYEE";
        session.user.companyId = (token.companyId as string | null) ?? null;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const role = (auth?.user?.role as Role | undefined) ?? undefined;

      // Build absolute redirect URLs from the proxy's forwarded host so that,
      // in production behind a reverse proxy, we redirect to the public domain
      // rather than the internal localhost:PORT that nextUrl reflects.
      const redirectTo = (pathname: string) => {
        const host = request.headers.get("x-forwarded-host") ?? nextUrl.host;
        const proto =
          request.headers.get("x-forwarded-proto") ??
          nextUrl.protocol.replace(":", "");
        return Response.redirect(new URL(pathname, `${proto}://${host}`));
      };

      const isAdminArea = path.startsWith("/admin");
      const isProtected =
        path.startsWith("/dashboard") ||
        path.startsWith("/games") ||
        path.startsWith("/challenges") ||
        path.startsWith("/rooms") ||
        path.startsWith("/leaderboard") ||
        path.startsWith("/notifications") ||
        path.startsWith("/profile") ||
        isAdminArea;
      const isAuthPage = path === "/login" || path === "/register";

      if (isAdminArea) {
        if (!isLoggedIn) return false;
        if (!isAdminRole(role)) {
          return redirectTo("/dashboard");
        }
        return true;
      }

      if (isProtected && !isLoggedIn) return false;

      if (isAuthPage && isLoggedIn) {
        return redirectTo("/dashboard");
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
