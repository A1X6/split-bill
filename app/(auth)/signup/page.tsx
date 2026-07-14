import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/signup-form";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Sign up",
};

export default async function SignupPage() {
  // Authoritative check — see the note in proxy.ts on why cookie presence alone
  // must not decide this.
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return <SignupForm />;
}
