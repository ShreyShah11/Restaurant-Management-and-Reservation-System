"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { backend } from "@/config/backend";
import { Toast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserData } from '@/store/user';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    cityName: string;
}

export default function EditProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { setUser } = useUserData();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await backend.post("/api/v1/auth/my-profile");
                if (data?.success) {
                    setProfile(data.data);
                } else {
                    Toast.error("Failed to load profile");
                }
            } catch (err) {
                Toast.error("Error fetching profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        try {
            const { data } = await backend.post("/api/v1/auth/update-profile", profile);

            if (data.success) {
                setProfile(data.data);
                setUser({
                    ...profile, ...data.data,
                    role: "customer"
                });
                Toast.success("Profile updated successfully");
                router.push("/customer/dashboard/profile");

            } else {
                Toast.error(data.message || "Update failed");
            }
        } catch (err) {
            Toast.error("Error updating profile");
        } finally {
            setSaving(false);
        }
    };

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
        <div className="flex justify-center py-10 px-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">Edit Profile</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">First Name</label>
                            <Input
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Last Name</label>
                            <Input
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                required
                            />
                        </div>


                        <div>
                            <label className="text-sm font-medium">City</label>
                            <Input
                                value={profile.cityName}
                                onChange={(e) => setProfile({ ...profile, cityName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-around gap-2 mt-6">
                            <Button
                                className="cursor-pointer w-1/2"
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/customer/dashboard/profile")}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={saving} className="cursor-pointer w-1/2 flex items-center gap-2">
                                {saving && <Loader2 className="animate-spin w-4 h-4" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>


                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
