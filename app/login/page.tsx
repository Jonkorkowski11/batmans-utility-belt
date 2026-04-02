import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import { getLoginUsers, readStore } from "@/lib/store";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const store = await readStore();

  return <LoginForm accounts={getLoginUsers(store)} />;
}
