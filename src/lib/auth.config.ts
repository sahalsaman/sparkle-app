import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isAdminRole, type Role } from "@/types";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const googleEnabled = !!(googleClientId && googleClientSecret);

export const authConfig = {
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const role = (auth?.user?.role as Role | undefined) ?? undefined;

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
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isProtected && !isLoggedIn) return false;

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
