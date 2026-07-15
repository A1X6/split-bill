import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder while the bill, its shares, friends, and payment methods load, so
 * opening a bill doesn't hang on the dashboard behind it.
 */
export default function BillLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-5 w-24" />
      <Skeleton className="mb-8 h-9 w-2/3" />
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}
