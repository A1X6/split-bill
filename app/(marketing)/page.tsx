import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, ScanLine, Send, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";

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

function SettleRow({
  who,
  name,
  amount,
  status,
}: {
  who: keyof typeof participants;
  name: string;
  amount: string;
  status: "paid" | "sent";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 font-semibold">
        <Chip who={who} /> {name}
      </span>
      <span className="flex items-center gap-2">
        <span className="tabular-nums font-semibold">{amount}</span>
        {status === "paid" ? (
          <span className="inline-flex w-12 items-center justify-end gap-0.5 text-[10px] tracking-wider text-primary">
            <Check className="size-3" aria-hidden="true" /> PAID
          </span>
        ) : (
          <span className="w-12 text-right text-[10px] tracking-wider text-muted-foreground">
            SENT
          </span>
        )}
      </span>
    </div>
  );
}

function HeroReceipt() {
  return (
    <div className="sheen-hover receipt-edge relative w-full max-w-sm overflow-hidden rotate-1 rounded-t-2xl bg-card px-6 pt-6 pb-12 font-mono text-sm text-card-foreground shadow-xl ring-1 ring-foreground/10 transition-transform duration-300 hover:rotate-0 motion-reduce:transform-none">
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

      <div className="space-y-1.5">
        <SettleRow who="maya" name="Maya" amount="$23.20" status="paid" />
        <SettleRow who="alex" name="Alex" amount="$33.53" status="sent" />
        <SettleRow who="sam" name="Sam" amount="$23.20" status="paid" />
      </div>

      <div className="my-3 border-t border-dashed" />

      <div className="flex items-center justify-between text-xs tracking-[0.2em] text-muted-foreground">
        <span>2 OF 3 SETTLED</span>
        <span>TAX INCLUDED</span>
      </div>
    </div>
  );
}

const steps = [
  {
    number: "01",
    title: "Add your friends",
    body: "Send a friend request once. When they accept, you can drop them onto any bill in a tap.",
  },
  {
    number: "02",
    title: "Scan and split by item",
    body: "Snap the receipt — the AI reads every item and tax line — then tap who had what.",
  },
  {
    number: "03",
    title: "Send it and get paid",
    body: "Send each friend their share with your InstaPay. They mark it paid, you confirm, and the bill shows who's settled.",
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
    body: "Whoever ordered three cocktails pays for three cocktails. Tax lands in proportion to what each person actually spent — even compound taxes from the receipt.",
  },
  {
    icon: Send,
    title: "Send it, don't chase it",
    body: "Everyone on the bill gets their share sent to them, with your InstaPay link, username, or QR attached so they know exactly how to pay you.",
  },
  {
    icon: BadgeCheck,
    title: "See who's paid",
    body: "Friends tap “I've paid” and you confirm you got it. Every bill shows what's settled and what's still owed — no awkward reminders.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Paper-grain texture, faded out toward the edges. */}
        <div
          aria-hidden="true"
          className="bg-dots pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="rise-in inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1 font-mono text-[0.7rem] tracking-widest text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              FREE · SPLIT BY ITEM · GET PAID BACK
            </span>
            <h1
              className="rise-in font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "60ms" }}
            >
              Split the bill,
              <br />
              skip the math.
            </h1>
            <p
              className="rise-in max-w-md text-lg text-muted-foreground"
              style={{ animationDelay: "120ms" }}
            >
              Snap the receipt, split it by item with your friends, and see
              exactly who&apos;s paid you back — tax included. Free to use.
            </p>
            <div
              className="rise-in flex flex-wrap items-center gap-3"
              style={{ animationDelay: "180ms" }}
            >
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
            <p
              className="rise-in text-sm text-muted-foreground"
              style={{ animationDelay: "240ms" }}
            >
              Free to use — add friends, send their share, and settle up in the
              app.
            </p>
          </div>
          <div className="relative flex justify-center md:justify-end">
            {/* Warm glow so the receipt reads as lit, not pasted on. */}
            <div
              aria-hidden="true"
              className="glow-primary pointer-events-none absolute top-1/2 left-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 opacity-70"
            />
            <div
              className="rise-in relative w-full max-w-sm"
              style={{ animationDelay: "160ms" }}
            >
              <div className="hero-float">
                <HeroReceipt />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — set like receipt line items */}
      <section className="border-y border-dashed bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold tracking-tight">
              Dinner&apos;s over in three steps
            </h2>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.number} delay={i * 90} className="flex gap-4">
                <span className="font-mono text-2xl font-bold text-primary tabular-nums">
                  {step.number}
                </span>
                <div className="flex-1 border-t border-dashed pt-3">
                  <h3 className="font-heading mb-1 font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-heading mb-10 text-center text-3xl font-bold tracking-tight">
            Built for the moment the check lands
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 2) * 90} className="h-full">
              <Card className="group h-full rounded-2xl border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <CardContent className="space-y-3 pt-2">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="font-heading text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing CTA — receipt footer */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
            <div
              aria-hidden="true"
              className="bg-dots pointer-events-none absolute inset-0 opacity-20"
            />
            <div className="relative">
              <p className="mb-2 font-mono text-xs tracking-[0.3em] opacity-80">
                *** THANK YOU · COME AGAIN ***
              </p>
              <h2 className="font-heading mb-6 text-3xl font-bold tracking-tight">
                The next bill settles itself
              </h2>
              <Button
                size="lg"
                variant="secondary"
                className="h-11 px-6 text-base"
                nativeButton={false}
                render={<Link href="/signup">Create your free account</Link>}
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
