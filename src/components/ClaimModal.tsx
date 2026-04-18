import { useState } from "react";
import { MapPin, Navigation, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserLabel } from "@/lib/auth";
import type { AppUser, FoodListing } from "@/contexts/FoodContext";

type ClaimModalProps = {
  listing: FoodListing;
  volunteers: AppUser[];
  ngoLocation: { lat: number; lng: number } | null;
  onClose: () => void;
  onClaim: () => Promise<void>;
  onAssignVolunteer: (volunteerId: string) => Promise<void>;
};

function getListingLatLng(listing: FoodListing) {
  if (listing.location && typeof listing.location === "object") {
    return { lat: listing.location.lat, lng: listing.location.lng };
  }
  return null;
}

export function ClaimModal({ listing, volunteers, ngoLocation, onClose, onClaim, onAssignVolunteer }: ClaimModalProps) {
  const [step, setStep] = useState<"navigate" | "assign">("navigate");
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [loading, setLoading] = useState(false);
  const coords = getListingLatLng(listing);

  const googleMapsDirectionUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    : null;

  const handleClaim = async () => {
    setLoading(true);
    try {
      await onClaim();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVolunteer = async () => {
    if (!selectedVolunteer) return;
    setLoading(true);
    try {
      await onAssignVolunteer(selectedVolunteer);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-6 space-y-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Navigate to Restaurant</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{listing.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {step === "navigate" && (
          <div className="space-y-3">
            <Button
              className="w-full h-12 rounded-2xl gradient-primary text-white font-bold"
              onClick={handleClaim}
              disabled={loading}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Open Route in App (Claim & Navigate)
            </Button>

            {googleMapsDirectionUrl && (
              <a
                href={googleMapsDirectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                <MapPin className="h-4 w-4 text-primary" />
                Open in Google Maps
              </a>
            )}

            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl font-bold"
              onClick={() => setStep("assign")}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Assign Volunteer Instead
            </Button>
          </div>
        )}

        {step === "assign" && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-600">Select a volunteer to handle this pickup:</p>
            <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
              <SelectTrigger className="h-12 rounded-2xl border-white/40 bg-white/70">
                <SelectValue placeholder="Choose volunteer" />
              </SelectTrigger>
              <SelectContent>
                {volunteers.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {getUserLabel(v.email)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {volunteers.length === 0 && (
              <p className="text-xs font-semibold text-slate-400">No volunteers registered yet.</p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setStep("navigate")}>
                Back
              </Button>
              <Button
                className="flex-1 rounded-2xl gradient-primary text-white font-bold"
                onClick={handleAssignVolunteer}
                disabled={!selectedVolunteer || loading}
              >
                Assign Volunteer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
