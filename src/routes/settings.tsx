import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Mail,
  Calendar,
  Save,
  Trash2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — ResQMeal" }],
  }),
  component: SettingsPage,
});

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background rounded-3xl border border-border/40 p-6 lg:p-8 shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground font-medium mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => setChecked(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function SettingsPage() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.user_id), {
        display_name: displayName.trim(),
      });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user?.role === "ngo" ? "NGO" : user?.role === "volunteer" ? "Volunteer" : "Donor";

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background text-foreground pb-24">
        <section className="px-6 lg:px-12 pt-8 pb-8">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-4">
              <SettingsIcon className="h-3.5 w-3.5" />
              Account Settings
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Settings</h1>
            <p className="mt-2 text-muted-foreground font-medium">Manage your account, preferences, and notifications.</p>
          </div>
        </section>

        <section className="px-6 lg:px-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile */}
            <SettingsSection icon={User} title="Profile Information" description="Your personal details and account info.">
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                  <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-black">
                    {(user?.email || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{user?.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{roleLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/20 rounded-xl border border-border/30">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{user?.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Role</Label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/20 rounded-xl border border-border/30">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{roleLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="h-11 rounded-xl"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving || !displayName.trim()}
                  className="h-10 px-6 rounded-xl gradient-primary text-white font-bold text-sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </SettingsSection>

            {/* Notifications */}
            <SettingsSection icon={Bell} title="Notification Preferences" description="Control how and when you receive notifications.">
              <div>
                <ToggleSwitch label="New food listings nearby" description="Get notified when new surplus food is posted near your location." defaultChecked={true} />
                <ToggleSwitch label="Claim updates" description="Receive updates when your food is claimed or a delivery is completed." defaultChecked={true} />
                <ToggleSwitch label="AI urgency alerts" description="Get alerts for high-urgency food that needs immediate rescue." defaultChecked={true} />
                <ToggleSwitch label="Weekly impact digest" description="Receive a weekly summary of your contribution and impact metrics." defaultChecked={false} />
                <ToggleSwitch label="Marketing emails" description="News, product updates, and community stories." defaultChecked={false} />
              </div>
            </SettingsSection>

            {/* Danger Zone */}
            <div className="bg-background rounded-3xl border border-red-200/50 p-6 lg:p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-11 w-11 rounded-2xl bg-red-500 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-0.5">Irreversible actions for your account.</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { logout(); toast.success("Logged out successfully."); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/30 hover:bg-muted/20 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">Sign Out</div>
                      <div className="text-xs text-muted-foreground">Log out of your current session.</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => toast.error("Account deletion is not available in the current version.")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-red-200/50 hover:bg-red-50/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="text-sm font-semibold text-red-600">Delete Account</div>
                      <div className="text-xs text-muted-foreground">Permanently delete your account and all data.</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}
