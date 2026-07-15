import { ArrowLeft, Check, ExternalLink, Wallet, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import ShareActions from "@/components/shared/share-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import { requireUser } from "@/lib/session";
import { getReceivedShare } from "@/lib/shares";

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
            <StatusBadge status={share.status} />
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

          {share.status === "pending" ? (
            <ShareActions shareId={share.id} />
          ) : (
            <p
              className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                share.status === "accepted"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {share.status === "accepted" ? (
                <Check className="size-4" />
              ) : (
                <X className="size-4" />
              )}
              {share.status === "accepted"
                ? "You accepted this bill."
                : "You declined this bill."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <Badge className="border-transparent bg-primary/15 font-normal text-primary">
        Accepted
      </Badge>
    );
  }
  if (status === "declined") {
    return (
      <Badge variant="outline" className="font-normal text-muted-foreground">
        Declined
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="font-normal">
      Awaiting you
    </Badge>
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
