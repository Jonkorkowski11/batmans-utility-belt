import { redirect } from "next/navigation";
import { ManagerDashboard } from "@/components/manager-dashboard";
import { requireSession } from "@/lib/auth";
import { getTeamData, readStore } from "@/lib/store";

export default async function HomePage() {
  const session = await requireSession();
  const store = await readStore();

  if (session.systemRole !== "manager") {
    redirect(`/team/${session.teamId}/member/${session.userId}`);
  }

  return <ManagerDashboard data={getTeamData(store)} />;
}
