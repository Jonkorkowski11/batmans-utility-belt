import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const p = prisma as any;
    const model = p.seat || p.Seat;
    
    const seats = await model.findMany({
      include: {
        user: { select: { id: true, name: true, image: true } },
        subordinates: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(seats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, userId, reportsToId } = body;

    const p = prisma as any;
    const model = p.seat || p.Seat;

    const seat = await model.create({
      data: {
        title,
        description,
        userId: userId || null,
        reportsToId: reportsToId || null,
      },
    });
    return NextResponse.json(seat);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, ...data } = body;

    const p = prisma as any;
    const model = p.seat || p.Seat;

    const updated = await model.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        userId: data.userId,
        reportsToId: data.reportsToId,
        getIt: data.getIt,
        wantIt: data.wantIt,
        capacity: data.capacity,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const p = prisma as any;
  const model = p.seat || p.Seat;

  await model.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
