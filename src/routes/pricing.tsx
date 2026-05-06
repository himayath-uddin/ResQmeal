import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  Sparkles,
  Zap,
  Building2,
  ArrowRight,
  ChevronDown,
  Users,
  BarChart3,
  Map,
  Shield,
  Clock,
  Headphones,
  Globe,
  Brain,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ResQMeal" },
      { name: "description", content: "Choose the right plan for your food rescue operations." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Starter",
    subtitle: "For individuals & small donors",
    price: "Free",
    period: "forever",
    popular: false,
    cta: "Get Started Free",
    accent: "from-slate-600 to-slate-800",
    features: [
      "Up to 10 food listings per month",
      "Basic AI urgency scoring",
      "Community map access",
      "Email support",
      "Real-time notifications",
      "Basic analytics dashboard",
    ],
  },
  {
    name: "Pro",
    subtitle: "For restaurants & organizations",
    price: "$29",
    period: "/month",
    popular: true,
    cta: "Start 14-Day Free Trial",
    accent: "from-primary to-emerald-500",
    features: [
      "Unlimited food listings",
      "Advanced AI matching & predictions",
      "Priority route optimization",
      "Dedicated support channel",
      "Advanced analytics & reports",
      "Team member accounts (up to 5)",
      "API access",
      "Custom branding on listings",
      "Volunteer management tools",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "For large NGO networks & chains",
    price: "Custom",
    period: "tailored pricing",
    popular: false,
    cta: "Contact Sales",
    accent: "from-purple-600 to-indigo-600",
    features: [
      "Everything in Pro, plus:",
      "Unlimited team members",
      "Multi-city deployment",
      "Dedicated account manager",
      "Custom AI model training",
      "SLA guarantee (99.9% uptime)",
      "White-label solution",
      "Advanced security & compliance",
      "On-premise deployment option",
      "Priority 24/7 phone support",
    ],
  },
];

const faqs = [
  {
    q: "Is ResQMeal really free for individual donors?",
    a: "Yes! Our Starter plan is completely free forever. We believe everyone should be able to donate surplus food without any cost barriers. The free tier includes all essential features to list and manage food donations.",
  },
  {
    q: "What happens after my 14-day Pro trial?",
    a: "After your trial, you'll be automatically moved to the free Starter plan unless you choose to subscribe. No credit card is required for the trial, and you won't lose any data.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Absolutely. You can upgrade, downgrade, or cancel at any time from your account settings. Changes take effect immediately, and we prorate any billing differences.",
  },
  {
    q: "Do you offer discounts for NGOs?",
    a: "Yes! We offer a 50% discount on Pro plans for verified non-profit organizations. Contact our sales team with your NGO registration details to get started.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, net banking, and can arrange invoicing for Enterprise plans. All payments are securely processed.",
  },
  {
    q: "Is my data secure?",
    a: "Your data is stored on Google Firebase infrastructure with enterprise-grade encryption. We follow industry best practices for security and are compliant with data protection regulations.",
  },
];

const highlights = [
  { icon: Brain, label: "AI-Powered Matching", desc: "Smart algorithms for optimal food-NGO pairing" },
  { icon: Globe, label: "Real-Time Map", desc: "Live tracking of all available food listings" },
  { icon: Truck, label: "Route Optimization", desc: "Fastest delivery paths for volunteers" },
  { icon: BarChart3, label: "Impact Analytics", desc: "Track meals saved, CO₂ reduced, and more" },
  { icon: Shield, label: "Enterprise Security", desc: "Firebase-backed infrastructure & encryption" },
  { icon: Headphones, label: "Dedicated Support", desc: "Priority help when you need it most" },
];

function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 overflow-hidden relative">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -left-40 top-60 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <section className="px-6 lg:px-12 pt-12 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 text-balance">
            Plans that scale with your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">impact</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Whether you're an individual donor or a large NGO network, there's a plan built for your food rescue operations.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-background rounded-3xl border ${
                plan.popular
                  ? "border-primary/50 shadow-[0_0_60px_-20px_rgba(16,185,129,0.3)]"
                  : "border-border/50 shadow-sm"
              } p-8 flex flex-col hover:-translate-y-1 transition-all duration-500`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.accent} mb-4`}>
                  {plan.name === "Starter" ? (
                    <Users className="h-6 w-6 text-white" />
                  ) : plan.name === "Pro" ? (
                    <Zap className="h-6 w-6 text-white" />
                  ) : (
                    <Building2 className="h-6 w-6 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight text-foreground">{plan.price}</span>
                  <span className="text-sm font-semibold text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    <span className="font-medium text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className={`w-full h-12 rounded-2xl font-bold text-sm ${
                  plan.popular
                    ? "gradient-primary text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
                    : "bg-foreground text-background hover:bg-foreground/90"
                } transition-all duration-300`}
              >
                <Link to="/signup">
                  {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="px-6 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
              Everything you need, included
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
              All plans come with our core AI-powered platform features.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.label}
                  className="bg-background rounded-2xl border border-border/40 p-6 hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{h.label}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground font-medium">Can't find what you're looking for? Contact our support team.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-background rounded-2xl border border-border/40 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-bold text-foreground text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-96 pb-5" : "max-h-0"
                  }`}
                >
                  <div className="px-5 text-sm text-muted-foreground font-medium leading-relaxed">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 lg:px-12 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Start rescuing food today
          </h2>
          <p className="text-muted-foreground font-medium mb-8 max-w-lg mx-auto">
            Join the platform that's already saved over 128,000 meals. No credit card required.
          </p>
          <Button
            asChild
            size="lg"
            className="h-14 px-10 rounded-2xl gradient-primary text-white font-bold text-lg shadow-[0_10px_30px_-10px_rgba(16,185,129,0.4)] hover:scale-105 transition-all"
          >
            <Link to="/signup">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
