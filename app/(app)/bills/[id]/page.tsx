import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import BillEditor from "@/components/bill/BillEditor";
import { db } from "@/lib/db";
import { bills } from "@/lib/db/schema";
import { getAcceptedFriends } from "@/lib/friends";
import { requireUser } from "@/lib/session";

export default async function BillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  // Scoped by owner — another user's bill id 404s (no existence leak).
  const bill = await db.query.bills.findFirst({
    where: and(eq(bills.id, id), eq(bills.userId, user.id)),
  });

  if (!bill) {
    notFound();
  }

  // Fetched server-side so the editor can offer "Add from friends" without a
  // client waterfall.
  const friends = await getAcceptedFriends(user.id);

  return (
    <BillEditor
      initialBill={bill}
      currentUser={{ id: user.id, name: user.name, image: user.image ?? null }}
      friends={friends}
    />
  );
}
