import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Truck } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { ListingCard } from "@/components/ListingCard";
import { useFood } from "@/contexts/FoodContext";
import { useAuth } from "@/contexts/AuthContext";
import { getDistance } from "@/lib/distance";

export const Route = createFileRoute("/volunteer-dashboard")({
  head: () => ({
    meta: [{ title: "Volunteer Dashboard — ResQMeal" }],
  }),
  component: VolunteerDashboard,
});

export function VolunteerDashboard() {
  const { user } = useAuth();
  const { listings, users, loading, error, acceptTask, markDelivered } = useFood();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
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

  const availableTasks = useMemo(
    () =>
      listings
        .filter((listing) => listing.status === "available" || listing.status === "claimed_by_ngo")
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
        .sort((left, right) => (left.distance_km ?? Number.POSITIVE_INFINITY) - (right.distance_km ?? Number.POSITIVE_INFINITY)),
    [coords, listings],
  );

  const myDeliveries = useMemo(
    () =>
      listings
        .filter((listing) => listing.volunteer_id === user?.user_id)
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

  const userLookup = useMemo(
    () => Object.fromEntries(users.map((item) => [item.id, item.email])),
    [users],
  );

  return (
    <RequireAuth allowedRoles={["volunteer"]}>
      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="glass-panel rounded-[2rem] px-6 py-8 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
              <Truck className="h-4 w-4" />
              Volunteer Dashboard
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Pickup and deliver tasks</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
              Accept claimed listings, move them into pickup state, and mark successful deliveries.
            </p>
          </div>

          {loading ? (
            <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">Loading delivery tasks...</div>
          ) : error ? (
            <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-red-600">{error}</div>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Available Tasks</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {availableTasks.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  compact
                  donorEmail={userLookup[listing.donor_id]}
                  onAcceptTask={async () => {
                    await acceptTask(listing.id);
                    toast.success("Task accepted.");
                  }}
                />
              ))}
            </div>
            {!loading && availableTasks.length === 0 ? (
              <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">No available pickup tasks right now.</div>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black tracking-tight text-slate-900">My Deliveries</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {myDeliveries.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  compact
                  donorEmail={userLookup[listing.donor_id]}
                  onMarkDelivered={
                    listing.status !== "delivered"
                      ? async () => {
                          await markDelivered(listing.id);
                          toast.success("Delivery completed.");
                        }
                      : undefined
                  }
                />
              ))}
            </div>
            {!loading && myDeliveries.length === 0 ? (
              <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">You have not accepted any deliveries yet.</div>
            ) : null}
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}
