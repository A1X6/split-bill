import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import StatusScreen from "@/components/status-screen";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      icon={<SearchX className="size-6" />}
      title="This page isn't on the receipt"
      description="The link may be broken, or the page may have moved. Let's get you back on track."
    >
      <Button
        size="lg"
        nativeButton={false}
        render={
          <Link href="/">
            <Home className="size-4" />
            Back home
          </Link>
        }
      />
    </StatusScreen>
  );
}
