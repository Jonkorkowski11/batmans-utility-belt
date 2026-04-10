import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const p = prisma as any;
    const model = p.meetingIssue || p.MeetingIssue;

    if (!model) {
      throw new Error("MeetingIssue model not found on Prisma client.");
    }

    const issues = await model.findMany({
      where: { status: "OPEN" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(issues);
  } catch (error: any) {
    console.error("GET ISSUES ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description } = body;

    const p = prisma as any;
    const model = p.meetingIssue || p.MeetingIssue;

    if (!model) {
      throw new Error("MeetingIssue model not found on Prisma client.");
    }

    const issue = await model.create({
      data: {
        title,
        description,
        userId: session.user.id,
        status: "OPEN",
      },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json(issue);
  } catch (error: any) {
    console.error("POST ISSUE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status, priority } = body;

    const p = prisma as any;
    const model = p.meetingIssue || p.MeetingIssue;

    if (!model) {
      throw new Error("MeetingIssue model not found on Prisma client.");
    }

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updated = await model.update({
      where: { id },
      data: { 
        status,
        priority: priority !== undefined ? Number(priority) : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH ISSUE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const p = prisma as any;
  const model = p.meetingIssue || p.MeetingIssue;

  if (!model) {
    throw new Error("MeetingIssue model not found on Prisma client.");
  }

  await model.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
