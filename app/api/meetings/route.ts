import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get("id");

  try {
    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
          issues: {
            include: { user: { select: { name: true } } },
            orderBy: { priority: "desc" },
          },
        },
      });
      return NextResponse.json(meeting);
    }

    // Get latest active or planned meeting
    const meetings = await prisma.meeting.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json(meetings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const meeting = await prisma.meeting.create({
      data: {
        title: `Level 10 Meeting - ${new Date().toLocaleDateString()}`,
        status: "ACTIVE",
      },
    });
    return NextResponse.json(meeting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status } = body;

    const updated = await prisma.meeting.update({
      where: { id },
      data: { 
        status,
        endTime: status === "COMPLETED" ? new Date() : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
