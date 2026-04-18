import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  Bell, MapPin, Clock, Utensils, Filter, Flame, Package, CheckCircle2, Search, Sparkles, TrendingUp, AlertCircle, Network
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/ngo")({
  head: () => ({
    meta: [
      { title: "NGO Dashboard — ResQMeal" },
      { name: "description", content: "Browse and accept available food donations near you in real time." },
    ],
  }),
  component: NgoDashboard,
});

type Donation = {
  id: string;
  title: string;
  name?: string; // fallback in UI
  qty: number;
  distanceKm: number;
  expiry_time: string;
  expiresInMin: number;
  donor_id: string;
  donor?: string;
  status: "Urgent" | "Available" | "Claimed" | "Picked Up" | "Expired";
  type: string;
  image: string;
  tags: string[];
  ai_status_reason?: string;
};

// Removed initial hardcoded array

function Countdown({ minutes, timeStr }: { minutes?: number, timeStr?: string }) {
  const [m, setM] = useState(0);
  useEffect(() => {
    if (timeStr) {
      const calcTime = () => Math.max(0, Math.floor((new Date(timeStr).getTime() - Date.now()) / 60000));
      setM(calcTime());
      const t = setInterval(() => setM(calcTime()), 60000);
      return () => clearInterval(t);
    } else if (minutes !== undefined) {
      setM(minutes);
      const t = setInterval(() => setM((v) => Math.max(0, v - 1)), 60000);
      return () => clearInterval(t);
    }
  }, [timeStr, minutes]);
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  const urgent = m < 60;
  return (
    <span className={cn("font-mono font-semibold tabular-nums", urgent ? "text-red-500" : "text-emerald-500")}>
      {hrs > 0 ? `${hrs}h ` : ""}{mins}m
    </span>
  );
}

