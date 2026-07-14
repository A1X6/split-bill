import Link from "next/link";
import { ReceiptText } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ReceiptText className="size-5" />
        </span>
        <span className="font-heading text-xl font-semibold tracking-tight">
          Split Bill
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
