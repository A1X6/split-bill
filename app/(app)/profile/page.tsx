import ProfileTabs from "@/components/profile/profile-tabs";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-heading mb-6 text-2xl font-bold tracking-tight">
        Your account
      </h1>
      <ProfileTabs
        initialName={user.name}
        initialUsername={user.username ?? null}
        initialImage={user.image ?? null}
      />
    </div>
  );
}
