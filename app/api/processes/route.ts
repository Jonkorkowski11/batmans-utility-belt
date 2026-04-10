import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const p = prisma as any;
    const model = p.process || p.Process;
    
    const processes = await model.findMany({
      include: {
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(processes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, content, ownerId, isCore } = body;

    const p = prisma as any;
    const model = p.process || p.Process;

    const process = await model.create({
      data: {
        title,
        description,
        content,
        ownerId: ownerId || session.user.id,
        isCore: isCore || false,
      },
    });
    return NextResponse.json(process);
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
    const model = p.process || p.Process;

    const updated = await model.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        ownerId: data.ownerId,
        isCore: data.isCore,
        adherenceScore: data.adherenceScore,
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
  const model = p.process || p.Process;

  await model.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
