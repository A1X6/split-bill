"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** An InstaPay address shown as copy-to-paste text — it isn't a web link, so
 * the recipient copies it into the InstaPay app themselves. */
export default function CopyAddress({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select it and copy manually.");
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border p-3">
      <code className="min-w-0 flex-1 truncate font-mono text-sm">{value}</code>
      <Button type="button" size="sm" variant="outline" onClick={copy}>
        {copied ? (
          <Check data-icon="inline-start" />
        ) : (
          <Copy data-icon="inline-start" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
