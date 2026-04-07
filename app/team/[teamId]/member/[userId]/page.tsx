import { ExecutionBoard } from "@/components/execution-board";
import { requireSession } from "@/lib/auth";
import { getBoardView, readStore } from "@/lib/store";
import { redirect } from "next/navigation";

type MemberPageProps = {
  params: Promise<{
    teamId: string;
    userId: string;
  }>;
};

export default async function MemberPage({ params }: MemberPageProps) {
  const { teamId, userId } = await params;
  const session = await requireSession();
  const store = await readStore();
  const board = getBoardView(store, userId);

  if (!board || board.teamId !== teamId) {
    redirect("/");
  }

  if (session.systemRole !== "manager" && session.userId !== userId) {
    redirect(`/team/${session.teamId}/member/${session.userId}`);
  }

  return (
    <ExecutionBoard
      data={board}
    />
  );
}
