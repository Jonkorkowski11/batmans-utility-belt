import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/");
  }

  return <LoginForm />;
}
