import MarketingNav from "@/components/layout/marketing-nav";
import SiteFooter from "@/components/layout/site-footer";
import { getSession } from "@/lib/session";

export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Reading the session here makes the nav show the right state on first paint
  // (Dashboard + avatar when signed in) instead of flashing the logged-out
  // buttons the way a client-side session check would.
  const session = await getSession();
  const user = session?.user
    ? { name: session.user.name, image: session.user.image ?? null }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
