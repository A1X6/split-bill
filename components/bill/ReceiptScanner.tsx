import { useRef, useState } from "react";
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
          className="w-full flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">Take a photo or upload a receipt</span>
          <span className="text-sm">The AI reads the items and taxes for you</span>
        </button>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Receipt preview"
            className="max-h-80 w-auto mx-auto rounded-xl border border-gray-200 dark:border-gray-600"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleScan}
              disabled={loading}
              className="flex-1 px-6 py-3 text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Reading receipt…
                </>
              ) : (
                "Scan with AI"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setError("");
              }}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60 transition-colors"
            >
              Cancel
            </button>
          </div>
          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Free models can take up to a minute — hang tight.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
