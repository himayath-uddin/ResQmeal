import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Heart, Home, LoaderCircle, Lock, Mail, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase-auth";
import { getDashboardRoute, type UserRole } from "@/lib/auth";

type LoginSearch = {
  redirect?: string;
};

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "donor", label: "Donor" },
  { value: "ngo", label: "NGO" },
  { value: "volunteer", label: "Volunteer" },
];

const ROLE_DETAILS: Record<UserRole, { icon: typeof Heart; description: string }> = {
  donor: { icon: Heart, description: "Donate surplus food quickly" },
  ngo: { icon: Building2, description: "Claim and distribute meals" },
  volunteer: { icon: Truck, description: "Support rescue logistics" },
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login — ResQMeal" },
      { name: "description", content: "Login to access your ResQMeal dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, isReady, login } = useAuth();

  const [role, setRole] = useState<UserRole>("donor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      navigate({ to: search.redirect || getDashboardRoute(user.role), replace: true });
    }
  }, [isReady, navigate, search.redirect, user]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const data = await loginWithEmail(normalizedEmail, password, role);

      if (data.role !== role) {
        throw new Error(`This account belongs to ${data.role.toUpperCase()}. Please choose the correct role.`);
      }

      login(data);
      navigate({ to: search.redirect || getDashboardRoute(data.role), replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleLogin = async () => {
    setError("");
    setSubmitting(true);

    try {
      const data = await loginWithGoogle(role);
      login(data);
      navigate({ to: search.redirect || getDashboardRoute(data.role), replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-6 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)]">
        <aside className="hidden w-1/2 flex-col justify-between bg-[radial-gradient(circle_at_10%_10%,rgba(52,211,153,0.35),transparent_45%),linear-gradient(160deg,#0f172a,#111827_55%,#1e293b)] p-10 text-white lg:flex">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-xl font-black tracking-tight">ResQMeal</div>
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-200/75">Smart Rescue Network</div>
              </div>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <div>
            <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200">
              Secure Access
            </div>
              <h1 className="max-w-md text-5xl font-black leading-tight tracking-tighter">
              Join the intelligence-driven food rescue movement.
              </h1>
              <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-white/70">
              Our predictive models ensure every surplus meal is directed exactly where it is needed most, at the perfect time.
              </p>
          </div>

          <p className="text-sm font-medium text-white/70">
            New to ResQMeal?{" "}
            <Link to="/signup" className="font-bold text-white hover:text-emerald-300">
              Create account
            </Link>
          </p>
        </aside>

        <section className="flex w-full items-center justify-center bg-white p-8 sm:p-12 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Sign in</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Sign in to your dashboard to continue.</p>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-500">1. Select your identity</div>
              <div className="grid grid-cols-3 gap-3">
                {ROLE_OPTIONS.map((item) => {
                  const Icon = ROLE_DETAILS[item.value].icon;
                  const active = role === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      className={cn(
                        "rounded-[1.65rem] border px-4 py-4 text-left transition-all duration-300",
                        active
                          ? "border-emerald-400/70 bg-gradient-to-br from-emerald-500 to-lime-500 text-white shadow-[0_18px_45px_-18px_rgba(34,197,94,0.8)]"
                          : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg",
                      )}
                    >
                      <Icon className={cn("mb-3 h-5 w-5", active ? "text-white" : "text-slate-500")} />
                      <div className="text-sm font-black">{item.label}</div>
                      <div className={cn("mt-1 text-xs font-medium", active ? "text-white/80" : "text-slate-400")}>
                        {ROLE_DETAILS[item.value].description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onGoogleLogin}
              className="mb-6 h-12 w-full rounded-2xl border-slate-200 bg-white font-semibold text-slate-700"
            >
              {submitting ? "Connecting..." : "Continue with Google"}
            </Button>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  2. Email Address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-white pl-11 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-white pl-11 font-medium"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-2xl bg-slate-900 text-base font-bold text-white hover:bg-slate-800"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In with Email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-slate-500">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-bold text-slate-900 hover:text-primary">
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
