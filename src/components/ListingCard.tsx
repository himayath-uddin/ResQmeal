import { Clock, MapPin, Package, Sparkles, Trash2, TriangleAlert, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getUserLabel } from "@/lib/auth";
import type { AppUser, FoodListing } from "@/contexts/FoodContext";
import { formatDistance, getTimeUntilExpiry } from "@/lib/distance";

type ListingCardProps = {
  listing: FoodListing;
  donorEmail?: string;
  compact?: boolean;
  volunteerOptions?: AppUser[];
  onClaim?: () => void;
  onDelete?: () => void;
  onMarkUrgent?: () => void;
  onAssignVolunteer?: (volunteerId: string) => void;
  onAcceptTask?: () => void;
  onMarkDelivered?: () => void;
};

function formatExpiry(value: string) {
  return new Date(value).toLocaleString();
}

function getLocationLabel(location: FoodListing["location"]) {
  if (typeof location === "string") {
    return location;
  }
  if (location?.address) {
    return location.address;
  }
  if (location && typeof location.lat === "number" && typeof location.lng === "number") {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }
  return "Location unavailable";
}

export function ListingCard({
  listing,
  donorEmail,
  compact,
  volunteerOptions,
  onClaim,
  onDelete,
  onMarkUrgent,
  onAssignVolunteer,
  onAcceptTask,
  onMarkDelivered,
}: ListingCardProps) {
  const donorLabel = donorEmail ? getUserLabel(donorEmail) : "Unknown User";
  const urgencyLabel = listing.ai_insights?.urgency || (listing.urgent ? "high" : "medium");
  const distanceLabel = formatDistance(listing.distance_km);

  return (
    <div
      className={cn(
        "card-premium flex min-w-0 flex-col rounded-[1.8rem] border border-white/40 p-5 shadow-card",
        compact ? "h-full" : "",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
              {listing.status}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
              {urgencyLabel} urgency
            </span>
            {distanceLabel ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-sky-700">
                {distanceLabel}
              </span>
            ) : null}
            {listing.urgent ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                <TriangleAlert className="h-3 w-3" />
                Urgent
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-900">{listing.title}</h3>
          <p className="mt-2 break-words text-sm font-medium leading-relaxed text-slate-500">{listing.description}</p>
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="mt-4 h-40 w-full rounded-2xl object-cover"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
          AI Verified
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.35rem] border border-white/50 bg-white/65 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            <Package className="h-4 w-4 text-primary" />
            Quantity
          </div>
          <div className="mt-2 text-lg font-black text-slate-900">{listing.quantity} meals</div>
        </div>
        <div className="rounded-[1.35rem] border border-white/50 bg-white/65 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            <Clock className="h-4 w-4 text-primary" />
            Expiry
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900">{formatExpiry(listing.expiry_time)}</div>
          <div className="mt-1 text-xs font-semibold text-rose-600">{getTimeUntilExpiry(listing.expiry_time)}</div>
        </div>
      </div>

      <div className="mt-4 rounded-[1.35rem] border border-white/50 bg-white/65 p-4 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="break-words">{getLocationLabel(listing.location)}</span>
        </div>
        {listing.ai_insights?.storage_tip ? <div className="mt-3 text-xs font-semibold text-slate-700">{listing.ai_insights.storage_tip}</div> : null}
        <div className="mt-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-slate-700">Donor:</span>
          <span className="break-words font-bold text-slate-900">{donorLabel}</span>
        </div>
      </div>

      {onAssignVolunteer && volunteerOptions ? (
        <div className="mt-4">
          <Select onValueChange={onAssignVolunteer}>
            <SelectTrigger className="h-11 rounded-2xl border-white/40 bg-white/70">
              <SelectValue placeholder="Assign volunteer" />
            </SelectTrigger>
            <SelectContent>
              {volunteerOptions.map((volunteer) => (
                <SelectItem key={volunteer.id} value={volunteer.id}>
                  {getUserLabel(volunteer.email)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {onClaim ? (
          <Button className="rounded-2xl gradient-primary text-white" onClick={onClaim}>
            Claim Food
          </Button>
        ) : null}
        {onAcceptTask ? (
          <Button className="rounded-2xl gradient-primary text-white" onClick={onAcceptTask}>
            <Truck className="mr-2 h-4 w-4" />
            Accept Task
          </Button>
        ) : null}
        {onMarkDelivered ? (
          <Button className="rounded-2xl gradient-primary text-white" onClick={onMarkDelivered}>
            Mark Delivered
          </Button>
        ) : null}
        {onMarkUrgent ? (
          <Button variant="outline" className="rounded-2xl" onClick={onMarkUrgent}>
            Mark Urgent
          </Button>
        ) : null}
        {onDelete ? (
          <Button variant="outline" className="rounded-2xl" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}
