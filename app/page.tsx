import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { ManagerDashboard } from "@/components/manager-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  return <ManagerDashboard />;
}
