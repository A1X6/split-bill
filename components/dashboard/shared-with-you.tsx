import Link from "next/link";
import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/currency";
import type { ReceivedShare } from "@/lib/shares";

export default function SharedWithYou({
  shares,
}: {
  shares: ReceivedShare[];
}) {
  if (shares.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Inbox className="size-4" />
        </span>
        <h2 className="font-heading text-lg font-semibold">Shared with you</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shares.map((share) => (
          <Link
            key={share.id}
            href={`/shared/${share.id}`}
            className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{share.billTitle}</div>
                <div className="truncate text-sm text-muted-foreground">
                  from {share.fromName}
                </div>
              </div>
              <StatusBadge status={share.status} />
            </div>
            <div className="font-mono text-xl font-bold tabular-nums">
              {formatMoney(share.amount, share.currency)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") {
    return (
      <Badge className="shrink-0 border-transparent bg-primary/15 font-normal text-primary">
        Settled
      </Badge>
    );
  }
  if (status === "paid") {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-primary/40 bg-primary/10 font-normal text-primary"
      >
        You paid
      </Badge>
    );
  }
  if (status === "declined") {
    return (
      <Badge variant="outline" className="shrink-0 font-normal text-muted-foreground">
        Disputed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="shrink-0 font-normal">
      Awaiting you
    </Badge>
  );
}
