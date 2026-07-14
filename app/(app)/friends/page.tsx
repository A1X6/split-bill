import FriendsTabs from "@/components/friends/friends-tabs";
import {
  getAcceptedFriends,
  getIncomingRequests,
  getOutgoingRequests,
} from "@/lib/friends";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Friends",
};

export default async function FriendsPage() {
  const user = await requireUser();

  const [friends, incoming, outgoing] = await Promise.all([
    getAcceptedFriends(user.id),
    getIncomingRequests(user.id),
    getOutgoingRequests(user.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-heading mb-6 text-2xl font-bold tracking-tight">
        Friends
      </h1>
      <FriendsTabs friends={friends} incoming={incoming} outgoing={outgoing} />
    </div>
  );
}
