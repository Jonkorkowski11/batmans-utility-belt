import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "EMPLOYEE";
};

export async function getServerAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return {
    user: session.user as SessionUser,
  };
}

export async function requireAuth() {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
