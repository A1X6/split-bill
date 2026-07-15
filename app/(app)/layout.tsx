import AppNav from "@/components/layout/app-nav";
import { requireUser } from "@/lib/session";
import { getPendingShareCount } from "@/lib/shares";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const pendingShares = await getPendingShareCount(user.id);

  return (
    <div className="min-h-screen">
      <AppNav
        userName={user.name}
        userEmail={user.email}
        userImage={user.image}
        userUsername={user.username}
        pendingShares={pendingShares}
      />
      <main>{children}</main>
    </div>
  );
}