function NgoDashboard() {
  const [filter, setFilter] = useState<"ai_ranked" | "nearest" | "urgent" | "large">("ai_ranked");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Donation[]>([]);

  const fetchItems = async () => {
    try {
      // Mock latitude and longitude for NGO location
      const { data } = await api.get("/food/nearby?lat=19.0760&lng=72.8777");
      const mapped = data.map((item: any) => ({
        ...item,
        name: item.title,
        donor: item.users?.name || "Local Donor",
        expiresInMin: Math.floor((new Date(item.expiry_time).getTime() - Date.now()) / 60000),
      }));
      setItems(mapped);
    } catch (e) {
      console.error("Failed to load nearby food", e);
    }
  };

  useEffect(() => {
    fetchItems();
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_listings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.success("New Food Alert!", { description: "A new donation was posted nearby!" });
            fetchItems();
          } else if (payload.eventType === 'UPDATE') {
            fetchItems();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  let visible = [...items];
  if (query) visible = visible.filter((d) => (d.name || "").toLowerCase().includes(query.toLowerCase()));
  
  if (filter === "ai_ranked") {
    visible.sort((a, b) => {
      if (a.status === "Urgent" && b.status !== "Urgent") return -1;
      if (b.status === "Urgent" && a.status !== "Urgent") return 1;
      return (a.distanceKm + (a.expiresInMin / 60)) - (b.distanceKm + (b.expiresInMin / 60));
    });
  }
  if (filter === "nearest") visible.sort((a, b) => a.distanceKm - b.distanceKm);
  if (filter === "urgent") visible = visible.filter((d) => d.status === "Urgent" || d.expiresInMin < 60);
  if (filter === "large") visible.sort((a, b) => b.qty - a.qty);

  const claimFood = async (id: string) => {
    try {
      await api.patch(`/food/${id}/claim`, { ngo_id: "NGO_MOCK_UUID" });
      setItems((arr) => arr.map((d) => (d.id === id ? { ...d, status: "Claimed" as const } : d)));
      toast.success("Food Claimed!", { description: "Donor notified. Please pick up before expiry." });
    } catch (err) {
      toast.error("Failed to claim food. It might be already taken.");
    }
  };

  const filters = [
    { key: "ai_ranked" as const, label: "AI Match ✨", icon: Sparkles },
    { key: "nearest" as const, label: "Closest", icon: MapPin },
    { key: "urgent" as const, label: "Expiring Soon", icon: Flame },
    { key: "large" as const, label: "Largest Qty", icon: Package },
  ];

  return (
    <div className="px-6 lg:px-12 py-10 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
              <Network className="h-4 w-4" /> Partner Feed
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mt-2">Intelligent Matching</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Real-time available donations sorted by our AI matching engine.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food types..."
                className="pl-9 rounded-xl h-11 w-64 glass border-border/60 focus-visible:ring-primary/50 bg-background/50"
              />
            </div>
            <button className="relative h-11 w-11 rounded-xl glass border border-white/10 flex items-center justify-center hover:scale-105 transition-smooth">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
                2
              </span>
            </button>
          </div>
        </div>

        {/* AI Recommendations Banner */}
        <div className="grid md:grid-cols-2 gap-4 mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="glass rounded-2xl p-5 flex items-start gap-4 border-l-4 border-orange-500 shadow-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-500/5 mix-blend-overlay"></div>
            <AlertCircle className="h-6 w-6 text-orange-500 mt-0.5 shrink-0 relative z-10" />
            <div className="relative z-10">
              <div className="font-semibold text-foreground">AI Insight: Unclaimed Warnings</div>
              <div className="text-sm text-muted-foreground mt-1 text-balance">
                Your response time is currently higher than average. Missing claims increases food waste radius negatively.
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 flex items-start gap-4 border-l-4 border-primary shadow-elegant relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
            <Sparkles className="h-6 w-6 text-primary mt-0.5 shrink-0 relative z-10" />
            <div className="relative z-10">
              <div className="font-semibold text-foreground">Groq AI Live Recommendation</div>
              <div className="text-sm text-muted-foreground mt-1 text-balance">
                {items.length > 0 && items[0].ai_status_reason ? items[0].ai_status_reason : "Awaiting AI insights for nearby logistics..."}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
          {filters.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-smooth border border-white/10",
                  active
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "glass hover:bg-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "" : "text-primary")} /> {f.label}
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((d, i) => (
            <div
              key={d.id}
              className="glass rounded-3xl overflow-hidden shadow-card border border-white/5 hover:shadow-glow hover:-translate-y-1.5 transition-all duration-300 animate-fade-up group flex flex-col"
              style={{ animationDelay: `${i * 50 + 200}ms` }}
            >
              {/* Image Header */}
              <div className="h-44 w-full relative overflow-hidden bg-muted">
                <img src={d.image} alt={d.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  {d.status === "Urgent" && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-sm">
                      <Flame className="h-3 w-3" /> Expiring Soon
                    </span>
                  )}
                  {d.tags.map(tag => (
                    <span key={tag} className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between z-10">
                  <div className="font-bold text-white text-xl leading-tight line-clamp-1 drop-shadow-md">{d.name}</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col bg-background/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                    {d.type}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {d.distanceKm} km away
                  </div>
                </div>

                <div className="text-sm text-foreground/80 mb-5 line-clamp-1 border-b border-border/50 pb-4">
                  Posted by <span className="font-bold text-foreground">{d.donor}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
                  <div className="rounded-2xl bg-background/50 p-3 flex items-center gap-3 border border-white/10 shadow-sm">
                    <div className="h-8 w-8 rounded-full gradient-warm flex items-center justify-center shrink-0">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Quantity</div>
                      <div className="font-bold text-sm leading-none mt-0.5">{d.qty} Meals</div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-background/50 p-3 flex items-center gap-3 border border-white/10 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Time Left</div>
                      <div className="text-sm leading-none mt-0.5"><Countdown timeStr={d.expiry_time} /></div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => claimFood(d.id)}
                  disabled={d.status === "Claimed" || d.status === "Picked Up"}
                  className={cn(
                    "w-full rounded-xl h-12 transition-smooth font-bold text-[15px]",
                    d.status === "Available" || d.status === "Urgent" 
                      ? "gradient-primary text-primary-foreground shadow-glow hover:scale-[1.02]" 
                      : "bg-muted/80 text-muted-foreground cursor-not-allowed border border-white/5"
                  )}
                >
                  {d.status === "Claimed" ? (
                    <><CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" /> Status: Claimed</>
                  ) : d.status === "Picked Up" ? (
                    "Item Picked Up"
                  ) : (
                    "Claim Food Now"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
