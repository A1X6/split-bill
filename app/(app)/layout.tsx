import AppNav from "@/components/layout/app-nav";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <AppNav
        userName={user.name}
        userEmail={user.email}
        userImage={user.image}
      />
      <main>{children}</main>
    </div>
  );
}
