import { ArrowLeft, Check, Clock, ExternalLink, Wallet, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import CopyAddress from "@/components/shared/copy-address";
import RecipientActions from "@/components/shared/recipient-actions";
import { ShareStatusBadge } from "@/components/shared/share-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import { requireUser } from "@/lib/session";
import { getReceivedShare, type ReceivedShare } from "@/lib/shares";
import { calculateUserTotals } from "@/lib/split";

export default async function SharedBillPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const user = await requireUser();

  if (!z.uuid().safeParse(shareId).success) {
    notFound();
  }

  // Scoped to the recipient — the share id is the capability, and a guessed id
  // for someone else's share 404s.
  const share = await getReceivedShare(shareId, user.id);
  if (!share) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        nativeButton={false}
        render={
          <Link href="/dashboard">
            <ArrowLeft data-icon="inline-start" />
            Back
          </Link>
        }
      />

      <div>
        <p className="text-sm text-muted-foreground">
          {share.fromName} sent you a bill
        </p>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {share.billTitle}
        </h1>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Your share
            </span>
            <ShareStatusBadge status={share.status} audience="recipient" />
          </div>
          <p className="font-mono text-4xl font-bold tabular-nums">
            {formatMoney(share.amount, share.currency)}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between border-t border-dashed pt-4 text-sm">
            <span className="text-muted-foreground">Paid by</span>
            <span className="font-medium">{share.payerName}</span>
          </div>

          <PaymentDetails
            type={share.paymentMethodType}
            label={share.paymentMethodLabel}
            value={share.paymentMethodValue}
          />

          <ActionArea status={share.status} shareId={share.id} payerName={share.payerName} />
        </CardContent>
      </Card>

      <BillBreakdown share={share} />
    </div>
  );
}

function ActionArea({
  status,
  shareId,
  payerName,
}: {
  status: string;
  shareId: string;
  payerName: string;
}) {
  if (status === "pending" || status === "paid") {
    return (
      <div className="space-y-3">
        {status === "paid" && (
          <p className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
            <Clock className="size-4 shrink-0" />
            You marked this paid — waiting for {payerName} to confirm they got it.
          </p>
        )}
        <RecipientActions shareId={shareId} status={status} />
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
        <Check className="size-4 shrink-0" />
        Settled — {payerName} confirmed they received it.
      </p>
    );
  }

  return (
    <p className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
      <X className="size-4 shrink-0" />
      You disputed this bill. Ask {payerName} to check the amount and re-send.
    </p>
  );
}

/**
 * The whole bill, so the recipient can see every item — not just their total.
 * Rendered from the snapshot taken at send time; shares sent before snapshots
 * existed simply omit this section.
 */
function BillBreakdown({ share }: { share: ReceivedShare }) {
  const items = share.itemsSnapshot;
  const participants = share.participantsSnapshot;
  if (!items || !participants || items.length === 0) return null;

  const taxRate = share.taxRateSnapshot ?? 0;
  const totals = calculateUserTotals(participants, items, taxRate);
  const nameById = new Map(participants.map((p) => [p.id, p.name]));
  const mine = totals[share.participantId];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          The whole bill
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {items.map((item) => {
            const onIt = item.users.includes(share.participantId);
            return (
              <li key={item.id} className="text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <span className={onIt ? "font-medium" : ""}>
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="text-muted-foreground">
                        {" "}
                        ×{item.quantity}
                      </span>
                    )}
                    {onIt && (
                      <Badge
                        variant="secondary"
                        className="ml-2 px-1.5 py-0 text-[10px] font-normal"
                      >
                        You
                      </Badge>
                    )}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums">
                    {formatMoney(item.cost * item.quantity, share.currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.users.length === 0
                    ? "No one assigned"
                    : `Split by ${item.users
                        .map((id) => nameById.get(id) ?? "?")
                        .join(", ")}`}
                </p>
              </li>
            );
          })}
        </ul>

        {mine && (
          <div className="space-y-1 border-t border-dashed pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Your subtotal</span>
              <span className="font-mono tabular-nums">
                {formatMoney(mine.subtotal, share.currency)}
              </span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax ({taxRate}%)</span>
                <span className="font-mono tabular-nums">
                  {formatMoney(mine.tax, share.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Your total</span>
              <span className="font-mono tabular-nums">
                {formatMoney(mine.total, share.currency)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentDetails({
  type,
  label,
  value,
}: {
  type: string | null;
  label: string | null;
  value: string | null;
}) {
  if (!type || !value) {
    return (
      <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        No payment method was attached. Ask {label ? label : "the sender"} how
        they&apos;d like to be paid.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">How to pay</p>
      {type === "instapay_qr" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border p-4">
          {/* A base64 data URL — next/image can't optimize it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label ?? "Payment QR code"}
            className="size-48 rounded-lg border object-contain"
          />
          {label && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
        </div>
      ) : type === "instapay_username" ? (
        <div className="space-y-1.5">
          <CopyAddress value={value} />
          {label && (
            <p className="text-xs text-muted-foreground">
              {label} · send to this address on InstaPay
            </p>
          )}
        </div>
      ) : (
        <Button
          className="w-full"
          nativeButton={false}
          render={
            <a href={value} target="_blank" rel="noopener noreferrer">
              <Wallet data-icon="inline-start" />
              {label ?? "Pay with InstaPay"}
              <ExternalLink data-icon="inline-end" />
            </a>
          }
        />
      )}
    </div>
  );
}
