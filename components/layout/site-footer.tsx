import Link from "next/link";
import { ReceiptText } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-dashed">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ReceiptText className="size-4" />
          <span className="font-mono">
            © {new Date().getFullYear()} Splitza
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
