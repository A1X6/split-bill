import Link from "next/link";
import { ArrowRight, Camera, ListChecks, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How it works",
  description:
    "Add your people, scan the receipt, and everyone sees their share — tax included.",
};

const steps = [
  {
    icon: UsersRound,
    number: "01",
    title: "Add your people",
    body: "Start a bill and type the names of everyone splitting it. They're just names on your bill — nobody else has to download anything or make an account.",
  },
  {
    icon: Camera,
    number: "02",
    title: "Scan the receipt — or type it in",
    body: "Take a photo of the receipt and the AI reads every line: items, unit prices, quantities, and each tax or service charge. Review the list, fix anything it misread, and assign each item to the people who had it. Prefer typing? Add items by hand just as fast.",
  },
  {
    icon: ListChecks,
    number: "03",
    title: "Everyone sees their share",
    body: "Each person's card shows exactly what they ordered, their subtotal, their slice of the tax, and their total. Shared items split evenly between the people who shared them — and tax lands in proportion to what each person spent.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-14 text-center">
        <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight">
          How Split Bill works
        </h1>
        <p className="text-lg text-muted-foreground">
          From &quot;check, please&quot; to settled up in about a minute.
        </p>
      </div>

      <ol className="space-y-10">
        {steps.map((step) => (
          <li key={step.number} className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <step.icon className="size-5" />
              </span>
              <span className="mt-3 flex-1 border-l border-dashed" />
            </div>
            <div className="pb-2">
              <p className="mb-1 font-mono text-xs text-primary tabular-nums">
                STEP {step.number}
              </p>
              <h2 className="font-heading mb-2 text-xl font-semibold">
                {step.title}
              </h2>
              <p className="text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-14 rounded-2xl border border-dashed p-8 text-center">
        <h2 className="font-heading mb-2 text-2xl font-bold">
          Try it on tonight&apos;s dinner
        </h2>
        <p className="mb-6 text-muted-foreground">
          Free to use — your first bill takes less time than deciding on
          dessert.
        </p>
        <Button
          size="lg"
          className="h-11 px-6"
          nativeButton={false}
          render={
            <Link href="/signup">
              Get started
              <ArrowRight data-icon="inline-end" />
            </Link>
          }
        />
      </div>
    </section>
  );
}
