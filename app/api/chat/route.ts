import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";

// Pusher is optional — only initialize if keys are present
let pusherServer: import("pusher") | null = null;

async function getPusher() {
  if (pusherServer) return pusherServer;
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.NEXT_PUBLIC_PUSHER_KEY ||
    !process.env.PUSHER_SECRET ||
    !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  ) {
    return null;
  }

  const Pusher = (await import("pusher")).default;
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  }) as unknown as import("pusher") | null;

  return pusherServer;
}

export async function GET(req: Request) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { taskId },
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, content } = await req.json();

  if (!taskId || !content?.trim()) {
    return NextResponse.json({ error: "taskId and content required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      taskId,
      content: content.trim(),
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  // Broadcast via Pusher if configured
  const pusher = await getPusher();
  if (pusher) {
    try {
      await (pusher as unknown as { trigger: (channel: string, event: string, data: unknown) => Promise<void> }).trigger(`task-${taskId}`, "new-message", message);
    } catch (err) {
      console.error("Pusher broadcast failed:", err);
    }
  }

  // Push notify the other party
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (task) {
      const notifyUserId =
        task.assigneeId === session.user.id ? task.creatorId : task.assigneeId;
      await sendPushToUser(notifyUserId, {
        title: `Task Update: ${task.title}`,
        body: `${session.user.name}: ${content.trim()}`,
        url: `/tasks/${task.id}`,
      });
    }
  } catch (err) {
    console.error("Push notify on chat failed:", err);
  }

  return NextResponse.json(message);
}
