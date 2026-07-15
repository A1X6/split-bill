import { Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "FAQ & contact",
  description: "Answers to common questions about Splitza.",
};

const faqs = [
  {
    question: "Is Splitza really free?",
    answer:
      "Yes. Adding friends, scanning receipts, per-item splits, sending everyone their share, and tracking who's paid are all free. A paid Pro plan with extras like CSV/PDF export and saved groups is planned — everything free today stays free.",
  },
  {
    question: "Do my friends need an account?",
    answer:
      "Yes. You split with friends, so each person needs a free account and accepts your friend request once. After that, adding them to a bill and sending their share is a tap — and they can open their part and pay it.",
  },
  {
    question: "How do friends pay me back?",
    answer:
      "You attach how you'd like to be paid — an InstaPay link, username, or QR — and it travels with each person's share. They open it, pay you in InstaPay, and tap “I've paid.” You confirm you got it, and the bill marks them settled. The transfer itself happens in InstaPay; Splitza keeps the score.",
  },
  {
    question: "How does receipt scanning work?",
    answer:
      "You take a photo, and a vision AI model reads the items, prices, quantities, and tax lines into an editable list. You review it before anything is added to your bill, so mistakes are easy to fix.",
  },
  {
    question: "How is tax split?",
    answer:
      "Proportionally. Each person pays tax on what they actually ordered, not an even share of the total tax. If the receipt has several taxes or service charges, they're compounded the same way the restaurant applied them.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your bills live in your account. When you send someone their share, they can see the bill's items and totals so they can check what they owe — but only the people you send to. Receipt photos are sent to the AI model to be read, then discarded — we don't keep them.",
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-12 text-center">
        <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight">
          Questions, answered
        </h1>
        <p className="text-lg text-muted-foreground">
          The things people ask before their first split.
        </p>
      </div>

      <Accordion className="mb-14">
        {faqs.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger className="text-left font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="rounded-2xl border border-dashed p-8 text-center">
        <h2 className="font-heading mb-2 text-xl font-semibold">
          Something else on your mind?
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Send a note and a human will reply.
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <a href="mailto:ax.ahmed.ax@gmail.com">
              <Mail data-icon="inline-start" />
              ax.ahmed.ax@gmail.com
            </a>
          }
        />
      </div>
    </section>
  );
}
