import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Forgot password",
};

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return <ForgotPasswordForm />;
}
