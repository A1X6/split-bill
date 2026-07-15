"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a small rise-and-fade the first time they scroll
 * into view. Deliberately dependency-free (no motion library): an
 * IntersectionObserver adds `data-shown`, and the `.reveal` CSS handles the
 * transition. Reduced-motion and no-JS fall back to visible via CSS, so content
 * is never stuck hidden. Apply only to below-the-fold content — the initial
 * hidden state then happens off-screen and never flashes.
 *
 * setState is only ever called inside a deferred callback (the observer or a
 * rAF), never synchronously in the effect body, per the project's
 * react-hooks/set-state-in-effect rule.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in ms, for items revealed together. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown ? "" : undefined}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", className)}
    >
      {children}
    </div>
  );
}
