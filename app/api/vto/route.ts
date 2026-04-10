import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId") || session.user.id;

  try {
    // 1. Get user's specific V/TO
    let vto = await prisma.vTO.findUnique({
      where: { userId: targetUserId },
    });

    if (!vto && targetUserId === session.user.id) {
      vto = await prisma.vTO.create({
        data: {
          userId: session.user.id,
          coreValues: "",
          coreFocus: "",
          tenYearTarget: "",
          marketingStrategy: "",
          threeYearPicture: "",
          oneYearPlan: "",
          quarterlyRocks: "",
          issuesList: "",
          feedback: "{}",
        },
      });
    }

    // 2. Get Global Prompts/Guidance set by Admins
    let settings = await prisma.vTOSettings.findFirst();
    if (!settings) {
      settings = await prisma.vTOSettings.create({
        data: {
          coreValuesPrompt: "Think about our core principles that guide every decision.",
          coreFocusPrompt: "What is our singular niche and passion?",
          tenYearTargetPrompt: "What is our BHAG (Big Hairy Audacious Goal)?",
          marketingStrategyPrompt: "Who is our target market and what are our 3 uniques?",
          threeYearPicturePrompt: "Paint a vivid picture of the future in 3 years.",
          oneYearPlanPrompt: "What must happen in the next 12 months?",
          quarterlyRocksPrompt: "What are the 3-7 most important things this quarter?",
          issuesListPrompt: "List all unresolved issues for IDS.",
        },
      });
    }

    // 3. Fetch yearly goals for this specific user
    const yearlyGoals = await prisma.task.findMany({
      where: {
        assigneeId: targetUserId,
        type: { in: ["YEARLY_GOAL", "ROCK"] },
      },
      include: {
        assignee: { select: { name: true } },
      },
    });

    return NextResponse.json({ vto, settings, yearlyGoals });
  } catch (error) {
    console.error("VTO GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, type, ...data } = body;

    // Handle Global Settings Update (Admins Only)
    if (type === "SETTINGS") {
      if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const updatedSettings = await prisma.vTOSettings.update({
        where: { id },
        data: {
          coreValuesPrompt: data.coreValuesPrompt,
          coreFocusPrompt: data.coreFocusPrompt,
          tenYearTargetPrompt: data.tenYearTargetPrompt,
          marketingStrategyPrompt: data.marketingStrategyPrompt,
          threeYearPicturePrompt: data.threeYearPicturePrompt,
          oneYearPlanPrompt: data.oneYearPlanPrompt,
          quarterlyRocksPrompt: data.quarterlyRocksPrompt,
          issuesListPrompt: data.issuesListPrompt,
        },
      });
      return NextResponse.json({ settings: updatedSettings });
    }

    // Handle Personal VTO Update
    const vto = await prisma.vTO.findUnique({ where: { id } });
    if (!vto) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Users can edit their own, Admins can edit anyone's (to leave feedback)
    if (session.user.role !== "ADMIN" && vto.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedVto = await prisma.vTO.update({
      where: { id },
      data: {
        coreValues: data.coreValues,
        coreFocus: data.coreFocus,
        tenYearTarget: data.tenYearTarget,
        marketingStrategy: data.marketingStrategy,
        threeYearPicture: data.threeYearPicture,
        oneYearPlan: data.oneYearPlan,
        quarterlyRocks: data.quarterlyRocks,
        issuesList: data.issuesList,
        feedback: data.feedback, // Jon can save feedback here
      },
    });

    return NextResponse.json({ vto: updatedVto });
  } catch (error) {
    console.error("VTO PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
