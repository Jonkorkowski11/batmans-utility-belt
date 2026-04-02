import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readStore } from "@/lib/store";
import type { SessionData } from "@/lib/types";

const SESSION_COOKIE = "batmans-utility-belt-session";

export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function setSession(session: SessionData) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function authenticateUser(email: string, passcode: string) {
  const store = await readStore();
  return (
    store.users.find(
      (user) =>
        user.active &&
        user.email === email.trim().toLowerCase() &&
        user.passcode === passcode.trim()
    ) ?? null
  );
}
