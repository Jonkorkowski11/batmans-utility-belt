import { ExecutionBoard } from "@/components/execution-board";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type MemberPageProps = {
  params: Promise<{
    teamId: string;
    userId: string;
  }>;
};

export default async function MemberPage({ params }: MemberPageProps) {
  const { userId } = await params;
  const session = await requireAuth();

  // Employees can only see their own board
  if (session.user.role === "EMPLOYEE" && session.user.id !== userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!user) {
    redirect("/");
  }

  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      _count: { select: { messages: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    type: t.type,
    status: t.status,
    persona: t.persona,
    dueDate: t.dueDate?.toISOString() ?? null,
    gCalEventId: t.gCalEventId,
    assignee: t.assignee,
    creator: t.creator,
    _count: t._count,
  }));

  return (
    <ExecutionBoard
      data={{
        userId: user.id,
        name: user.name || "Unknown",
        role: user.role,
        tasks: serializedTasks,
      }}
    />
  );
}
