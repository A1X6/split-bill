import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Authoritative check — a session cookie alone isn't proof of a live session,
  // so only bounce to the app when the session really validates.
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  // OAuth failures (Continue with Google) redirect here with ?error=<code>.
  const { error } = await searchParams;
  return <LoginForm oauthError={error} />;
}
