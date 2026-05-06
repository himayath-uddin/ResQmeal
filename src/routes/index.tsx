import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart,
  Sparkles,
  Route as RouteIcon,
  TrendingUp,
  Utensils,
  Building2,
  Truck,
  Twitter,
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  Play,
  Activity,
  Star,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResQMeal — Saving Food, Serving Lives" },
      {
        name: "description",
        content:
          "AI-powered platform connecting restaurants, households and events with NGOs to rescue surplus food and feed communities.",
      },
      { property: "og:title", content: "ResQMeal" },
      { property: "og:description", content: "Saving Food, Serving Lives" },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "Meals Saved", value: "128,540", icon: Utensils, accent: "from-primary to-emerald-400" },
  { label: "Food Rescued (kg)", value: "42,180", icon: Heart, accent: "from-orange-500 to-orange-400" },
  { label: "NGOs Connected", value: "1,260", icon: Building2, accent: "from-blue-500 to-cyan-400" },
  { label: "Deliveries Done", value: "9,874", icon: Truck, accent: "from-purple-500 to-pink-400" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI Predictive Matching",
    desc: "Smart algorithms predict demand spikes and match surplus food with the most relevant NGOs in milliseconds.",
  },
  {
    icon: RouteIcon,
    title: "Smart Route Optimization",
    desc: "Dynamic delivery routes powered by real-time traffic, saving an average of 12 minutes per pickup.",
  },
  {
    icon: Activity,
    title: "Waste Risk Scoring",
    desc: "Every listing is instantly analyzed for expiry risks with automated guidance on the best posting times.",
  },
  {
    icon: TrendingUp,
    title: "Impact Intelligence",
    desc: "Visualize meals saved, CO₂ reduced, and understand exactly why food sometimes goes unclaimed.",
  },
];

