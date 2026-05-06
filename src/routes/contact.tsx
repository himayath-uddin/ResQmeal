import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Send,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Building2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — ResQMeal" },
      { name: "description", content: "Get in touch with the ResQMeal team." },
    ],
  }),
  component: ContactPage,
});

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@resqmeal.com", link: "mailto:hello@resqmeal.com" },
  { icon: Phone, label: "Phone", value: "+91 40 1234 5678", link: "tel:+914012345678" },
  { icon: MapPin, label: "Office", value: "HITEC City, Hyderabad, India", link: null },
  { icon: Clock, label: "Hours", value: "Mon-Fri, 9 AM – 6 PM IST", link: null },
];

const faqs = [
  { q: "How quickly can I expect a response?", a: "We typically respond within 24 hours on business days. For urgent matters, please call our support line directly." },
  { q: "I'm an NGO. How do I register?", a: "Simply sign up with an NGO role on our platform. For enterprise features and NGO discounts, mention your organization in the contact form." },
  { q: "Can I partner with ResQMeal?", a: "We're always looking for partners! Select 'Partnership' as the subject and tell us about your organization. We'll get back to you within 48 hours." },
  { q: "I found a bug. How do I report it?", a: "Use the contact form with 'Bug Report' as the subject. Include steps to reproduce, your browser, and any screenshots for fastest resolution." },
];

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, "contact_submissions"), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || "General Inquiry",
        message: message.trim(),
        created_at: serverTimestamp(),
        status: "new",
      });
      toast.success("Message sent! We'll get back to you shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/6 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <section className="px-6 lg:px-12 pt-12 pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6">
            <MessageSquare className="h-3.5 w-3.5" />
            Get In Touch
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            We'd love to hear from you
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl mx-auto">
            Have a question, feedback, or partnership idea? Drop us a message and we'll get back to you.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-background rounded-3xl border border-border/40 p-6 lg:p-8 shadow-sm space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</Label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground"
                >
                  <option value="">Select a topic</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Partnership">Partnership Opportunity</option>
                  <option value="NGO Registration">NGO Registration Help</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Billing">Billing & Pricing</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message *</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  required
                  className="min-h-32 rounded-xl"
                />
              </div>

              <Button type="submit" disabled={sending} className="h-12 px-8 rounded-xl gradient-primary text-white font-bold text-sm w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info Card */}
            <div className="bg-background rounded-3xl border border-border/40 p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-5 text-lg">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.label} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{info.label}</div>
                        {info.link ? (
                          <a href={info.link} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">{info.value}</a>
                        ) : (
                          <div className="text-sm font-semibold text-foreground">{info.value}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-background rounded-3xl border border-border/40 overflow-hidden shadow-sm">
              <div className="h-48 bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="font-bold text-foreground">ResQMeal HQ</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">HITEC City, Hyderabad</div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="bg-background rounded-3xl border border-border/40 p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {["Twitter", "LinkedIn", "GitHub", "Instagram"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 lg:px-12 mt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold tracking-tight mb-8 text-center">Common Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-background rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-bold text-foreground text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-96 pb-5" : "max-h-0"}`}>
                  <div className="px-5 text-sm text-muted-foreground font-medium leading-relaxed">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
