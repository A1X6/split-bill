import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder while the friends list, incoming, and outgoing requests load.
 * Mirrors the page: title, the tab bar, then a few friend-row placeholders.
 */
export default function FriendsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-8 w-32" />
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border p-4"
          >
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
