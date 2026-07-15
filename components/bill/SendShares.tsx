"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendBillShares } from "@/lib/actions/shares";
import { formatMoney } from "@/lib/currency";
import type { BillShare, PaymentMethod } from "@/lib/db/schema";
import type { FriendSummary } from "@/lib/friends";
import { initialsOf } from "@/lib/initials";
import type { Participant, UserTotal } from "@/lib/types";

interface SendSharesProps {
  billId: string;
  participants: Participant[];
  userTotals: Record<string, UserTotal>;
  currency: string;
  friends: FriendSummary[];
  paymentMethods: PaymentMethod[];
  shares: BillShare[];
  payerParticipantId: string | null;
  paymentMethodId: string | null;
  onPayerChange: (id: string | null) => void;
  onPaymentMethodChange: (id: string | null) => void;
  flushNow: () => Promise<boolean>;
}

// Amounts are the same double arithmetic on both sides, so an unchanged bill
// recomputes to the identical value the share was stored with.
function amountChanged(stored: number, current: number): boolean {
  return Math.abs(stored - current) > 1e-6;
}

export default function SendShares({
  billId,
  participants,
  userTotals,
  currency,
  friends,
  paymentMethods,
  shares,
  payerParticipantId,
  paymentMethodId,
  onPayerChange,
  onPaymentMethodChange,
  flushNow,
}: SendSharesProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const sharesByRecipient = useMemo(
    () => new Map(shares.map((s) => [s.recipientUserId, s])),
    [shares],
  );

  // A billable recipient is a linked friend on this bill who isn't the payer.
  // (I'm never in my own friends list, so "add me" participants drop out here.)
  const recipients = participants.filter(
    (p) =>
      p.userId &&
      friendIds.has(p.userId) &&
      p.id !== payerParticipantId,
  );

  const currentAmount = (participantId: string) =>
    userTotals[participantId]?.total ?? 0;

  const needsSending = (p: Participant): boolean => {
    const share = sharesByRecipient.get(p.userId!);
    if (!share) return true;
    return amountChanged(share.amount, currentAmount(p.id));
  };

  // Default-select the people who actually need a (re)send: never sent, or
  // their amount has changed since. Recompute when the recipient set, the sent
  // shares, or the amounts owed shift — keyed via primitives so the memo can be
  // statically checked.
  const recipientKey = recipients.map((p) => p.userId).join(",");
  const amountKey = recipients
    .map((p) => currentAmount(p.id).toFixed(4))
    .join(",");
  const suggested = useMemo(
    () =>
      new Set(
        recipients.filter(needsSending).map((p) => p.userId as string),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recipientKey, amountKey, shares],
  );
  const [manual, setManual] = useState<Set<string> | null>(null);
  const selected = manual ?? suggested;

  const toggle = (userId: string) => {
    setManual((prev) => {
      const next = new Set(prev ?? suggested);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const imageFor = (userId: string): string | null =>
    friends.find((f) => f.id === userId)?.image ?? null;

  const payer = participants.find((p) => p.id === payerParticipantId);
  const defaultMethodId = paymentMethods[0]?.id;

  const handleSend = () => {
    if (!payerParticipantId) {
      toast.error("Choose who paid first.");
      return;
    }
    const ids = [...selected];
    if (ids.length === 0) {
      toast.error("Pick at least one person to send to.");
      return;
    }
    startTransition(async () => {
      // Persist the payer/method the user just picked before the server reads
      // the bill back to build the shares.
      const saved = await flushNow();
      if (!saved) {
        toast.error("Couldn't save the bill — try again.");
        return;
      }
      const result = await sendBillShares(billId, ids);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setManual(null);
      toast.success(
        `Sent to ${result.sent} ${result.sent === 1 ? "person" : "people"}.`,
      );
      router.refresh();
    });
  };

  return (
    <Card className="rounded-2xl [--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Send className="size-4" />
          </span>
          Send everyone their share
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payer">Who paid?</Label>
            <Select
              value={payerParticipantId}
              onValueChange={(value) =>
                onPayerChange((value as string | null) ?? null)
              }
            >
              <SelectTrigger id="payer" className="w-full">
                {/* Base UI renders the raw value until the popup is opened, so
                    map the id to a name ourselves — otherwise a pre-set payer
                    shows its timestamp id. */}
                <SelectValue>
                  {(id: string | null) =>
                    id
                      ? (participants.find((p) => p.id === id)?.name ??
                        "Choose who paid")
                      : "Choose who paid"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {paymentMethods.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="method">Pay to</Label>
              <Select
                value={paymentMethodId ?? defaultMethodId}
                onValueChange={(value) =>
                  onPaymentMethodChange((value as string | null) ?? null)
                }
              >
                <SelectTrigger id="method" className="w-full">
                  {/* Same as the payer select — resolve the label so the
                      trigger never shows a bare payment-method id. */}
                  <SelectValue>
                    {(id: string | null) =>
                      paymentMethods.find((m) => m.id === (id ?? defaultMethodId))
                        ?.label ?? "Your payment method"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {paymentMethods.length === 0 && (
          <Alert>
            <Wallet />
            <AlertDescription>
              Add an InstaPay link or QR on your{" "}
              <Link href="/profile">profile</Link> so friends know how to pay
              you. You can still send without one.
            </AlertDescription>
          </Alert>
        )}

        {recipients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {payer
              ? "No friends to send to yet — add a friend as a participant above."
              : "Choose who paid, then pick friends to send their share to."}
          </p>
        ) : (
          <ul className="space-y-1">
            {recipients.map((p) => {
              const userId = p.userId as string;
              const share = sharesByRecipient.get(userId);
              const changed =
                share && amountChanged(share.amount, currentAmount(p.id));
              return (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted">
                    <Checkbox
                      checked={selected.has(userId)}
                      onCheckedChange={() => toggle(userId)}
                    />
                    <Avatar className="size-8">
                      {imageFor(userId) ? (
                        <AvatarImage src={imageFor(userId)!} alt="" />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {initialsOf(p.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatMoney(currentAmount(p.id), currency)}
                      </div>
                    </div>
                    <StatusChip share={share} changed={Boolean(changed)} />
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {payerParticipantId
              ? "They'll see their share and how to pay you."
              : "Pick who paid to enable sending."}
          </p>
          <Button
            type="button"
            onClick={handleSend}
            disabled={pending || !payerParticipantId || selected.size === 0}
          >
            <Send data-icon="inline-start" />
            {pending ? "Sending…" : `Send${selected.size ? ` (${selected.size})` : ""}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusChip({
  share,
  changed,
}: {
  share: BillShare | undefined;
  changed: boolean;
}) {
  if (!share) {
    return (
      <Badge variant="outline" className="shrink-0 font-normal">
        Not sent
      </Badge>
    );
  }
  if (changed) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-amber-500/40 bg-amber-500/10 font-normal text-amber-700 dark:text-amber-400"
      >
        Amount changed
      </Badge>
    );
  }
  if (share.status === "accepted") {
    return (
      <Badge className="shrink-0 border-transparent bg-primary/15 font-normal text-primary">
        Accepted
      </Badge>
    );
  }
  if (share.status === "declined") {
    return (
      <Badge variant="outline" className="shrink-0 font-normal text-muted-foreground">
        Declined
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="shrink-0 font-normal">
      Pending
    </Badge>
  );
}
