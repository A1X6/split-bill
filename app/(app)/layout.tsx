import AppNav from "@/components/layout/app-nav";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AppNav userName={user.name} userEmail={user.email} />
      <main>{children}</main>
    </div>
  );
}
