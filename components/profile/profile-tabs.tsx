"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PaymentMethod } from "@/lib/db/schema";
import PasswordForm from "./password-form";
import PaymentMethods from "./payment-methods";
import ProfileForm from "./profile-form";

interface ProfileTabsProps {
  initialName: string;
  initialUsername: string | null;
  initialImage: string | null;
  methods: PaymentMethod[];
}

export default function ProfileTabs({
  initialName,
  initialUsername,
  initialImage,
  methods,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileForm
          initialName={initialName}
          initialUsername={initialUsername}
          initialImage={initialImage}
        />
      </TabsContent>

      <TabsContent value="security">
        <PasswordForm />
      </TabsContent>

      <TabsContent value="payment">
        <PaymentMethods methods={methods} />
      </TabsContent>
    </Tabs>
  );
}
