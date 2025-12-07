"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { backend } from "@/config/backend";
import { Toast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  cityName: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await backend.post("/api/v1/auth/my-profile");
        if (data?.success) {
          setProfile(data.data);
        } else {
          Toast.error("Failed to load profile");
        }
      } catch (error) {
        console.error(error);
        Toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-15 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">My Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <ProfileRow label="First Name" value={profile.firstName} />
          <ProfileRow label="Last Name" value={profile.lastName} />
          <ProfileRow label="Email" value={profile.email} />
          <ProfileRow label="City" value={profile.cityName} />
        </CardContent>

        <div className="flex gap-2 justify-around p-4 w-full">
          <Button onClick={() => router.push("/customer/dashboard")}
            className="cursor-pointer w-1/2"
            type="button"
            variant="outline"
          >
            Back
          </Button>
          <Button
            className="cursor-pointer w-1/2"
            onClick={() => router.push("/customer/dashboard/profile/edit")}>
            Edit Profile
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2">
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">{value || "-"}</span>
    </div>
  );
};