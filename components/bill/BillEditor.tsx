"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Bill } from "@/lib/db/schema/bills";
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

export default function BillEditor({ initialBill }: { initialBill: Bill }) {
  const [title, setTitle] = useState(initialBill.title);
  const [users, setUsers] = useState<Participant[]>(initialBill.participants);
  const [items, setItems] = useState<BillItem[]>(initialBill.items);
  const [taxRate, setTaxRate] = useState(
    initialBill.taxRate ? String(initialBill.taxRate) : ""
  );
  const [currency, setCurrency] = useState<string | null>(initialBill.currency);
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
    if (result.currency) {
      setCurrency(result.currency);
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

  const saveLabel: Record<SaveState, string> = {
    idle: "",
    pending: "Unsaved changes…",
    saving: "Saving…",
    saved: "Saved",
    error: "Couldn't save — check your connection",
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="py-4 space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          placeholder="Untitled bill"
          aria-label="Bill title"
          className="w-full bg-transparent text-3xl font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-0 border-b border-transparent focus:border-gray-300 dark:focus:border-gray-600 transition-colors"
        />
        <p
          className={`text-sm ${
            saveState === "error"
              ? "text-red-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
          aria-live="polite"
        >
          {saveLabel[saveState] || " "}
        </p>
      </header>

      <div className="space-y-6">
        {/* People Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
          <div className="p-6">
            <ParticipantManager
              users={users}
              onAddUser={handleAddUser}
              onRemoveUser={handleRemoveUser}
            />
          </div>
        </div>

        {/* Receipt Scanner Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Scan Receipt with AI
            </h2>
            {scanResult ? (
              <ScannedItemsReview
                scan={scanResult}
                users={users}
                onAddItems={handleAddScannedItems}
                onDismiss={() => setScanResult(null)}
              />
            ) : (
              <ReceiptScanner onScanComplete={handleScanComplete} />
            )}
          </div>
        </div>

        {/* Tax Rate Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Tax Rate
            </h2>
            <div className="flex items-center">
              <input
                type="number"
                placeholder="Tax percentage"
                min="0"
                step="0.1"
                value={taxRate}
                onChange={(e) => updateTaxRate(e.target.value)}
                className={`flex-grow px-4 py-3 rounded-xl border ${
                  taxError
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
              />
              <span className="ml-2 text-gray-600 dark:text-gray-300 text-lg">
                %
              </span>
            </div>
            {detectedTaxes.length > 0 && (
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Detected from receipt:{" "}
                {detectedTaxes
                  .map((tax) => `${tax.name} ${tax.rate}%`)
                  .join(" × ")}
                {detectedTaxes.length > 1 && (
                  <>
                    {" "}
                    ={" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {(
                        (detectedTaxes.reduce(
                          (acc, tax) => acc * (1 + tax.rate / 100),
                          1
                        ) -
                          1) *
                        100
                      ).toFixed(2)}
                      % compounded
                    </span>
                  </>
                )}
              </p>
            )}
            {taxError && (
              <p className="text-red-500 text-sm mt-2">
                Please enter a valid tax rate (0 or greater)
              </p>
            )}
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Add Items
            </h2>
            <ItemForm users={users} onAddItem={handleAddItem} />
            <ItemList
              items={items}
              users={users}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>

        {/* Results Card */}
        {users.length > 0 && items.length > 0 && !taxError && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Results
              </h2>
              <Results
                users={users}
                userTotals={userTotals}
                taxRate={taxRate}
                overallTotal={overallTotal}
              />
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="flex justify-center py-6">
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Clear this bill
        </button>
      </div>
    </div>
  );
}
