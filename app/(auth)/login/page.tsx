import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Log in",
};

export default async function LoginPage() {
  // Authoritative check — a session cookie alone isn't proof of a live session,
  // so only bounce to the app when the session really validates.
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
