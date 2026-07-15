"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox, LogOut, ReceiptText, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { initialsOf } from "@/lib/initials";
import { ThemeToggle } from "./theme-toggle";

interface AppNavProps {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  userUsername?: string | null;
  pendingShares?: number;
}

export default function AppNav({
  userName,
  userEmail,
  userImage,
  userUsername,
  pendingShares = 0,
}: AppNavProps) {
  const router = useRouter();

  const initials = initialsOf(userName);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ReceiptText className="size-4.5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Split Bill
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label={
                    pendingShares > 0
                      ? `Account menu, ${pendingShares} bills awaiting your response`
                      : "Account menu"
                  }
                  className="relative rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Avatar className="size-8">
                    {userImage ? (
                      <AvatarImage src={userImage} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {pendingShares > 0 && (
                    <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
                      {pendingShares > 9 ? "9+" : pendingShares}
                    </span>
                  )}
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              {/* GroupLabel needs a Group ancestor — Base UI throws without one. */}
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="truncate font-medium">{userName}</div>
                  <div className="truncate text-xs font-normal text-muted-foreground">
                    {userUsername ? `@${userUsername}` : userEmail}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {pendingShares > 0 && (
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <Inbox />
                    Shared with you
                    <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">
                      {pendingShares > 9 ? "9+" : pendingShares}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/friends" />}>
                  <Users />
                  Friends
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
