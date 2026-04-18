import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle, Lock, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type LoginSearch = {
  redirect?: string;
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"donor" | "ngo">("donor");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getDashboardRoute = (nextRole: "donor" | "ngo") => (nextRole === "donor" ? "/donate" : "/ngo");

  useEffect(() => {
    if (isReady && user) {
      navigate({ to: search.redirect || getDashboardRoute(user.role), replace: true });
    }
  }, [isReady, navigate, search.redirect, user]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      if (data.role !== role) {
        setError(`This account is registered as ${data.role === "ngo" ? "NGO" : "donor"}. Please choose the correct role.`);
        return;
      }

      login({
        user_id: data.user_id,
        email: data.email,
        role: data.role,
      });

      navigate({ to: search.redirect || getDashboardRoute(data.role), replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">
        <div className="hidden w-1/2 flex-col justify-between bg-[radial-gradient(circle_at_top,#34d39933,transparent_40%),linear-gradient(160deg,#0b0f19,#111827)] p-10 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">ResQMeal</div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Hackathon Auth</div>
            </div>
          </div>

          <div>
            <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
              Simple session login
            </div>
            <h1 className="max-w-md text-5xl font-black leading-tight tracking-tighter">
              Sign in and jump straight into the dashboard.
            </h1>
            <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-white/70">
              This keeps auth intentionally lightweight: email, password, and a local session for the frontend.
            </p>
          </div>

          <div className="text-sm font-medium text-white/60">
            Need an account? <Link to="/signup" className="font-bold text-white hover:text-emerald-300">Create one</Link>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-background p-8 sm:p-12 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">Login</h1>
            </div>

            <div className="mb-8 hidden lg:block">
              <h1 className="text-4xl font-black tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Enter your email and password to continue.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-13 rounded-2xl border-border/70 bg-background pl-11 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-13 rounded-2xl border-border/70 bg-background pl-11 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Role
                </Label>
                <Select value={role} onValueChange={(value) => setRole(value as "donor" | "ngo")}>
                  <SelectTrigger className="h-13 rounded-2xl border-border/70 bg-background font-medium">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="h-13 w-full rounded-2xl gradient-primary text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.01]"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-bold text-foreground hover:text-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
