import { getDistance } from "@/lib/distance";

const EVENT_DATASET = [
  { city: "Hyderabad", name: "IPL Match at Uppal Stadium", lat: 17.4065, lng: 78.5508, type: "sports", expectedIncrease: "30-70%" },
  { city: "Hyderabad", name: "Ramzan Food Bazaar", lat: 17.3616, lng: 78.4747, type: "festival", expectedIncrease: "35-65%" },
  { city: "Hyderabad", name: "Diwali Community Gathering", lat: 17.385, lng: 78.4867, type: "festival", expectedIncrease: "25-50%" },
  { city: "Bengaluru", name: "Stadium Match Day Surge", lat: 12.9784, lng: 77.5999, type: "sports", expectedIncrease: "25-55%" },
  { city: "Mumbai", name: "Weekend Festival Food Footfall", lat: 19.076, lng: 72.8777, type: "festival", expectedIncrease: "20-45%" },
];

function getListingLatLng(listing) {
  if (listing?.location && typeof listing.location === "object") {
    const lat = Number(listing.location.lat);
    const lng = Number(listing.location.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat, lng };
    }
  }

  const lat = Number(listing?.lat);
  const lng = Number(listing?.lng);
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    return { lat, lng };
  }

  return null;
}

export function predictFoodSurge(location) {
  if (!location) {
    return {
      surge: false,
      expectedIncrease: "0%",
      reason: "Location unavailable for event prediction",
      events: [],
    };
  }

  const nearbyEvents = EVENT_DATASET.filter((event) => getDistance(location.lat, location.lng, event.lat, event.lng) <= 10);

  if (!nearbyEvents.length) {
    return {
      surge: false,
      expectedIncrease: "0-10%",
      reason: "No major nearby gatherings detected",
      events: [],
    };
  }

  const primaryEvent = nearbyEvents[0];
  return {
    surge: true,
    expectedIncrease: primaryEvent.expectedIncrease,
    reason: primaryEvent.name,
    events: nearbyEvents,
  };
}

export function generateNGOAlerts(userLocation, listings) {
  const alerts = [];
  const surgePrediction = predictFoodSurge(userLocation);

  if (surgePrediction.surge) {
    alerts.push(`High food availability expected near you (${surgePrediction.reason}).`);
  }

  const now = Date.now();
  const nearbyListings = (listings || [])
    .filter((listing) => listing.status === "available")
    .map((listing) => {
      const coords = getListingLatLng(listing);
      if (!coords || !userLocation) {
        return { listing, distance: Number.POSITIVE_INFINITY };
      }
      return {
        listing,
        distance: getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng),
      };
    })
    .filter((item) => item.distance <= 30);

  const expiringSoon = nearbyListings.filter((item) => {
    const expiryMs = new Date(item.listing.expiry_time).getTime();
    return expiryMs > now && expiryMs - now <= 2 * 60 * 60 * 1000;
  });

  if (expiringSoon.length >= 2) {
    alerts.push(`Multiple large listings are expiring within 2 hours (${expiringSoon.length} nearby).`);
  }

  const totalNearbyQty = nearbyListings.reduce(
    (total, item) => total + Number(item.listing.quantity || item.listing.qty || 0),
    0,
  );
  if (totalNearbyQty >= 100) {
    alerts.push(`Surplus food spike predicted tonight (${totalNearbyQty} meals currently available nearby).`);
  }

  if (!alerts.length) {
    alerts.push("No critical AI alerts right now. Nearby listings are within safe rescue windows.");
  }

  return alerts;
}
