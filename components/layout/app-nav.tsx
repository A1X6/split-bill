"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

interface AppNavProps {
  userName: string;
  userEmail: string;
}

export default function AppNav({ userName, userEmail }: AppNavProps) {
  const router = useRouter();

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
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="text-lg font-bold">
          Split Bill
        </Link>
        <div className="flex items-center gap-4">
          <span
            className="hidden text-sm text-gray-500 dark:text-gray-400 sm:inline"
            title={userEmail}
          >
            {userName}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
