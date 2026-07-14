"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Loader2,
  Percent,
  ReceiptText,
  ScanLine,
  UsersRound,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Bill } from "@/lib/db/schema/bills";
import {
  CURRENCIES,
  type CurrencyCode,
  normalizeCurrency,
  toCurrencyCode,
} from "@/lib/currency";
import type { FriendSummary } from "@/lib/friends";
import {
  Participant,
  BillItem,
  ScanReceiptResult,
  ScannedTax,
} from "@/lib/types";
import { updateBill } from "@/lib/actions/bills";
import { calculateUserTotals, calculateOverallTotal } from "@/lib/split";
import type { BillUpdateInput } from "@/lib/validation/bill";
import ParticipantManager from "./ParticipantManager";
import ItemForm from "./ItemForm";
import ItemList from "./ItemList";
import Results from "./Results";
import ReceiptScanner from "./ReceiptScanner";
import ScannedItemsReview from "./ScannedItemsReview";

type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1000;

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") {
    return <span className="h-5" />;
  }

  const content = {
    pending: (
      <>
        <span className="size-1.5 rounded-full bg-muted-foreground" />
        Unsaved changes
      </>
    ),
    saving: (
      <>
        <Loader2 className="size-3.5 animate-spin" />
        Saving…
      </>
    ),
    saved: (
      <>
        <Check className="size-3.5 text-primary" />
        Saved
      </>
    ),
    error: (
      <>
        <CircleAlert className="size-3.5" />
        Couldn&apos;t save — check your connection
      </>
    ),
  }[state];

  return (
    <span
      className={`flex h-5 items-center gap-1.5 text-xs ${
        state === "error" ? "text-destructive" : "text-muted-foreground"
      }`}
      aria-live="polite"
    >
      {content}
    </span>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl [--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface BillEditorProps {
  initialBill: Bill;
  currentUser: { id: string; name: string; image: string | null };
  friends: FriendSummary[];
}

export default function BillEditor({
  initialBill,
  currentUser,
  friends,
}: BillEditorProps) {
  const [title, setTitle] = useState(initialBill.title);
  const [users, setUsers] = useState<Participant[]>(initialBill.participants);
  const [items, setItems] = useState<BillItem[]>(initialBill.items);
  const [taxRate, setTaxRate] = useState(
    initialBill.taxRate ? String(initialBill.taxRate) : ""
  );
  // Always a valid ISO code. billUpdateSchema rejects anything else, and a
  // rejected payload takes the whole autosave down with it.
  const [currency, setCurrency] = useState<CurrencyCode>(
    toCurrencyCode(initialBill.currency)
  );
  const [taxError, setTaxError] = useState(false);
  const [scanResult, setScanResult] = useState<ScanReceiptResult | null>(null);
  const [detectedTaxes, setDetectedTaxes] = useState<ScannedTax[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // --- Autosave: debounce after the last mutation; if a save is already
  // in flight, mark dirty and re-run once with the latest state
  // (latest-wins coalescing — prevents out-of-order UPDATEs).
  const latestRef = useRef<BillUpdateInput | null>(null);
  const inFlightRef = useRef(false);
  const dirtyRef = useRef(false);
  const isFirstRender = useRef(true);

  // Called from every mutating event handler so the save indicator reacts
  // immediately, before the debounced flush.
  const markDirty = () => setSaveState("pending");

  const flush = useCallback(async () => {
    if (!latestRef.current) return;
    if (inFlightRef.current) {
      dirtyRef.current = true;
      return;
    }
    inFlightRef.current = true;
    setSaveState("saving");
    try {
      do {
        dirtyRef.current = false;
        const result = await updateBill(initialBill.id, latestRef.current);
        if (!result.ok) {
          throw new Error(result.error);
        }
      } while (dirtyRef.current);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [initialBill.id]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (taxError) return;
    const parsed = taxRate ? parseFloat(taxRate) : 0;
    latestRef.current = {
      title,
      taxRate: isNaN(parsed) ? 0 : parsed,
      currency,
      participants: users,
      items,
    };
    const timer = setTimeout(() => {
      void flush();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [title, users, items, taxRate, currency, taxError, flush]);

  // Warn before leaving while changes are still unsaved (best effort).
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveState === "pending" || saveState === "saving") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  const handleAddUser = (user: Participant) => {
    setUsers([...users, user]);
    markDirty();
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    setItems(
      items.map((item) => ({
        ...item,
        users: item.users.filter((id) => id !== userId),
      }))
    );
    markDirty();
  };

  const handleAddItem = (
    name: string,
    cost: number,
    quantity: number,
    selectedUsers: string[]
  ) => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      name,
      cost,
      quantity,
      users: selectedUsers,
    };
    setItems([...items, newItem]);
    markDirty();
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
    markDirty();
  };

  const handleScanComplete = (result: ScanReceiptResult) => {
    setScanResult(result);
    // The API normalizes too. Belt and braces: a raw symbol reaching this state
    // would fail validation and stop the bill saving at all.
    const scanned = normalizeCurrency(result.currency);
    if (scanned) {
      setCurrency(scanned);
      markDirty();
    }
    if (result.taxes.length > 0) {
      setDetectedTaxes(result.taxes);
      setTaxRate(String(result.combinedTaxRate));
      setTaxError(false);
      markDirty();
    }
  };

  const handleAddScannedItems = (
    scanned: { name: string; cost: number; quantity: number; users: string[] }[]
  ) => {
    const timestamp = Date.now();
    setItems([
      ...items,
      ...scanned.map((item, index) => ({
        id: `${timestamp}-${index}`,
        ...item,
      })),
    ]);
    setScanResult(null);
    markDirty();
  };

  const updateTaxRate = (value: string) => {
    setTaxRate(value);
    setTaxError(
      value !== "" && (isNaN(parseFloat(value)) || parseFloat(value) < 0)
    );
    markDirty();
  };

  const handleReset = () => {
    setUsers([]);
    setItems([]);
    setTaxRate("");
    setTaxError(false);
    setScanResult(null);
    setDetectedTaxes([]);
    markDirty();
  };

  const parsedTaxRate = taxRate ? parseFloat(taxRate) : 0;
  const effectiveTaxRate =
    taxError || isNaN(parsedTaxRate) ? 0 : parsedTaxRate;
  const userTotals = calculateUserTotals(users, items, effectiveTaxRate);
  const overallTotal = calculateOverallTotal(users, items, effectiveTaxRate);

  const isEmpty = users.length === 0 && items.length === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          nativeButton={false}
          render={
            <Link href="/dashboard">
              <ArrowLeft data-icon="inline-start" />
              All bills
            </Link>
          }
        />
        <div>
          <Input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markDirty();
            }}
            placeholder="Untitled bill"
            aria-label="Bill title"
            className="font-heading h-auto border-0 bg-transparent px-0 py-1 text-3xl font-bold tracking-tight shadow-none focus-visible:ring-0 md:text-3xl"
          />
          <SaveIndicator state={saveState} />
        </div>
      </div>

      <SectionCard icon={UsersRound} title="Who's splitting?">
        <ParticipantManager
          users={users}
          onAddUser={handleAddUser}
          onRemoveUser={handleRemoveUser}
          currentUser={currentUser}
          friends={friends}
        />
      </SectionCard>

      <SectionCard icon={ScanLine} title="Scan the receipt">
        {scanResult ? (
          <ScannedItemsReview
            scan={scanResult}
            users={users}
            onAddItems={handleAddScannedItems}
            onDismiss={() => setScanResult(null)}
            currency={currency}
          />
        ) : (
          <ReceiptScanner onScanComplete={handleScanComplete} />
        )}
      </SectionCard>

      <SectionCard icon={Percent} title="Currency & tax">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bill-currency">Currency</Label>
            <Select
              value={currency}
              onValueChange={(value) => {
                setCurrency(value as CurrencyCode);
                markDirty();
              }}
            >
              <SelectTrigger id="bill-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.code} · {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-tax">Tax rate</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                id="bill-tax"
                placeholder="0"
                min="0"
                step="0.1"
                value={taxRate}
                aria-label="Tax rate percentage"
                aria-invalid={taxError || undefined}
                onChange={(e) => updateTaxRate(e.target.value)}
                className="font-mono tabular-nums"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        </div>
        {detectedTaxes.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            From the receipt:{" "}
            {detectedTaxes.map((tax) => `${tax.name} ${tax.rate}%`).join(" × ")}
            {detectedTaxes.length > 1 && (
              <>
                {" "}
                ={" "}
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {(
                    (detectedTaxes.reduce(
                      (acc, tax) => acc * (1 + tax.rate / 100),
                      1
                    ) -
                      1) *
                    100
                  ).toFixed(2)}
                  %
                </span>{" "}
                compounded
              </>
            )}
          </p>
        )}
        {taxError && (
          <p className="mt-2 text-sm text-destructive">
            Enter a tax rate of 0 or more
          </p>
        )}
      </SectionCard>

      <SectionCard icon={ReceiptText} title="Items">
        <ItemForm users={users} onAddItem={handleAddItem} currency={currency} />
        <ItemList
          items={items}
          users={users}
          onRemoveItem={handleRemoveItem}
          currency={currency}
        />
      </SectionCard>

      {users.length > 0 && items.length > 0 && !taxError && (
        <SectionCard icon={Check} title="Everyone's share">
          <Results
            users={users}
            userTotals={userTotals}
            taxRate={taxRate}
            overallTotal={overallTotal}
            currency={currency}
          />
        </SectionCard>
      )}

      {!isEmpty && (
        <div className="flex justify-center pb-4">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="ghost" className="text-muted-foreground">
                  Clear this bill
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear this bill?</AlertDialogTitle>
                <AlertDialogDescription>
                  Everyone and every item is removed. The bill itself stays in
                  your history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep everything</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  Clear bill
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
