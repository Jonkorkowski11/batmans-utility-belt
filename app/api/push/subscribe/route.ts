import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint, p256dh, auth } = await req.json();

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Missing subscription data" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh, auth, userId: session.user.id },
    create: { endpoint, p256dh, auth, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
