import { useRef, useState } from "react";
import { Camera, CircleAlert, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanReceiptResult } from "@/lib/types";
import { compressImage } from "@/lib/compressImage";

interface ReceiptScannerProps {
  onScanComplete: (result: ScanReceiptResult) => void;
}

export default function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
    } catch {
      setError("Could not read that image. Try a JPEG or PNG photo.");
    }
  };

  const handleScan = async () => {
    if (!preview || loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Scan failed. Please try again.");
      }
      onScanComplete(data as ScanReceiptResult);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-muted-foreground transition-colors outline-none hover:border-primary/50 hover:text-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Camera className="size-10" strokeWidth={1.5} />
          <span className="font-medium text-foreground">
            Take a photo or upload a receipt
          </span>
          <span className="text-sm">
            The AI reads the items and taxes for you
          </span>
        </button>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Receipt preview"
            className="mx-auto max-h-80 w-auto rounded-xl border"
          />
          <div className="flex gap-3">
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={handleScan}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Reading receipt…
                </>
              ) : (
                <>
                  <ScanLine data-icon="inline-start" />
                  Scan with AI
                </>
              )}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setPreview(null);
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
          {loading && (
            <p className="text-center text-sm text-muted-foreground">
              Free models can take up to a minute — hang tight.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
