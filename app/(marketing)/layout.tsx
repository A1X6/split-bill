import MarketingNav from "@/components/layout/marketing-nav";
import SiteFooter from "@/components/layout/site-footer";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
