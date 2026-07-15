import Link from "next/link";
import { ReceiptText } from "lucide-react";

/**
 * Full-screen branded shell for status pages (404, error boundaries). Mirrors
 * the auth layout — warm rice-paper backdrop with the paper-dot texture, an
 * emerald glow, and the Splitza receipt lockup — so an error still feels like
 * the app. Presentational only (no hooks), so both the server not-found page
 * and the client error boundary can render it.
 */
export default function StatusScreen({
  code,
  icon,
  title,
  description,
  children,
}: {
  code?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
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
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ReceiptText className="size-5" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight">
            Splitza
          </span>
        </Link>

        <div className="w-full rounded-2xl bg-card p-8 text-center ring-1 ring-foreground/10">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            {icon}
          </span>
          {code && (
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
              {code}
            </p>
          )}
          <h1 className="font-heading mt-1 text-xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-6 flex flex-col gap-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
