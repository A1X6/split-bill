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
  description: "Answers to common questions about Split Bill.",
};

const faqs = [
  {
    question: "Is Split Bill really free?",
    answer:
      "Yes. Every feature — AI receipt scanning, per-item splits, saved history — is free. A paid Pro plan with extras like shareable links and exports is planned, but everything free today stays free.",
  },
  {
    question: "Do my friends need accounts?",
    answer:
      "No. Only you need an account. The people on your bill are just names you type in — you show or tell them their total.",
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
    question: "Can friends pay through the app?",
    answer:
      "Not yet. Split Bill tells everyone what they owe; you settle up however you already do — cash, transfer, or IOUs.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your bills are stored in your account and visible only to you. Receipt photos are sent to the AI model to be read, then discarded — we don't keep them.",
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
