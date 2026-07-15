"use client";

import { useRef, useState, useTransition } from "react";
import { Link2, Plus, QrCode, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "@/lib/actions/payment-methods";
import { compressImage } from "@/lib/compressImage";
import type { PaymentMethod } from "@/lib/db/schema";

const MAX_METHODS = 5;

export default function PaymentMethods({
  methods,
}: {
  methods: PaymentMethod[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const result = await setDefaultPaymentMethod(id);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Default updated.");
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deletePaymentMethod(id);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Payment method removed.");
        router.refresh();
      }
    });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Payment methods</CardTitle>
          <CardDescription>
            Add an InstaPay link or QR so friends can pay you.
          </CardDescription>
        </div>
        {methods.length < MAX_METHODS && <AddMethodDialog />}
      </CardHeader>
      <CardContent>
        {methods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No payment methods yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {methods.map((method) => (
              <li
                key={method.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                {method.type === "instapay_qr" ? (
                  // A base64 data URL — next/image can't optimize it.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={method.value}
                    alt=""
                    className="size-12 shrink-0 rounded-md border object-cover"
                  />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Link2 className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{method.label}</span>
                    {method.isDefault && (
                      <Badge variant="secondary" className="shrink-0">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {method.type === "instapay_qr"
                      ? "QR code"
                      : method.value}
                  </div>
                </div>
                {!method.isDefault && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleSetDefault(method.id)}
                  >
                    <Star data-icon="inline-start" />
                    Default
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${method.label}`}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={pending}
                      >
                        <Trash2 />
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remove {method.label}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Bills you&apos;ve already sent keep their copy of this
                        method.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(method.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function AddMethodDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"instapay_link" | "instapay_qr">(
    "instapay_link",
  );
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setType("instapay_link");
    setLabel("");
    setUrl("");
    setQr(null);
  };

  const handleQrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, {
        maxDimension: 800,
        quality: 0.8,
      });
      setQr(dataUrl);
    } catch {
      toast.error("Couldn't read that image.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const input =
      type === "instapay_link"
        ? { type, label, value: url.trim() }
        : { type, label, value: qr ?? "" };
    const result = await createPaymentMethod(input);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Payment method added.");
    setOpen(false);
    reset();
    router.refresh();
  };

  const linkHost = (() => {
    try {
      return url ? new URL(url).hostname : "";
    } catch {
      return "";
    }
  })();
  const looksNonInstapay =
    linkHost !== "" &&
    !linkHost.endsWith("ipn.eg") &&
    !linkHost.endsWith("instapay.com.eg");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" size="sm">
            <Plus data-icon="inline-start" />
            Add
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add payment method</DialogTitle>
          <DialogDescription>
            An InstaPay payment link, or a QR code image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "instapay_link" ? "default" : "outline"}
              onClick={() => setType("instapay_link")}
            >
              <Link2 data-icon="inline-start" />
              Link
            </Button>
            <Button
              type="button"
              variant={type === "instapay_qr" ? "default" : "outline"}
              onClick={() => setType("instapay_qr")}
            >
              <QrCode data-icon="inline-start" />
              QR code
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm-label">Label</Label>
            <Input
              id="pm-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. My InstaPay"
              required
              maxLength={60}
            />
          </div>

          {type === "instapay_link" ? (
            <div className="space-y-2">
              <Label htmlFor="pm-url">InstaPay link</Label>
              <Input
                id="pm-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ipn.eg/S/you/instapay/..."
                required
              />
              {looksNonInstapay && (
                <p className="text-xs text-muted-foreground">
                  That doesn&apos;t look like an InstaPay link — double-check it.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>QR code image</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleQrFile}
              />
              {qr ? (
                <div className="flex items-center gap-3">
                  {/* A base64 data URL — next/image can't optimize it. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr}
                    alt=""
                    className="size-20 rounded-md border object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    Replace
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload QR image
                </Button>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              disabled={saving || (type === "instapay_qr" && !qr)}
            >
              {saving ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
