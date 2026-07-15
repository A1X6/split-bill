import { redirect } from "next/navigation";
import UsernameSetup from "@/components/auth/username-setup";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Choose a username",
};

export default async function WelcomePage() {
  const user = await requireUser();
  // Already has one (email/password users, or a returning Google user) — the
  // step is done, so it never shows twice.
  if (user.username) {
    redirect("/dashboard");
  }
  return <UsernameSetup />;
}
