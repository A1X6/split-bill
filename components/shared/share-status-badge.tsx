import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The single source of truth for how a bill share's status renders. Both sides
 * of a share read from here so the owner's send panel, the recipient's inbox
 * card, and the recipient's detail page can never drift in color or wording.
 *
 * The lifecycle is pending → paid → confirmed, with declined as the dispute
 * branch. Labels differ by audience (the owner sees "Paid — confirm", the
 * recipient sees "You paid"), but the color mapping is shared.
 */
export function ShareStatusBadge({
  status,
  audience,
  amountChanged = false,
  notSent = false,
  className,
}: {
  status: string;
  audience: "owner" | "recipient";
  /** Owner-only: a re-send changed the amount the recipient last saw. */
  amountChanged?: boolean;
  /** Owner-only: no share has been sent to this recipient yet. */
  notSent?: boolean;
  className?: string;
}) {
  const cls = cn("font-normal", className);

  if (notSent) {
    return (
      <Badge variant="outline" className={cls}>
        Not sent
      </Badge>
    );
  }
  if (amountChanged) {
    return (
      <Badge variant="warning" className={cls}>
        Amount changed
      </Badge>
    );
  }

  switch (status) {
    case "confirmed":
      return (
        <Badge variant="success" className={cls}>
          Settled
        </Badge>
      );
    case "paid":
      return (
        <Badge variant="success" className={cls}>
          {audience === "owner" ? "Paid — confirm" : "You paid"}
        </Badge>
      );
    case "declined":
      return (
        <Badge variant="outline" className={cn(cls, "text-muted-foreground")}>
          Disputed
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={cls}>
          {audience === "owner" ? "Pending" : "Awaiting you"}
        </Badge>
      );
  }
}
