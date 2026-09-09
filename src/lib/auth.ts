import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The adapter still handles account linking/storage for GitHub and Google.
  // Session strategy is "jwt" (not "database") because the Credentials
  // provider below is checked manually and can't persist sessions through
  // the adapter the way OAuth providers do — this is a NextAuth requirement,
  // not a style choice.
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub,
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,
          },
        });

        // No user, or the account was created via GitHub/Google and has
        // never set a password.
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only populated on sign-in. For OAuth (GitHub/Google) it's
      // the adapter's User row; for Credentials it's whatever `authorize`
      // returned above. Either way, persist id + role onto the token so
      // every subsequent request has them without a DB round-trip.
   if (user?.id) {
    token.id = user.id;
    token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
   }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
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
