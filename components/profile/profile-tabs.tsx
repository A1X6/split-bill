"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PasswordForm from "./password-form";
import ProfileForm from "./profile-form";

interface ProfileTabsProps {
  initialName: string;
  initialUsername: string | null;
  initialImage: string | null;
}

export default function ProfileTabs({
  initialName,
  initialUsername,
  initialImage,
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
        <p className="text-sm text-muted-foreground">
          Payment methods are coming soon.
        </p>
      </TabsContent>
    </Tabs>
  );
}
