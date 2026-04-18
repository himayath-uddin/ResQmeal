import { useMemo, useState } from "react";
import { Clock, FileText, LocateFixed, MapPin, PlusCircle, Soup } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ListingLocation } from "@/contexts/FoodContext";

type CreateListingFormProps = {
  loading?: boolean;
  onSubmit: (input: {
    title: string;
    description: string;
    quantity: number;
    location: ListingLocation;
    expiry_time: string;
  }) => Promise<void>;
};

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Soup;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </Label>
      {children}
    </div>
  );
}

export function CreateListingForm({ loading, onSubmit }: CreateListingFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("25");
  const [expiryTime, setExpiryTime] = useState("");
  const [location, setLocation] = useState<ListingLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState("Location not captured yet.");
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );
      if (!response.ok) {
        return "";
      }
      const payload = await response.json();
      return String(payload?.display_name || "");
    } catch {
      return "";
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported on this browser.");
      return;
    }

    setLocationLoading(true);
    setLocationStatus("Capturing current location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const address = await fetchAddress(lat, lng);
        setLocation({
          lat,
          lng,
          address,
        });
        setLocationStatus(address ? "Location captured successfully." : "Coordinates captured successfully.");
        setLocationLoading(false);
      },
      () => {
        setLocationStatus("Unable to capture location. Please allow location permission.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const locationPreview = useMemo(() => {
    if (!location) {
      return locationStatus;
    }
    const lat = location.lat.toFixed(5);
    const lng = location.lng.toFixed(5);
    return location.address ? `${location.address} (${lat}, ${lng})` : `${lat}, ${lng}`;
  }, [location, locationStatus]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!location) {
      setLocationStatus("Capture your current location before publishing.");
      return;
    }
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      quantity: Number(quantity || 0),
      location,
      expiry_time: expiryTime,
    });
    setTitle("");
    setDescription("");
    setQuantity("25");
    setExpiryTime("");
    setLocation(null);
    setLocationStatus("Location not captured yet.");
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-6 sm:p-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
          <PlusCircle className="h-4 w-4" />
          Create Food Listing
        </div>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Post surplus food</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Share food details and make it immediately available to NGOs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Title" icon={Soup}>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Veg Biryani"
            required
            className="h-12 rounded-2xl border-white/40 bg-white/70"
          />
        </Field>

        <Field label="Quantity" icon={PlusCircle}>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
            className="h-12 rounded-2xl border-white/40 bg-white/70"
          />
        </Field>

        <Field label="Location" icon={MapPin}>
          <div className="space-y-2">
            <div className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-600">
              {locationPreview}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={captureLocation}
              disabled={locationLoading || loading}
              className="h-11 rounded-2xl"
            >
              <LocateFixed className="mr-2 h-4 w-4" />
              {locationLoading ? "Capturing..." : "Use Current Location"}
            </Button>
          </div>
        </Field>

        <Field label="Expiry Time" icon={Clock}>
          <Input
            type="datetime-local"
            value={expiryTime}
            onChange={(event) => setExpiryTime(event.target.value)}
            required
            className="h-12 rounded-2xl border-white/40 bg-white/70"
          />
        </Field>
      </div>

      <Field label="Description" icon={FileText}>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Mention packaging, allergens, pickup notes..."
          required
          className="min-h-28 rounded-[1.5rem] border-white/40 bg-white/70"
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 rounded-2xl px-8 text-base font-bold text-white gradient-primary shadow-glow"
      >
        {loading ? "Creating listing..." : "Publish Listing"}
      </Button>
    </form>
  );
}
