import Link from "next/link";
import {
  ArrowRight,
  History,
  Percent,
  ScanLine,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const participants = {
  maya: { initial: "M", className: "bg-primary text-primary-foreground" },
  alex: { initial: "A", className: "bg-chart-2 text-foreground" },
  sam: { initial: "S", className: "bg-chart-3 text-primary-foreground" },
} as const;

function Chip({ who }: { who: keyof typeof participants }) {
  const p = participants[who];
  return (
    <span
      className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${p.className}`}
      aria-hidden="true"
    >
      {p.initial}
    </span>
  );
}

function ReceiptRow({
  name,
  amount,
  chips,
}: {
  name: string;
  amount: string;
  chips: (keyof typeof participants)[];
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="truncate">{name}</span>
      <span className="flex items-center gap-1.5">
        <span className="flex -space-x-1">
          {chips.map((who) => (
            <Chip key={who} who={who} />
          ))}
        </span>
        <span className="w-16 text-right tabular-nums">{amount}</span>
      </span>
    </div>
  );
}

function HeroReceipt() {
  return (
    <div className="receipt-edge w-full max-w-sm rotate-1 rounded-t-2xl bg-card px-6 pt-6 pb-12 font-mono text-sm text-card-foreground shadow-xl ring-1 ring-foreground/10 transition-transform duration-300 hover:rotate-0 motion-reduce:transform-none">
      <div className="mb-1 text-center text-xs tracking-[0.3em] text-muted-foreground">
        DINNER · FRIDAY
      </div>
      <div className="mb-4 border-b border-dashed pb-3 text-center font-semibold tracking-widest">
        TRATTORIA DA LUCA
      </div>

      <ReceiptRow name="Truffle pasta" amount="24.00" chips={["maya", "sam"]} />
      <ReceiptRow
        name="Burrata"
        amount="14.50"
        chips={["maya", "alex", "sam"]}
      />
      <ReceiptRow name="Negroni ×2" amount="26.00" chips={["alex"]} />
      <ReceiptRow name="Tiramisu" amount="9.00" chips={["maya", "sam"]} />

      <div className="my-3 border-t border-dashed" />

      <div className="flex justify-between py-1 text-muted-foreground">
        <span>Tax 8.75%</span>
        <span className="tabular-nums">6.43</span>
      </div>

      <div className="my-3 border-t border-dashed" />

      <div className="space-y-1 font-semibold">
        <div className="flex justify-between">
          <span className="flex items-center gap-2">
            <Chip who="maya" /> Maya pays
          </span>
          <span className="tabular-nums">$23.20</span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-2">
            <Chip who="alex" /> Alex pays
          </span>
          <span className="tabular-nums">$33.53</span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-2">
            <Chip who="sam" /> Sam pays
          </span>
          <span className="tabular-nums">$23.20</span>
        </div>
      </div>

      <div className="mt-4 text-center text-xs tracking-[0.2em] text-muted-foreground">
        NO SPREADSHEETS HARMED
      </div>
    </div>
  );
}

const steps = [
  {
    number: "01",
    title: "Add your people",
    body: "Type the names of everyone at the table — no accounts needed for them.",
  },
  {
    number: "02",
    title: "Scan the receipt",
    body: "Snap a photo. The AI reads every item, price, and tax line for you.",
  },
  {
    number: "03",
    title: "Everyone sees their share",
    body: "Assign items to people. Each person's total — tax included — is ready to send.",
  },
];

const features = [
  {
    icon: ScanLine,
    title: "AI receipt scanning",
    body: "Photograph any receipt and watch the items appear, priced and counted. Edit anything it gets wrong.",
  },
  {
    icon: UsersRound,
    title: "Split by item, not evenly",
    body: "The person who ordered three cocktails pays for three cocktails. Shared plates split between exactly who shared them.",
  },
  {
    icon: Percent,
    title: "Tax handled properly",
    body: "Tax is spread in proportion to what each person actually ordered — even compound taxes from the receipt.",
  },
  {
    icon: History,
    title: "Every bill saved",
    body: "Your bills autosave to your account. Reopen last month's trip dinner any time someone asks 'wait, how much do I owe?'",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Split the bill,
            <br />
            skip the math.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Snap the receipt, tap who had what, and everyone knows exactly what
            they owe — tax included. Free to use.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={
                <Link href="/signup">
                  Start splitting free
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<Link href="/about">See how it works</Link>}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            No card required. Your friends don&apos;t need accounts.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <HeroReceipt />
        </div>
      </section>

      {/* How it works — set like receipt line items */}
      <section className="border-y border-dashed bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading mb-10 text-center text-3xl font-bold tracking-tight">
            Dinner&apos;s over in three steps
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <span className="font-mono text-sm text-primary tabular-nums">
                  {step.number}
                </span>
                <div className="flex-1 border-t border-dashed pt-3">
                  <h3 className="font-heading mb-1 font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <h2 className="font-heading mb-10 text-center text-3xl font-bold tracking-tight">
          Built for the moment the check lands
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-2xl">
              <CardContent className="space-y-3 pt-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="font-heading text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Closing CTA — receipt footer */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
          <p className="mb-2 font-mono text-xs tracking-[0.3em] opacity-80">
            *** THANK YOU · COME AGAIN ***
          </p>
          <h2 className="font-heading mb-6 text-3xl font-bold tracking-tight">
            The next bill splits itself
          </h2>
          <Button
            size="lg"
            variant="secondary"
            className="h-11 px-6 text-base"
            nativeButton={false}
            render={<Link href="/signup">Create your free account</Link>}
          />
        </div>
      </section>
    </>
  );
}
