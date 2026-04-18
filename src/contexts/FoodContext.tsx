import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/auth";
import { getFoodInsights } from "@/lib/aiService";
import { getFoodImageUrl } from "@/lib/imageService";

export type ListingStatus = "available" | "claimed_by_ngo" | "claimed_by_volunteer" | "delivered";
export type UrgencyLevel = "low" | "medium" | "high";

export type ListingLocation = {
  lat: number;
  lng: number;
  address?: string;
};

export type AIInsights = {
  urgency: UrgencyLevel;
  recommendation: string;
  storage_tip: string;
};

export type FoodListing = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  location: string | ListingLocation;
  expiry_time: string;
  donor_id: string;
  status: ListingStatus;
  claimed_by?: string | null;
  volunteer_id?: string | null;
  urgent?: boolean;
  created_at?: string;
  image_url?: string;
  ai_insights?: AIInsights;
  distance_km?: number;
};

export type AppUser = {
  id: string;
  email: string;
  role: UserRole;
  location?: ListingLocation | null;
};

type CreateListingInput = {
  title: string;
  description: string;
  quantity: number;
  location: ListingLocation;
  expiry_time: string;
};

type FoodContextType = {
  listings: FoodListing[];
  users: AppUser[];
  loading: boolean;
  error: string;
  createListing: (input: CreateListingInput) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;
  markUrgent: (listingId: string, urgent: boolean) => Promise<void>;
  claimListing: (listingId: string) => Promise<void>;
  assignVolunteer: (listingId: string, volunteerId: string) => Promise<void>;
  acceptTask: (listingId: string) => Promise<void>;
  markDelivered: (listingId: string) => Promise<void>;
  volunteers: AppUser[];
};

const FoodContext = createContext<FoodContextType>({
  listings: [],
  users: [],
  loading: true,
  error: "",
  createListing: async () => {},
  deleteListing: async () => {},
  markUrgent: async () => {},
  claimListing: async () => {},
  assignVolunteer: async () => {},
  acceptTask: async () => {},
  markDelivered: async () => {},
  volunteers: [],
});

function mapListing(docSnap: any): FoodListing {
  const data = docSnap.data() || {};
  const rawLocation = data.location;
  const location =
    rawLocation && typeof rawLocation === "object" && typeof rawLocation.lat === "number" && typeof rawLocation.lng === "number"
      ? {
          lat: rawLocation.lat,
          lng: rawLocation.lng,
          address: typeof rawLocation.address === "string" ? rawLocation.address : "",
        }
      : typeof rawLocation === "string"
        ? rawLocation
        : typeof data.lat === "number" && typeof data.lng === "number"
          ? { lat: data.lat, lng: data.lng, address: "" }
          : "";
  const rawStatus = String(data.status || "available");
  const status: ListingStatus =
    rawStatus === "claimed"
      ? "claimed_by_ngo"
      : rawStatus === "picked"
        ? "claimed_by_volunteer"
        : (rawStatus as ListingStatus);
  const aiInsights = data.ai_insights || {};
  const aiUrgency = String(aiInsights.urgency || "").toLowerCase();
  return {
    id: docSnap.id,
    title: data.title || "",
    description: data.description || "",
    quantity: Number(data.quantity || data.qty || 0),
    location,
    expiry_time:
      typeof data.expiry_time === "string"
        ? data.expiry_time
        : data.expiry_time?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    donor_id: data.donor_id || "",
    status: ["available", "claimed_by_ngo", "claimed_by_volunteer", "delivered"].includes(status) ? status : "available",
    claimed_by: data.claimed_by || null,
    volunteer_id: data.volunteer_id || null,
    urgent: Boolean(data.urgent),
    image_url: data.image_url || "",
    ai_insights: {
      urgency: aiUrgency === "high" || aiUrgency === "low" ? aiUrgency : "medium",
      recommendation: aiInsights.recommendation || "",
      storage_tip: aiInsights.storage_tip || "",
    },
    created_at:
      typeof data.created_at === "string"
        ? data.created_at
        : data.created_at?.toDate?.()?.toISOString?.() || undefined,
  };
}

