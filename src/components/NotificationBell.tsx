import { useState, useEffect, useMemo } from "react";
import { Bell, X, Package, Truck, CheckCircle, Sparkles, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFood } from "@/contexts/FoodContext";

type Notification = {
  id: string;
  title: string;
  message: string;
  icon: typeof Package;
  color: string;
  time: string;
  read: boolean;
};

export function NotificationBell() {
  const { user } = useAuth();
  const { listings } = useFood();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = useMemo<Notification[]>(() => {
    if (!user) return [];
    const notifs: Notification[] = [];

    // Generate notifications from real listing data
    const available = listings.filter((l) => l.status === "available");
    const urgent = available.filter((l) => l.ai_insights?.urgency === "high");

    if (urgent.length > 0) {
      notifs.push({
        id: "urgent-food",
        title: "High Urgency Alert",
        message: `${urgent.length} food listing${urgent.length > 1 ? "s" : ""} need immediate rescue!`,
        icon: Sparkles,
        color: "text-red-500 bg-red-500/10",
        time: "Just now",
        read: readIds.has("urgent-food"),
      });
    }

    if (available.length > 0) {
      notifs.push({
        id: "available-food",
        title: "Food Available Nearby",
        message: `${available.length} food listings are currently available for rescue.`,
        icon: Package,
        color: "text-primary bg-primary/10",
        time: "Live",
        read: readIds.has("available-food"),
      });
    }

    const delivered = listings.filter((l) => l.status === "delivered");
    if (delivered.length > 0) {
      notifs.push({
        id: "deliveries-done",
        title: "Deliveries Completed",
        message: `${delivered.length} successful ${delivered.length > 1 ? "deliveries" : "delivery"} completed on the platform.`,
        icon: CheckCircle,
        color: "text-emerald-500 bg-emerald-500/10",
        time: "Recent",
        read: readIds.has("deliveries-done"),
      });
    }

    const claimed = listings.filter(
      (l) => l.status === "claimed_by_ngo" || l.status === "claimed_by_volunteer"
    );
    if (claimed.length > 0) {
      notifs.push({
        id: "claimed",
        title: "Active Claims",
        message: `${claimed.length} food listing${claimed.length > 1 ? "s are" : " is"} being processed for pickup.`,
        icon: Truck,
        color: "text-blue-500 bg-blue-500/10",
        time: "Recent",
        read: readIds.has("claimed"),
      });
    }

    // Platform welcome
    notifs.push({
      id: "welcome",
      title: "Welcome to ResQMeal!",
      message: "Your AI-powered food rescue dashboard is ready. Start making an impact!",
      icon: Sparkles,
      color: "text-purple-500 bg-purple-500/10",
      time: "Today",
      read: readIds.has("welcome"),
    });

    return notifs;
  }, [user, listings, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-smooth hover:-translate-y-0.5 hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-14 w-[340px] sm:w-[380px] z-50 bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden animate-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div>
                <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground font-medium">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-muted/50 transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => setReadIds((prev) => new Set([...prev, notif.id]))}
                  >
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${notif.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-foreground">{notif.title}</span>
                        {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[10px] font-semibold text-muted-foreground/60">{notif.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
