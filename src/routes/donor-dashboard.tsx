import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, BellRing, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { CreateListingForm } from "@/components/CreateListingForm";
import { ListingCard } from "@/components/ListingCard";
import { useFood } from "@/contexts/FoodContext";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/donor-dashboard")({
  head: () => ({
    meta: [{ title: "Donor Dashboard — ResQMeal" }],
  }),
  component: DonorDashboard,
});

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof BarChart3 }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</div>
          <div className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

function DonorDashboard() {
  const { user } = useAuth();
  const { listings, loading, error, createListing, deleteListing, markUrgent } = useFood();
  const [creating, setCreating] = useState(false);

  const myListings = useMemo(
    () => listings.filter((listing) => listing.donor_id === user?.user_id),
    [listings, user?.user_id],
  );

  const highUrgencyListings = useMemo(
    () => myListings.filter((listing) => listing.ai_insights?.urgency === "high").length,
    [myListings],
  );

  const activeListings = myListings.filter((listing) => listing.status === "available").length;

  return (
    <RequireAuth allowedRoles={["donor"]}>
      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="glass-panel rounded-[2rem] px-6 py-8 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
              <ClipboardList className="h-4 w-4" />
              Donor Dashboard
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Manage your food listings</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
              Create live listings, keep urgent items visible, and track your donation flow in real time through Firestore.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Listings" value={myListings.length} icon={BarChart3} />
            <StatCard label="Active Listings" value={activeListings} icon={BellRing} />
            <StatCard label="Completed" value={myListings.filter((item) => item.status === "delivered").length} icon={ClipboardList} />
            <StatCard label="AI High Urgency" value={highUrgencyListings} icon={BellRing} />
          </div>

          <CreateListingForm
            loading={creating}
            onSubmit={async (input) => {
              setCreating(true);
              try {
                await createListing(input);
                toast.success("Listing created successfully.");
              } catch (submitError) {
                toast.error(submitError instanceof Error ? submitError.message : "Failed to create listing.");
              } finally {
                setCreating(false);
              }
            }}
          />

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">My Listings</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Everything you have posted through your donor account.</p>
            </div>

            {loading ? (
              <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">Loading your listings...</div>
            ) : error ? (
              <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-red-600">{error}</div>
            ) : myListings.length === 0 ? (
              <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">No donor listings yet.</div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {myListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    compact
                    onDelete={async () => {
                      await deleteListing(listing.id);
                      toast.success("Listing deleted.");
                    }}
                    onMarkUrgent={async () => {
                      await markUrgent(listing.id, !listing.urgent);
                      toast.success(listing.urgent ? "Urgent flag removed." : "Listing marked urgent.");
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}
