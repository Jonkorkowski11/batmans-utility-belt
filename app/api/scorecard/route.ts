import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || session.user.id;

  try {
    const p = prisma as any;
    const model = p.scorecardMeasurable || p.ScorecardMeasurable;

    if (!model) {
      throw new Error(`Scorecard model not found on Prisma client.`);
    }

    const measurables = await model.findMany({
      where: { userId },
      include: {
        values: {
          orderBy: { weekEnding: "desc" },
          take: 12,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(measurables);
  } catch (error: any) {
    console.error("Scorecard GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, goal, operator, userId } = body;

    const p = prisma as any;
    const model = p.scorecardMeasurable || p.ScorecardMeasurable;

    const measurable = await model.create({
      data: {
        title,
        goal: parseFloat(goal),
        operator: operator || ">=",
        userId: userId || session.user.id,
      },
    });

    return NextResponse.json(measurable);
  } catch (error: any) {
    console.error("Scorecard POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { measurableId, value, weekEnding } = body;

    const p = prisma as any;
    const model = p.scorecardValue || p.ScorecardValue;

    const scorecardValue = await model.upsert({
      where: {
        measurableId_weekEnding: {
          measurableId,
          weekEnding: new Date(weekEnding),
        },
      },
      update: { value: parseFloat(value) },
      create: {
        measurableId,
        weekEnding: new Date(weekEnding),
        value: parseFloat(value),
      },
    });

    return NextResponse.json(scorecardValue);
  } catch (error: any) {
    console.error("Scorecard PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
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
  const model = p.scorecardMeasurable || p.ScorecardMeasurable;

  await model.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
