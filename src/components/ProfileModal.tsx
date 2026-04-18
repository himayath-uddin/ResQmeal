import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthSession } from "@/lib/auth";

type ProfileModalProps = {
  user: AuthSession;
  onClose: () => void;
};

type ProfileData = {
  name?: string;
  organization?: string;
  phone?: string;
  address?: string;
  coverage_area?: string;
  contact_number?: string;
  availability?: string;
};

export function ProfileModal({ user, onClose }: ProfileModalProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({});

  useEffect(() => {
    getDoc(doc(db, "users", user.user_id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          name: data.name || "",
          organization: data.organization || "",
          phone: data.phone || "",
          address: data.address || "",
          coverage_area: data.coverage_area || "",
          contact_number: data.contact_number || "",
          availability: data.availability || "",
        });
      }
    });
  }, [user.user_id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.user_id), { ...profile, email: user.email, role: user.role }, { merge: true });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof ProfileData, placeholder = "") => (
    <div className="space-y-1">
      <Label className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</Label>
      {editing ? (
        <Input
          value={profile[key] || ""}
          onChange={(e) => setProfile((prev) => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          className="h-11 rounded-2xl border-white/40 bg-white/70"
        />
      ) : (
        <div className="rounded-2xl border border-white/40 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-700">
          {profile[key] || <span className="text-slate-400 font-normal">Not set</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">My Profile</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{user.email} · {user.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-full p-2 hover:bg-slate-100 transition-colors"
              title="Edit profile"
            >
              <Pencil className="h-4 w-4 text-primary" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {field("Name", "name", "Your full name")}

          {user.role === "donor" && (
            <>
              {field("Organization", "organization", "Restaurant / company name")}
              {field("Phone", "phone", "+91 XXXXX XXXXX")}
              {field("Address", "address", "Pickup address")}
            </>
          )}

          {user.role === "ngo" && (
            <>
              {field("Coverage Area", "coverage_area", "e.g. Hyderabad South")}
              {field("Contact Number", "contact_number", "+91 XXXXX XXXXX")}
            </>
          )}

          {user.role === "volunteer" && (
            <>
              {field("Phone", "phone", "+91 XXXXX XXXXX")}
              {field("Availability", "availability", "e.g. Weekdays 9am-6pm")}
            </>
          )}
        </div>

        {editing && (
          <Button
            className="w-full h-12 rounded-2xl gradient-primary text-white font-bold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        )}
      </div>
    </div>
  );
}
