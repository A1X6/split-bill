"use client";

import Link from "next/link";
import { Menu, ReceiptText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { initialsOf } from "@/lib/initials";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "How it works" },
  { href: "/contact", label: "FAQ" },
];

interface MarketingNavProps {
  /** Present when a session exists — swaps the auth buttons for Dashboard + avatar. */
  user?: { name: string; image?: string | null } | null;
}

export default function MarketingNav({ user }: MarketingNavProps) {
  const initials = user ? initialsOf(user.name) : "";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ReceiptText className="size-4.5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Splitza
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/dashboard">Dashboard</Link>}
              />
              <Link
                href="/profile"
                aria-label="Your profile"
                className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Avatar className="size-8">
                  {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/login">Log in</Link>}
              />
              <Button
                nativeButton={false}
                render={<Link href="/signup">Get started free</Link>}
              />
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Splitza</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Button
                        nativeButton={false}
                        render={<Link href="/dashboard">Dashboard</Link>}
                      />
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/profile">Profile</Link>}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/login">Log in</Link>}
                      />
                      <Button
                        nativeButton={false}
                        render={<Link href="/signup">Get started free</Link>}
                      />
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
