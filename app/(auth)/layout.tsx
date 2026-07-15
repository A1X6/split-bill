import Link from "next/link";
import { ReceiptText } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden="true"
        className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="glow-primary pointer-events-none absolute top-1/3 left-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 opacity-40"
      />
      <div className="relative flex w-full max-w-sm flex-col items-center">
        <Link href="/" className="rise-in mb-8 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ReceiptText className="size-5" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight">
            Splitza
          </span>
        </Link>
        <div className="rise-in w-full" style={{ animationDelay: "80ms" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
