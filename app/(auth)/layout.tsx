import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 text-2xl font-bold">
        Split Bill
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
