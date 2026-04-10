import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["jon@truerankdigital.com", "bishop@truerankdigital.com"];
const EMPLOYEE_EMAILS = [
  "jesse@truerankdigital.com",
  "eric@truerankdigital.com",
  "jose@truerankdigital.com",
];
const ALLOWED_EMAILS = [...ADMIN_EMAILS, ...EMPLOYEE_EMAILS];

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Google Workspace SSO — primary auth when credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
                scope:
                  "openid email profile https://www.googleapis.com/auth/calendar.events",
              },
            },
          }),
        ]
      : []),

    // Passcode fallback — works without Google OAuth credentials
    CredentialsProvider({
      name: "Passcode",
      credentials: {
        email: { label: "Email", type: "text" },
        passcode: { label: "Passcode", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.passcode) return null;

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.passcode !== credentials.passcode.trim()) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-in, enforce email whitelist
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase() || "";
        if (!ALLOWED_EMAILS.includes(email)) return false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email ?? undefined },
        });
        token.id = dbUser?.id || user.id;
        token.role = dbUser?.role || "EMPLOYEE";
      }
      // Persist Google tokens for Calendar API
      if (account?.provider === "google") {
        if (account.access_token) token.accessToken = account.access_token;
        if (account.refresh_token) token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const email = user.email?.toLowerCase() || "";
      if (ADMIN_EMAILS.includes(email)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
