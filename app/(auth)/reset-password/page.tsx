import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset password",
};

// Not gated on session: the token in the URL is the credential, and someone
// may follow the link while signed in elsewhere.
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
