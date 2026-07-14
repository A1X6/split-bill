"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FriendSummary, PendingRequest } from "@/lib/friends";
import FriendSearch from "./friend-search";
import FriendsList from "./friends-list";
import RequestList from "./request-list";

interface FriendsTabsProps {
  friends: (FriendSummary & { friendshipId: string })[];
  incoming: PendingRequest[];
  outgoing: PendingRequest[];
}

export default function FriendsTabs({
  friends,
  incoming,
  outgoing,
}: FriendsTabsProps) {
  return (
    <Tabs defaultValue="friends" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="friends">
          Friends
          {friends.length > 0 && (
            <Badge variant="secondary" className="ml-1.5">
              {friends.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="requests">
          Requests
          {incoming.length > 0 && (
            <Badge className="ml-1.5">{incoming.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="add">Add</TabsTrigger>
      </TabsList>

      <TabsContent value="friends">
        <FriendsList friends={friends} />
      </TabsContent>

      <TabsContent value="requests">
        <RequestList incoming={incoming} outgoing={outgoing} />
      </TabsContent>

      <TabsContent value="add">
        <FriendSearch />
      </TabsContent>
    </Tabs>
  );
}
