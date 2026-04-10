import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { syncTaskToCalendar } from "@/lib/gcal";
import { sendPushToUser } from "@/lib/push";

export async function GET(req: Request) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const persona = searchParams.get("persona");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const assigneeId = searchParams.get("assigneeId");

  const where: Record<string, unknown> = {};
  if (persona) where.persona = persona;
  if (type) where.type = type;
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;

  // Employees only see their own tasks
  if (session.user.role === "EMPLOYEE") {
    where.assigneeId = session.user.id;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      _count: { select: { messages: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only admins can create tasks." },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { title, description, dueDate, type, persona, assigneeId } = body;

  if (!title || !assigneeId) {
    return NextResponse.json(
      { error: "Title and assignee are required." },
      { status: 400 }
    );
  }

  // 1. Create task in PostgreSQL
  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      type: type || "TODO",
      persona: persona || "TRUERANK_DIGITAL",
      dueDate: dueDate ? new Date(dueDate) : null,
      creatorId: session.user.id,
      assigneeId,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  // 2. Google Calendar sync (non-blocking, fails gracefully)
  try {
    await syncTaskToCalendar(task);
  } catch (err) {
    console.error("GCal sync failed (non-critical):", err);
  }

  // 3. Push notification to assignee's phone (non-blocking)
  try {
    await sendPushToUser(assigneeId, {
      title: "New Task Assigned!",
      body: `You have a new ${type || "TODO"}: ${title}`,
      url: `/tasks/${task.id}`,
    });
  } catch (err) {
    console.error("Push notification failed (non-critical):", err);
  }

  return NextResponse.json(task);
}

export async function PATCH(req: Request) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { taskId, status, title, description } = body;

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  // Employees can only toggle status on their own tasks
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role === "EMPLOYEE" && task.assigneeId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can delete tasks." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