function mapUser(docSnap: any): AppUser {
  const data = docSnap.data() || {};
  const location =
    data.location && typeof data.location === "object" && typeof data.location.lat === "number" && typeof data.location.lng === "number"
      ? {
          lat: data.location.lat,
          lng: data.location.lng,
          address: typeof data.location.address === "string" ? data.location.address : "",
        }
      : null;
  return {
    id: docSnap.id,
    email: data.email || "",
    role: data.role || "donor",
    location,
  };
}

export function FoodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribeListings = onSnapshot(
      collection(db, "food_listings"),
      (snapshot) => {
        const nextListings = snapshot.docs
          .map(mapListing)
          .sort((left, right) => {
            const leftValue = left.created_at ? new Date(left.created_at).getTime() : 0;
            const rightValue = right.created_at ? new Date(right.created_at).getTime() : 0;
            return rightValue - leftValue;
          });
        setListings(nextListings);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error("Failed to load food listings", snapshotError);
        setError("We could not load listings from Firestore.");
        setLoading(false);
      },
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsers(snapshot.docs.map(mapUser));
      },
      (snapshotError) => {
        console.error("Failed to load users", snapshotError);
      },
    );

    return () => {
      unsubscribeListings();
      unsubscribeUsers();
    };
  }, []);

  const createListing = async (input: CreateListingInput) => {
    if (!user) {
      throw new Error("Please sign in before creating a listing.");
    }

    const [aiInsights, imageUrl] = await Promise.all([
      getFoodInsights({
        title: input.title,
        description: input.description,
        quantity: input.quantity,
      }),
      getFoodImageUrl(input.title),
    ]);

    await addDoc(collection(db, "food_listings"), {
      ...input,
      qty: input.quantity,
      lat: input.location.lat,
      lng: input.location.lng,
      donor_id: user.user_id,
      status: "available",
      claimed_by: null,
      volunteer_id: null,
      urgent: aiInsights.urgency === "high",
      ai_insights: aiInsights,
      image_url: imageUrl,
      created_at: serverTimestamp(),
    });
  };

  const deleteListing = async (listingId: string) => {
    await deleteDoc(doc(db, "food_listings", listingId));
  };

  const markUrgent = async (listingId: string, urgent: boolean) => {
    await updateDoc(doc(db, "food_listings", listingId), { urgent });
  };

  const claimListing = async (listingId: string) => {
    if (!user) {
      throw new Error("Please sign in before claiming food.");
    }

    await updateDoc(doc(db, "food_listings", listingId), {
      status: "claimed_by_ngo",
      claimed_by: user.user_id,
      volunteer_id: null,
    });
  };

  const assignVolunteer = async (listingId: string, volunteerId: string) => {
    await updateDoc(doc(db, "food_listings", listingId), {
      volunteer_id: volunteerId,
      status: "claimed_by_volunteer",
    });
  };

  const acceptTask = async (listingId: string) => {
    if (!user) {
      throw new Error("Please sign in before accepting a task.");
    }

    await updateDoc(doc(db, "food_listings", listingId), {
      volunteer_id: user.user_id,
      status: "claimed_by_volunteer",
    });
  };

  const markDelivered = async (listingId: string) => {
    await updateDoc(doc(db, "food_listings", listingId), {
      status: "delivered",
    });
  };

  const volunteers = useMemo(
    () => users.filter((item) => item.role === "volunteer"),
    [users],
  );

  return (
    <FoodContext.Provider
      value={{
        listings,
        users,
        loading,
        error,
        createListing,
        deleteListing,
        markUrgent,
        claimListing,
        assignVolunteer,
        acceptTask,
        markDelivered,
        volunteers,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFood() {
  return useContext(FoodContext);
}
