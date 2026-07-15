import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder while a shared bill (snapshot, items, and your share) loads.
 * Mirrors the recipient view: heading, the amount panel, then the item list.
 */
export default function SharedLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-2 h-4 w-40" />
      <Skeleton className="mb-6 h-8 w-2/3" />
      <Skeleton className="mb-6 h-28 w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-11 w-full rounded-lg" />
    </div>
  );
}
