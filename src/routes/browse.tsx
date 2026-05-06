import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  SlidersHorizontal,
  Clock,
  MapPin,
  Package,
  Sparkles,
  ArrowRight,
  Flame,
  Leaf,
  UtensilsCrossed,
  Box,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFood, type FoodListing } from "@/contexts/FoodContext";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Available Food — ResQMeal" },
      {
        name: "description",
        content:
          "Browse surplus food listings available for rescue. Sign up to claim food and help reduce waste.",
      },
    ],
  }),
  component: BrowsePage,
});

type CategoryFilter = "all" | "veg" | "non-veg" | "packaged";
type SortMode = "newest" | "urgency" | "expiring" | "quantity";

function classifyFood(title: string, description: string): "veg" | "non-veg" | "packaged" {
  const text = `${title} ${description}`.toLowerCase();
  if (/(packaged|biscuit|sealed|packet|bar|dry fruit|snack|energy)/.test(text)) return "packaged";
  if (/(chicken|meat|mutton|fish|egg|prawn|lamb|beef)/.test(text)) return "non-veg";
  return "veg";
}

function getTimeLeft(expiryTime: string) {
  const diff = new Date(expiryTime).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function getLocationLabel(location: FoodListing["location"]) {
  if (typeof location === "string") return location;
  if (location?.address) return location.address;
  if (location && typeof location.lat === "number") return `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
  return "Location unavailable";
}

const categoryConfig = {
  all: { label: "All Food", icon: UtensilsCrossed, color: "text-slate-700 bg-slate-100 border-slate-200" },
  veg: { label: "Vegetarian", icon: Leaf, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "non-veg": { label: "Non-Veg", icon: Flame, color: "text-red-700 bg-red-50 border-red-200" },
  packaged: { label: "Packaged", icon: Box, color: "text-blue-700 bg-blue-50 border-blue-200" },
};

const urgencyColors = {
  high: "bg-red-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-emerald-500 text-white",
};

function BrowsePage() {
  const { listings, loading } = useFood();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortMode>("newest");

  const availableListings = useMemo(() => {
    let result = listings.filter((l) => l.status === "available");

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          getLocationLabel(l.location).toLowerCase().includes(q),
      );
    }

    if (category !== "all") {
      result = result.filter((l) => classifyFood(l.title, l.description) === category);
    }

    switch (sort) {
      case "urgency":
        result.sort((a, b) => {
          const w: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return (w[b.ai_insights?.urgency || "medium"] || 2) - (w[a.ai_insights?.urgency || "medium"] || 2);
        });
        break;
      case "expiring":
        result.sort((a, b) => new Date(a.expiry_time).getTime() - new Date(b.expiry_time).getTime());
        break;
      case "quantity":
        result.sort((a, b) => b.quantity - a.quantity);
        break;
      case "newest":
      default:
        result.sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        });
    }
    return result;
  }, [listings, search, category, sort]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Hero Banner */}
      <section className="relative px-6 lg:px-12 pt-8 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-30%] left-[20%] w-[500px] h-[500px] bg-primary/8 blur-[120px] rounded-full" />
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-orange-500/8 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Live Food Feed — Updated in Real Time
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
            Browse Available{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              Surplus Food
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl font-medium">
            Explore food listings posted by restaurants, caterers, and households. Sign up to claim and help rescue meals before they go to waste.
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="px-6 lg:px-12 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search food, location, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/50 bg-muted/30"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(categoryConfig) as CategoryFilter[]).map((key) => {
                const cfg = categoryConfig[key];
                const Icon = cfg.icon;
                const active = category === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      active
                        ? "bg-primary text-white border-primary shadow-sm"
                        : `${cfg.color} hover:shadow-sm`
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="text-sm font-semibold bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-foreground"
              >
                <option value="newest">Newest First</option>
                <option value="urgency">Highest Urgency</option>
                <option value="expiring">Expiring Soon</option>
                <option value="quantity">Most Quantity</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-muted/30 rounded-3xl h-[420px] animate-pulse border border-border/30" />
              ))}
            </div>
          ) : availableListings.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-20 w-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No food listings found</h3>
              <p className="text-muted-foreground font-medium max-w-md mx-auto">
                {search || category !== "all"
                  ? "Try adjusting your search or filters."
                  : "Check back soon — new listings appear in real time."}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-muted-foreground">
                  Showing <span className="text-foreground font-bold">{availableListings.length}</span> available listings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableListings.map((listing) => {
                  const foodType = classifyFood(listing.title, listing.description);
                  const timeLeft = getTimeLeft(listing.expiry_time);
                  const urgency = listing.ai_insights?.urgency || "medium";

                  return (
                    <div
                      key={listing.id}
                      className="group bg-background rounded-3xl border border-border/40 shadow-sm hover:shadow-elegant hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        {listing.image_url ? (
                          <img
                            src={listing.image_url}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                            <UtensilsCrossed className="h-12 w-12 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Urgency Badge */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${urgencyColors[urgency]}`}>
                            {urgency === "high" && <TriangleAlert className="inline h-3 w-3 mr-1 -mt-0.5" />}
                            {urgency} urgency
                          </span>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            {foodType === "veg" ? "🌿 Veg" : foodType === "non-veg" ? "🍗 Non-Veg" : "📦 Packaged"}
                          </span>
                        </div>

                        {/* Time Left */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg">
                          <Clock className="h-3 w-3" />
                          <span className="text-[11px] font-bold">{timeLeft}</span>
                        </div>

                        {/* Quantity */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-primary/90 text-white px-2.5 py-1 rounded-lg">
                          <Package className="h-3 w-3" />
                          <span className="text-[11px] font-bold">{listing.quantity} meals</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-1">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">{listing.description}</p>

                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                          <span className="line-clamp-1 font-medium">{getLocationLabel(listing.location)}</span>
                        </div>

                        {listing.ai_insights?.recommendation ? (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4 bg-muted/30 rounded-xl p-3">
                            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                            <span className="font-semibold">Best for: {listing.ai_insights.recommendation}</span>
                          </div>
                        ) : null}

                        <div className="mt-auto pt-3 border-t border-border/30">
                          {user ? (
                            <Link
                              to={user.role === "ngo" ? "/ngo-dashboard" : user.role === "volunteer" ? "/volunteer-dashboard" : "/donor-dashboard"}
                            >
                              <Button className="w-full h-10 rounded-xl gradient-primary text-white font-bold text-sm">
                                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Link to="/signup">
                              <Button className="w-full h-10 rounded-xl gradient-primary text-white font-bold text-sm">
                                Sign Up to Claim <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="px-6 lg:px-12 mt-20">
          <div className="max-w-7xl mx-auto rounded-3xl bg-foreground text-background p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full gradient-primary opacity-30 blur-[100px]" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-4">
                Ready to rescue food and fight hunger?
              </h2>
              <p className="text-white/70 text-lg font-medium max-w-xl mx-auto mb-8">
                Join thousands of donors, NGOs, and volunteers on the most intelligent food rescue platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-14 px-10 rounded-2xl gradient-primary text-white font-bold text-lg border border-white/20 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <Link to="/signup">Create Free Account <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-10 rounded-2xl bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold text-lg backdrop-blur-md">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
