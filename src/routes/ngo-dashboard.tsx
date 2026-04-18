import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, ClipboardCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { ListingCard } from "@/components/ListingCard";
import { useFood } from "@/contexts/FoodContext";
import { useAuth } from "@/contexts/AuthContext";
import { getDistance } from "@/lib/distance";
import { getUrgencyScore } from "@/lib/aiService";
import { generateNGOAlerts } from "@/ai/predictionEngine";

export const Route = createFileRoute("/ngo-dashboard")({
  head: () => ({
    meta: [{ title: "NGO Dashboard — ResQMeal" }],
  }),
  component: NGODashboard,
});

export function NGODashboard() {
  const { user } = useAuth();
  const { listings, users, volunteers, loading, error, claimListing, assignVolunteer } = useFood();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [alertTick, setAlertTick] = useState(0);
  const radiusKm = 30;

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAlertTick((value) => value + 1);
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const availableListings = useMemo(
    () =>
      listings
        .filter((listing) => listing.status === "available")
        .map((listing) => {
          const hasCoords =
            coords &&
            typeof listing.location === "object" &&
            typeof listing.location.lat === "number" &&
            typeof listing.location.lng === "number";
          const distance_km = hasCoords
            ? getDistance(coords.lat, coords.lng, listing.location.lat, listing.location.lng)
            : undefined;
          return { ...listing, distance_km };
        })
        .filter((listing) => listing.distance_km === undefined || listing.distance_km <= radiusKm)
        .sort((left, right) => {
          const urgencyDiff = getUrgencyScore(right.ai_insights?.urgency) - getUrgencyScore(left.ai_insights?.urgency);
          if (urgencyDiff !== 0) {
            return urgencyDiff;
          }
          const distanceDiff = (left.distance_km ?? Number.POSITIVE_INFINITY) - (right.distance_km ?? Number.POSITIVE_INFINITY);
          if (distanceDiff !== 0) {
            return distanceDiff;
          }
          return new Date(left.expiry_time).getTime() - new Date(right.expiry_time).getTime();
        }),
    [coords, listings],
  );

  const myClaims = useMemo(
    () =>
      listings
        .filter((listing) => listing.claimed_by === user?.user_id)
        .map((listing) => {
          const hasCoords =
            coords &&
            typeof listing.location === "object" &&
            typeof listing.location.lat === "number" &&
            typeof listing.location.lng === "number";
          const distance_km = hasCoords
            ? getDistance(coords.lat, coords.lng, listing.location.lat, listing.location.lng)
            : undefined;
          return { ...listing, distance_km };
        }),
    [coords, listings, user?.user_id],
  );

  const suggestions = useMemo(() => {
    const highPriorityNear = availableListings.find(
      (listing) => listing.ai_insights?.urgency === "high" && (listing.distance_km ?? Number.MAX_VALUE) <= 10,
    );
    const expiringSoon = availableListings.find((listing) => new Date(listing.expiry_time).getTime() - Date.now() <= 2 * 60 * 60 * 1000);
    return [
      highPriorityNear ? "High priority food near you" : null,
      expiringSoon ? "Expiring soon listings available" : null,
    ].filter(Boolean) as string[];
  }, [availableListings]);

  const smartAlerts = useMemo(() => {
    return generateNGOAlerts(coords, listings);
  }, [alertTick, coords, listings]);

  const userLookup = useMemo(
    () => Object.fromEntries(users.map((item) => [item.id, item.email])),
    [users],
  );

  return (
    <RequireAuth allowedRoles={["ngo"]}>
      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="glass-panel rounded-[2rem] px-6 py-8 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
              <Building2 className="h-4 w-4" />
              NGO Dashboard
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Browse and claim food</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
              Review available listings, claim what your NGO can handle, and assign volunteers for pickups.
            </p>
          </div>

          {loading ? (
            <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">Loading food listings...</div>
          ) : error ? (
            <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-red-600">{error}</div>
          ) : null}

          <section className="space-y-4">
            {suggestions.length > 0 ? (
              <div className="glass-panel rounded-[1.5rem] p-4 text-sm font-semibold text-slate-700">
                {suggestions.join(" • ")}
              </div>
            ) : null}
            <div className="glass-panel rounded-[1.5rem] p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-primary">AI Smart Alerts</h3>
              <div className="mt-3 space-y-2">
                {smartAlerts.map((alert) => (
                  <div key={alert} className="rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700">
                    {alert}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Browse Listings</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {availableListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  compact
                  donorEmail={userLookup[listing.donor_id]}
                  onClaim={async () => {
                    await claimListing(listing.id);
                    toast.success("Food claimed successfully.");
                  }}
                />
              ))}
            </div>
            {!loading && availableListings.length === 0 ? (
              <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">No available food right now.</div>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black tracking-tight text-slate-900">My Claims</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {myClaims.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  compact
                  donorEmail={userLookup[listing.donor_id]}
                  volunteerOptions={volunteers}
                  onAssignVolunteer={async (volunteerId) => {
                    await assignVolunteer(listing.id, volunteerId);
                    toast.success("Volunteer assigned.");
                  }}
                />
              ))}
            </div>
            {!loading && myClaims.length === 0 ? (
              <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">You have not claimed any listings yet.</div>
            ) : null}
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}