function Index() {
  const { user } = useAuth();
  const primaryCta = !user
    ? { to: "/login", label: "Start Claiming Donated Food" }
    : user.role === "ngo"
      ? { to: "/ngo-dashboard", label: "Start Claiming Donated Food" }
      : user.role === "volunteer"
        ? { to: "/volunteer-dashboard", label: "Open Volunteer Dashboard" }
        : { to: "/donor-dashboard", label: "Start Donating Now" };

  const secondaryCta = !user
    ? { to: "/signup", label: "Start Donating Now", icon: ArrowRight }
    : user.role === "ngo"
      ? { to: "/analytics", label: "View NGO Insights", icon: TrendingUp }
    : user.role === "volunteer"
        ? { to: "/analytics", label: "View Route Insights", icon: TrendingUp }
        : { to: "/ngo-dashboard", label: "View Claim Feed", icon: Play };

  return (
    <div className="bg-background text-foreground overflow-hidden relative">
      {/* Ultra Premium Hero Section */}
      <section className="relative px-6 lg:px-12 pt-24 lg:pt-36 pb-24 lg:pb-32 overflow-hidden border-b border-border/50">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-full pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute top-[20%] right-[5%] w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 text-xs font-bold text-foreground mb-8 shadow-sm backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              ResQMeal Engine v2.0 Live
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.08] tracking-tighter text-balance">
              Predictive AI meets <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-primary to-emerald-600 drop-shadow-sm">
                Food Rescue.
              </span>
            </h1>
            <p className="mt-8 text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              We don’t just redistribute food. We <strong className="text-foreground">predict where food will be needed before it’s wasted</strong> using real-time demand modeling and intelligent routing.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gradient-primary text-white hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all duration-300 h-14 px-8 rounded-2xl text-[15px] font-bold border border-white/20">
                <Link to={primaryCta.to}>
                  {primaryCta.label} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass bg-background/50 backdrop-blur-xl border-border/80 h-14 px-8 rounded-2xl hover:bg-background/80 hover:scale-[1.02] transition-smooth text-[15px] font-bold text-foreground shadow-sm">
                <Link to={secondaryCta.to}>
                  {secondaryCta.icon === Play ? <Play className="mr-2 h-5 w-5 fill-foreground" /> : <TrendingUp className="mr-2 h-5 w-5" />}
                  {secondaryCta.label}
                </Link>
              </Button>
            </div>
            
            <div className="mt-14 flex items-center gap-6 pt-8 border-t border-border/50">
               <div className="flex -space-x-3">
                 <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop" alt="Trusted Partner" className="w-11 h-11 rounded-full border-[3px] border-background object-cover shadow-sm" />
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" alt="Trusted Partner" className="w-11 h-11 rounded-full border-[3px] border-background object-cover shadow-sm" />
                 <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Trusted Partner" className="w-11 h-11 rounded-full border-[3px] border-background object-cover shadow-sm" />
                 <div className="w-11 h-11 rounded-full border-[3px] border-background bg-muted flex items-center justify-center text-[10px] font-black tracking-tighter text-muted-foreground shadow-sm">+2k</div>
               </div>
               <div>
                  <div className="flex items-center gap-1 text-orange-400 mb-1">
                     {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-orange-400" />)}
                  </div>
                  <div className="text-sm font-semibold text-foreground/80">Trusted by 2,000+ top restaurants</div>
               </div>
            </div>
          </div>
          
          <div className="relative animate-float lg:h-[600px] w-full flex items-center justify-center mt-12 lg:mt-0 perspective-1000">
             {/* Bento UI floating grid in Hero */}
             <div className="relative w-full max-w-md lg:max-w-none h-full min-h-[500px]">
                
                {/* Main Image - Gourmet Food (Replaced raw food with sophisticated prepared meal) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[85%] lg:w-[320px] h-[450px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 z-10 transition-transform hover:scale-[1.03] duration-700 ease-out xl:rotate-2">
                   <img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=1000&fit=crop" className="w-full h-full object-cover" alt="Beautifully plated gourmet food rescue" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                   
                   <div className="absolute top-5 right-5 glass bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live Match</span>
                   </div>

                   <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                      <div className="flex flex-wrap gap-2 mb-3">
                         <span className="bg-primary/90 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">Hot Meals</span>
                         <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-white/20">45 Mins Left</span>
                      </div>
                      <div className="font-extrabold text-[22px] leading-tight mb-1 drop-shadow-md">120 Fine-Dining Meals Saved</div>
                      <div className="text-sm font-medium text-white/80">Saffron Luxury Banquets</div>
                   </div>
                </div>

                {/* Floating UI Widget 1 (Top Left) */}
                <div className="absolute top-[5%] -left-[5%] lg:-left-[15%] glass bg-background/80 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-elegant z-20 w-64 animate-fade-up xl:-rotate-3" style={{ animationDelay: '200ms' }}>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-inner shrink-0">
                         <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <div className="font-bold text-sm text-foreground">Verified AI Match</div>
                         <div className="text-xs font-medium text-muted-foreground mt-0.5">Hope Foundation</div>
                      </div>
                   </div>
                   <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-2">
                     <div className="bg-primary w-full h-full"></div>
                   </div>
                   <div className="text-[10px] text-right font-black text-primary uppercase tracking-wider">100% Match Confidence</div>
                </div>

                {/* Floating UI Widget 2 (Bottom Right) */}
                <div className="absolute bottom-[5%] -right-[5%] lg:-right-[10%] glass bg-background/80 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-[0_20px_40px_-15px_rgba(251,146,60,0.2)] z-20 w-72 animate-fade-up xl:rotate-2" style={{ animationDelay: '400ms' }}>
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2 text-orange-500">
                        <Activity className="w-4 h-4" />
                        <span className="font-black text-[11px] uppercase tracking-widest">Demand Spike</span>
                     </div>
                     <span className="text-[10px] font-bold text-orange-500/80 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">Bandra West</span>
                   </div>
                   <div className="flex items-end gap-3 mt-4 mb-4">
                     <div className="text-4xl font-black leading-none tracking-tighter text-foreground">8.2k</div>
                     <div className="text-xs font-bold text-muted-foreground pb-1 uppercase tracking-widest">Meals Needed</div>
                   </div>
                   <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=100&fit=crop" className="w-full h-12 rounded-lg object-cover opacity-60 grayscale-[30%] mix-blend-luminosity" alt="Map heatmap abstract" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Glass Panels */}
      <section className="px-6 lg:px-12 py-16 relative z-10 bg-muted/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-background rounded-3xl p-8 shadow-sm border border-border/40 hover:shadow-elegant hover:-translate-y-1.5 transition-all duration-300 animate-fade-up group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <div className="text-4xl font-black tracking-tighter text-foreground mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 py-32 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest mb-4 bg-primary/10 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5" /> Intelligence First
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
              Built for impact, designed like magic.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Everything you need to rescue food efficiently, beautifully, and at scale without any manual guesswork.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group bg-background rounded-[2rem] p-8 shadow-sm border border-border/50 hover:shadow-elegant hover:-translate-y-2 transition-all duration-500 animate-fade-up relative overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="h-14 w-14 rounded-2xl gradient-dark flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform duration-500">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[19px] mb-3 text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 lg:px-12 py-28 bg-muted/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest mb-4 bg-primary/10 px-3 py-1.5 rounded-full">
              <RouteIcon className="h-3.5 w-3.5" /> How It Works
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
              From surplus to saved in 3 simple steps
            </h2>
            <p className="mt-6 text-lg text-muted-foreground font-medium">
              Our AI-powered pipeline ensures food reaches those who need it most — fast.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[17%] right-[17%] h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

            {[
              {
                step: "01",
                title: "List Surplus Food",
                desc: "Restaurants, caterers, and households post surplus food with photos, quantity, and location. Takes under 60 seconds.",
                icon: Utensils,
                color: "from-primary to-emerald-500",
              },
              {
                step: "02",
                title: "AI Matches Nearest NGO",
                desc: "Our predictive engine instantly scores urgency, finds the nearest NGO, and optimizes the fastest rescue route.",
                icon: Sparkles,
                color: "from-orange-500 to-amber-500",
              },
              {
                step: "03",
                title: "Volunteer Delivers",
                desc: "A verified volunteer picks up the food and delivers it to shelters, families, or community kitchens in record time.",
                icon: Truck,
                color: "from-blue-500 to-cyan-500",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className={`relative mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-lg`}>
                    <Icon className="h-9 w-9 text-white" />
                    <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 lg:px-12 py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest mb-4 bg-primary/10 px-3 py-1.5 rounded-full">
              <Heart className="h-3.5 w-3.5" /> What People Say
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              Loved by food rescuers everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                role: "Founder, Hope Foundation NGO",
                quote: "ResQMeal's AI matching has cut our food waste response time by 70%. We now rescue meals we never even knew were available.",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                rating: 5,
              },
              {
                name: "Arjun Reddy",
                role: "Head Chef, Spice Route Restaurants",
                quote: "As a restaurant chain, we had tonnes of surplus daily. ResQMeal made it effortless to donate instead of dump. Incredible platform.",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                rating: 5,
              },
              {
                name: "Fatima Khan",
                role: "Volunteer Driver, Hyderabad",
                quote: "The route optimization saved me 20 minutes per delivery. I can now do 3x more pickups in the same time. This is the future of food rescue.",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                rating: 5,
              },
            ].map((t, i) => (
              <div
                key={t.name}
                className="bg-background rounded-3xl border border-border/40 p-8 shadow-sm hover:shadow-elegant hover:-translate-y-1 transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-1 text-orange-400 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-orange-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 font-medium leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-border/30">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-background shadow-sm" />
                  <div>
                    <div className="font-bold text-sm text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground font-medium">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Logos */}
      <section className="px-6 lg:px-12 py-12 bg-muted/20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Trusted by leading organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-60">
            {["Zomato", "Swiggy", "ISKCON Food Relief", "Akshaya Patra", "Feeding India", "Robin Hood Army"].map((name) => (
              <div key={name} className="text-lg lg:text-xl font-black tracking-tight text-muted-foreground/80">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extreme Premium CTA */}
      <section className="px-6 lg:px-12 py-32">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-foreground text-background p-12 lg:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-50 mix-blend-overlay">
             <img src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&auto=format&fit=crop" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full gradient-primary opacity-40 blur-[100px]" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-white mb-6 text-balance leading-[1.1]">
                Ready to make hunger history?
              </h2>
              <p className="text-lg text-white/70 max-w-lg font-medium leading-relaxed">
                Join thousands of donors and NGOs building the world's most intelligent food rescue network today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <Button asChild size="lg" className="gradient-primary h-16 w-full sm:w-auto px-10 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 transition-all duration-300 text-lg font-bold border border-white/20">
                <Link to={primaryCta.to}>{primaryCta.label} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 w-full sm:w-auto px-10 rounded-2xl bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white transition-all text-lg font-bold backdrop-blur-md">
                <Link to={!user ? "/login" : "/analytics"}>{!user ? "Sign In to Portal" : "View Impact"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

