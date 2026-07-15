import { redirect } from "next/navigation";
import AppNav from "@/components/layout/app-nav";
import { requireUser } from "@/lib/session";
import { getPendingShareCount } from "@/lib/shares";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  // A username is required to use the app. Google sign-ups arrive without one,
  // so gate them to the setup step until they pick one. /welcome lives outside
  // this layout, so there's no redirect loop.
  if (!user.username) {
    redirect("/welcome");
  }
  const pendingShares = await getPendingShareCount(user.id);

  return (
    <div className="min-h-screen">
      <AppNav
        userName={user.name}
        userEmail={user.email}
        userImage={user.image}
        userUsername={user.displayUsername ?? user.username}
        pendingShares={pendingShares}
      />
      <main>{children}</main>
    </div>
  );
}
