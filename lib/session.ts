import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Real session validation for protected pages and server actions.
 * The proxy cookie check is only an optimistic UX redirect — this is
 * the authoritative gate.
 */
export async function requireUser() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session.user;
}
