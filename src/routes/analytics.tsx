import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Utensils, Trash2, Cloud, Truck, TrendingUp, TrendingDown, BrainCircuit, Trophy, Award, AlertTriangle, FileQuestion, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { RequireAuth } from "@/components/RequireAuth";
import { useFood } from "@/contexts/FoodContext";
import { getDistance } from "@/lib/distance";
import { getUserLabel } from "@/lib/auth";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Impact & Intelligence — ResQMeal" },
      { name: "description", content: "Track meals saved, AI insights, and leaderboard." },
    ],
  }),
  component: Analytics,
});

function KPI({ icon: Icon, label, value, delta, positive = true }: any) {
  return (
    <div className="glass rounded-3xl p-6 shadow-elegant hover:shadow-glow hover:-translate-y-1 transition-smooth border border-white/5 relative overflow-hidden">
      <div className="flex items-start justify-between relative z-10">
        <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${positive ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {delta}
        </div>
      </div>
      <div className="mt-5 text-3xl font-black tracking-tighter relative z-10">{value}</div>
      <div className="text-sm font-semibold text-muted-foreground mt-1 relative z-10">{label}</div>
    </div>
  );
}

function Analytics() {
  const { listings, users, loading, error } = useFood();
  const { stats, monthlyTrend, co2Trend, leaderboard, expiryEngine } = useMemo(() => {
    const now = Date.now();
    let mealsSaved = 0;
    let activeListingsCount = 0;
    let tVeg = 0;
    let tNon = 0;
    let tPack = 0;
    const donorScores = new Map<string, { meals_saved: number; completed_listings: number; expired_listings: number }>();
    const monthlyBuckets = new Map<string, { meals: number; waste: number }>();

    listings.forEach((listing) => {
      const quantity = Number(listing.quantity || 0);
      const status = listing.status;
      const expiryMs = new Date(listing.expiry_time).getTime();

      if (status === "claimed_by_ngo" || status === "claimed_by_volunteer" || status === "delivered") {
        mealsSaved += quantity;
      }
      if (status === "available") {
        activeListingsCount += 1;
      }

      if (listing.title.toLowerCase().includes("veg")) tVeg += quantity;
      else if (listing.title.toLowerCase().includes("chicken") || listing.title.toLowerCase().includes("meat")) tNon += quantity;
      else tPack += quantity;

      const donorCurrent = donorScores.get(listing.donor_id) || { meals_saved: 0, completed_listings: 0, expired_listings: 0 };
      if (status === "claimed_by_ngo" || status === "claimed_by_volunteer" || status === "delivered") {
        donorCurrent.meals_saved += quantity;
      }
      if (status === "delivered") {
        donorCurrent.completed_listings += 1;
      }
      if (expiryMs < now && status !== "delivered") {
        donorCurrent.expired_listings += 1;
      }
      donorScores.set(listing.donor_id, donorCurrent);

      const created = listing.created_at ? new Date(listing.created_at) : new Date();
      const key = `${created.getFullYear()}-${created.getMonth()}`;
      const currentBucket = monthlyBuckets.get(key) || { meals: 0, waste: 0 };
      if (status === "claimed_by_ngo" || status === "claimed_by_volunteer" || status === "delivered") {
        currentBucket.meals += quantity;
      }
      if (expiryMs < now && status !== "delivered") {
        currentBucket.waste += quantity;
      }
      monthlyBuckets.set(key, currentBucket);
    });

    if (tVeg === 0 && tNon === 0 && tPack === 0) {
      tVeg = 1;
      tNon = 1;
      tPack = 1;
    }

    const userLookup = Object.fromEntries(users.map((user) => [user.id, user.email]));
    const leaderboard = Array.from(donorScores.entries())
      .map(([donorId, data]) => ({
        donorId,
        name: getUserLabel(userLookup[donorId] || "donor@example.com"),
        score: data.meals_saved * 5 + data.completed_listings * 10 - data.expired_listings,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const monthlyTrend = Array.from(monthlyBuckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-8)
      .map(([key, value]) => {
        const monthIdx = Number(key.split("-")[1]);
        return { m: new Date(2025, monthIdx, 1).toLocaleString("en-US", { month: "short" }), meals: value.meals, waste: value.waste };
      });

    const co2Trend = monthlyTrend.map((item) => ({ d: item.m, v: Math.round(item.meals * 0.35) }));

    const ngosWithCoords = users.filter((user) => user.role === "ngo" && user.location);
    const activeListings = listings.filter((listing) => listing.status === "available" && listing.location && typeof listing.location === "object");
    const distanceRiskCount = activeListings.filter((listing) => {
      const nearestNgoKm = ngosWithCoords.reduce((nearest, ngo) => Math.min(nearest, getDistance(listing.location.lat, listing.location.lng, ngo.location.lat, ngo.location.lng)), Number.POSITIVE_INFINITY);
      return nearestNgoKm > 8;
    }).length;
    const timingRiskCount = listings.filter((listing) => {
      if (listing.status !== "available" || !listing.created_at) return false;
      const hour = new Date(listing.created_at).getHours();
      return hour >= 23 || hour <= 6;
    }).length;
    const quantityRiskCount = listings.filter((listing) => listing.status === "available" && Number(listing.quantity || 0) >= 100).length;
    const totalActive = Math.max(activeListings.length, 1);

    return {
      stats: {
        mealsSaved,
        wasteReducedKg: Math.round(mealsSaved * 0.4),
        activeListings: activeListingsCount,
        types: [
          { name: "Vegetarian", value: tVeg, color: "oklch(0.62 0.17 145)" },
          { name: "Non-Veg", value: tNon, color: "oklch(0.78 0.16 70)" },
          { name: "Packaged", value: tPack, color: "oklch(0.6 0.18 240)" },
        ],
      },
      monthlyTrend: monthlyTrend.length ? monthlyTrend : [{ m: "Now", meals: 0, waste: 0 }],
      co2Trend: co2Trend.length ? co2Trend : [{ d: "Now", v: 0 }],
      leaderboard,
      expiryEngine: {
        distancePercent: Math.round((distanceRiskCount / totalActive) * 100),
        timingPercent: Math.round((timingRiskCount / totalActive) * 100),
        quantityPercent: Math.round((quantityRiskCount / totalActive) * 100),
        reason:
          distanceRiskCount >= timingRiskCount && distanceRiskCount >= quantityRiskCount
            ? "High waste risk due to late pickup feasibility and low nearby NGO density."
            : timingRiskCount >= quantityRiskCount
              ? "High waste risk due to late-night posting + low nearby NGO density."
              : "High waste risk due to oversized listings that need split dispatch.",
      },
    };
  }, [listings, users]);

  return (
    <RequireAuth>
      <div className="px-6 lg:px-12 py-10 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" /> AI Diagnostics & Impact
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mt-2">Intelligence Dashboard</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">Real-time analytics, ResQ scores, and AI insights across the network.</p>
          </div>

          {loading ? <div className="mb-8 rounded-3xl border border-border/50 bg-background/70 p-8 text-center shadow-sm"><div className="text-lg font-bold text-foreground">Loading shared food data...</div></div> : null}
          {!loading && error ? <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm"><div className="text-lg font-bold text-red-700">{error}</div></div> : null}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-fade-up">
            <KPI icon={Utensils} label="Total Meals Saved (Live)" value={stats.mealsSaved.toLocaleString()} delta="+Now" />
            <KPI icon={Trash2} label="Food Waste Reduced (Live)" value={`${stats.wasteReducedKg.toLocaleString()} kg`} delta="+Now" />
            <KPI icon={Cloud} label="CO₂ Prevented" value={`${(stats.wasteReducedKg * 2.5).toLocaleString()} tons`} delta="+Now" />
            <KPI icon={Truck} label="Active Listings" value={stats.activeListings.toLocaleString()} delta="+Now" positive />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-elegant border border-white/5 relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <BrainCircuit className="h-5 w-5 text-orange-500" />
                  <h3 className="font-bold text-lg text-foreground">Expiry Intelligence Engine</h3>
                </div>
                <p className="text-xs font-medium text-muted-foreground">{expiryEngine.reason}</p>
              </div>
              <div className="relative z-10 grid sm:grid-cols-3 gap-4">
                <div className="bg-background/40 rounded-2xl p-4 border border-white/10 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground"><AlertTriangle className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Distance</span></div>
                  <div className="text-2xl font-black text-foreground">{expiryEngine.distancePercent}%</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">Found &gt;8km from nearest available NGO.</div>
                </div>
                <div className="bg-background/40 rounded-2xl p-4 border border-white/10 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground"><Clock className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Timing</span></div>
                  <div className="text-2xl font-black text-foreground">{expiryEngine.timingPercent}%</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">Posted between 11PM-6AM. Low visibility.</div>
                </div>
                <div className="bg-background/40 rounded-2xl p-4 border border-white/10 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground"><FileQuestion className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Quantity</span></div>
                  <div className="text-2xl font-black text-foreground">{expiryEngine.quantityPercent}%</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">Quantity too large for single pickup.</div>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 shadow-elegant border border-primary/20 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">ResQ Score</h3>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Top Donors This Week</p>
                </div>
                <Award className="h-8 w-8 text-primary/40" />
              </div>
              <div className="space-y-4 relative z-10">
                {leaderboard.map((donor, index) => (
                  <div key={donor.donorId} className={index === 0 ? "flex items-center justify-between bg-primary/10 border border-primary/30 rounded-2xl p-3" : "flex items-center justify-between bg-background/50 rounded-2xl p-3 border border-white/5"}>
                    <div className="flex items-center gap-3">
                      <div className={index === 0 ? "h-8 w-8 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center text-sm shadow-glow" : "h-8 w-8 rounded-full bg-muted-foreground/20 text-muted-foreground font-bold flex items-center justify-center text-sm"}>{index + 1}</div>
                      <div className={index === 0 ? "font-bold text-sm" : "font-semibold text-sm"}>{donor.name}</div>
                    </div>
                    <div className={index === 0 ? "text-primary font-black" : "text-foreground font-bold"}>
                      {donor.score.toLocaleString()} <span className="text-[10px] uppercase font-bold tracking-wider">Pts</span>
                    </div>
                  </div>
                ))}
                {!leaderboard.length ? <div className="text-sm font-semibold text-muted-foreground">No donor score data yet.</div> : null}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-elegant border border-white/5">
              <h3 className="font-bold text-lg">Meals saved vs. Waste reduced</h3>
              <p className="text-xs font-semibold text-muted-foreground">Last 8 months trends from Firestore</p>
              <div className="h-72 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} vertical={false} />
                    <XAxis dataKey="m" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="meals" fill="oklch(0.62 0.17 145)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="waste" fill="oklch(0.78 0.16 70)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 shadow-elegant border border-white/5 flex flex-col">
              <h3 className="font-bold text-lg">Donations by Type</h3>
              <p className="text-xs font-semibold text-muted-foreground">Current distribution</p>
              <div className="h-64 flex-1 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.types} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="none">
                      {stats.types.map((t, i) => <Cell key={i} fill={t.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 glass rounded-3xl p-6 shadow-elegant border border-white/5">
            <h3 className="font-bold text-lg">Live CO2 Prevention Trend</h3>
            <p className="text-xs font-semibold text-muted-foreground">Derived from rescued meal volumes</p>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={co2Trend}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                  <XAxis dataKey="d" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke="oklch(0.62 0.17 145)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
