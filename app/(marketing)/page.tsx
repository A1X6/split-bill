import Link from "next/link";

// Placeholder landing — full hero/features/CTA built in the redesign phase.
export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
        Split any bill in seconds
      </h1>
      <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
        Snap a photo of the receipt, assign items to friends, and everyone
        knows exactly what they owe — tax included.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white dark:bg-white dark:text-gray-900"
        >
          Get started free
        </Link>
        <Link
          href="/about"
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium dark:border-gray-600"
        >
          See how it works
        </Link>
      </div>
    </div>
  );
}
