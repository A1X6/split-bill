import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Send, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How it works",
  description:
    "Add friends, scan the receipt, send everyone their share, and track who's paid — tax included.",
};

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Add your friends",
    body: "Search a friend by username or email and send a request. Once they accept, they're on your friends list — ready to add to any bill. You split with friends, so both of you have a free account and can see what's owed.",
  },
  {
    icon: Camera,
    number: "02",
    title: "Scan the receipt — or type it in",
    body: "Take a photo and the AI reads every line: items, unit prices, quantities, and each tax or service charge. Review the list, fix anything it misread, and assign each item to the people who had it. Prefer typing? Add items by hand just as fast.",
  },
  {
    icon: Send,
    number: "03",
    title: "Send everyone their share",
    body: "Pick who paid — usually you — and attach how you'd like to be paid back: an InstaPay link, username, or QR. One tap sends every friend on the bill their exact share, with the payment details built in. No group chat, no re-picking who to send to.",
  },
  {
    icon: BadgeCheck,
    number: "04",
    title: "Track who's paid",
    body: "Each friend opens their share, pays you in InstaPay, and taps “I've paid.” You confirm you received it, and the bill marks them settled. Your dashboard shows, at a glance, which bills are fully paid and which are still owed.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-14 text-center">
        <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight">
          How Splitza works
        </h1>
        <p className="text-lg text-muted-foreground">
          From &quot;check, please&quot; to settled up — without the group-chat
          math.
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
