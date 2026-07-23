import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;      }
      return session;
    },
  },
  pages: { signIn: "/login" },
});

/** Throws-free helper: returns the current session's user, or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Use inside admin route handlers / server components to gate access.
 * Returns the admin user, or null if the caller isn't an authenticated admin.
 * NOTE: throwing a Response inside a Route Handler does NOT become the HTTP
 * response in Next.js (that only works in middleware) — callers must check
 * the return value themselves and return a 401/403 explicitly.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}
