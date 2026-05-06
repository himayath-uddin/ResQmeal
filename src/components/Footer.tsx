import { Link } from "@tanstack/react-router";
import { Sparkles, Twitter, Github, Linkedin, Mail, Heart } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Browse Food", to: "/browse" },
    { label: "Pricing", to: "/pricing" },
    { label: "Live Map", to: "/map" },
    { label: "Analytics", to: "/analytics" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Careers", to: "#" },
    { label: "Press", to: "#" },
  ],
  Resources: [
    { label: "Documentation", to: "#" },
    { label: "API Reference", to: "#" },
    { label: "Blog", to: "#" },
    { label: "Community", to: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
    { label: "Cookie Policy", to: "#" },
    { label: "GDPR", to: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "https://github.com/himayath-uddin/ResQmeal" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Mail, label: "Email", href: "mailto:hello@resqmeal.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-xl tracking-tight text-foreground">ResQMeal</div>
                <div className="text-xs font-semibold text-muted-foreground">Predictive Food Rescue</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs mb-6">
              AI-powered platform connecting restaurants, households, and events with NGOs to rescue surplus food and feed communities.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="h-10 w-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-sm text-foreground mb-4 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} ResQMeal. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
            Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 mx-0.5" /> for a hunger-free world
          </div>
        </div>
      </div>
    </footer>
  );
}
