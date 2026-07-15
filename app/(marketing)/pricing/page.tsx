import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Pricing",
  description: "Splitza is free to use. A Pro plan is on the way.",
};

const freeFeatures = [
  "Unlimited bills, saved to your account",
  "AI receipt scanning",
  "Per-item splits with proportional tax",
  "Send each friend their share in a tap",
  "Get paid via InstaPay link, username, or QR",
  "Track who's paid — and confirm it",
];

const proFeatures = [
  "Export bills to CSV and PDF",
  "Automatic reminders for unpaid shares",
  "Priority AI models for faster scans",
  "Groups that remember your regulars",
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-12 text-center">
        <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight">
          Free while we grow
        </h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to split a bill costs nothing today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl ring-2 ring-primary">
          <CardHeader>
            <CardTitle className="text-xl">Free</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold tabular-nums">
                $0
              </span>
              <span className="text-sm text-muted-foreground">forever</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t-0 bg-transparent">
            <Button
              className="w-full"
              size="lg"
              nativeButton={false}
              render={<Link href="/signup">Start splitting free</Link>}
            />
          </CardFooter>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Pro</CardTitle>
              <Badge variant="secondary">Coming soon</Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold tabular-nums">
                —
              </span>
              <span className="text-sm text-muted-foreground">per month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {proFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Check className="mt-0.5 size-4 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t-0 bg-transparent">
            <Button className="w-full" size="lg" variant="outline" disabled>
              Not available yet
            </Button>
          </CardFooter>
        </Card>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Everything in Free stays free when Pro arrives.
      </p>
    </section>
  );
}
