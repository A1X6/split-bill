import Link from "next/link";

// Placeholder chrome — replaced with the full marketing nav/footer in the
// redesign phase.
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-bold">
            Split Bill
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="hover:underline">
              Pricing
            </Link>
            <Link href="/about" className="hover:underline">
              How it works
            </Link>
            <Link href="/login" className="hover:underline">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gray-900 px-3 py-1.5 font-medium text-white dark:bg-white dark:text-gray-900"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400 dark:border-gray-700">
        © {new Date().getFullYear()} Split Bill
      </footer>
    </div>
  );
}
