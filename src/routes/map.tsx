import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPinned } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useFood } from "@/contexts/FoodContext";
import "leaflet/dist/leaflet.css";

type LeafletCore = any;

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [{ title: "Map — ResQMeal" }],
  }),
  component: MapPage,
});

function getListingCoordinates(listing: any) {
  if (listing.location && typeof listing.location === "object") {
    const lat = Number(listing.location.lat);
    const lng = Number(listing.location.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat, lng };
    }
  }

  const lat = Number(listing.lat);
  const lng = Number(listing.lng);
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    return { lat, lng };
  }

  return null;
}

function formatExpiry(value: string) {
  return new Date(value).toLocaleString();
}

function MapPage() {
  const { listings, loading, error } = useFood();
  const [leaflet, setLeaflet] = useState<LeafletCore | null>(null);
  const [mapError, setMapError] = useState("");
  const [mapMode, setMapMode] = useState<"markers" | "heatmap" | "route">("markers");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const dataLayerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    if (typeof window === "undefined") {
      return;
    }

    const failTimer = window.setTimeout(() => {
      if (mounted) {
        setMapError("Map library load timed out. Please refresh.");
      }
    }, 10000);

    import("leaflet")
      .then((leafletLib) => {
        if (!mounted) {
          return;
        }
        const leafletCore = leafletLib.default ?? leafletLib;
        setLeaflet(leafletCore);
        setMapError("");
        window.clearTimeout(failTimer);
      })
      .catch((loadError) => {
        console.error("Failed to load map libraries", loadError);
        if (mounted) {
          const detail = loadError instanceof Error ? loadError.message : "Unknown map init error";
          setMapError(`Failed to initialize map: ${detail}`);
        }
        window.clearTimeout(failTimer);
      });

    return () => {
      mounted = false;
      window.clearTimeout(failTimer);
    };
  }, []);

  const mappedListings = useMemo(
    () =>
      listings
        .map((listing) => {
          const coords = getListingCoordinates(listing);
          if (!coords) {
            return null;
          }
          return { ...listing, ...coords };
        })
        .filter(Boolean) as Array<any>,
    [listings],
  );

  const mapCenter = mappedListings.length
    ? ([mappedListings[0].lat, mappedListings[0].lng] as [number, number])
    : ([17.385, 78.4867] as [number, number]);
  const routePath = mappedListings.map((listing) => [listing.lat, listing.lng] as [number, number]);

  const markerIcon = useMemo(() => {
    if (!leaflet) {
      return null;
    }
    return leaflet.divIcon({
      className: "resqmeal-marker",
      html: '<div style="width:14px;height:14px;border-radius:9999px;background:#10b981;border:2px solid white;box-shadow:0 0 0 2px rgba(16,185,129,0.2)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }, [leaflet]);

  useEffect(() => {
    if (!leaflet || !mapContainerRef.current || mapInstanceRef.current) {
      return;
    }

    const map = leaflet.map(mapContainerRef.current, { zoomControl: true }).setView(mapCenter, 11);
    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })
      .addTo(map);

    const layerGroup = leaflet.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    dataLayerRef.current = layerGroup;
  }, [leaflet, mapCenter]);

  useEffect(() => {
    if (!leaflet || !mapInstanceRef.current || !dataLayerRef.current) {
      return;
    }

    const layerGroup = dataLayerRef.current;
    layerGroup.clearLayers();

    if (mapMode === "markers" || mapMode === "route") {
      mappedListings.forEach((listing) => {
        const marker = leaflet.marker([listing.lat, listing.lng], markerIcon ? { icon: markerIcon } : undefined);
        marker.bindPopup(
          `<div style="font-weight:700">${listing.title}</div><div>Qty: ${listing.quantity || listing.qty || 0}</div><div>Expiry: ${formatExpiry(listing.expiry_time)}</div>`,
        );
        marker.addTo(layerGroup);
      });
    }

    if (mapMode === "heatmap") {
      mappedListings.forEach((listing) => {
        leaflet
          .circle([listing.lat, listing.lng], {
            radius: Math.max(120, Number(listing.quantity || 0) * 14),
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.25,
            weight: 1,
          })
          .addTo(layerGroup);
      });
    }

    if (mapMode === "route" && routePath.length > 1) {
      leaflet
        .polyline(routePath, {
          color: "#2563eb",
          weight: 4,
          opacity: 0.8,
        })
        .addTo(layerGroup);
    }

    if (mappedListings.length) {
      mapInstanceRef.current.setView([mappedListings[0].lat, mappedListings[0].lng], 11);
    }
  }, [leaflet, mapMode, mappedListings, markerIcon, routePath]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      dataLayerRef.current = null;
    };
  }, []);

  return (
    <RequireAuth>
      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="glass-panel rounded-[2rem] px-6 py-8 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
              <MapPinned className="h-4 w-4" />
              Live Food Map
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Food Listings Map</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
              Real-time listing locations from Firestore with live marker updates.
            </p>
          </div>

          {loading ? (
            <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-slate-500">Loading map data...</div>
          ) : error ? (
            <div className="glass-panel rounded-[2rem] p-8 text-sm font-semibold text-red-600">{error}</div>
          ) : null}

          <div className="glass-panel rounded-[2rem] p-4">
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setMapMode("markers")}
                className={`rounded-full px-3 py-1 text-xs font-bold ${mapMode === "markers" ? "bg-primary text-white" : "bg-white text-slate-600"}`}
              >
                Markers
              </button>
              <button
                type="button"
                onClick={() => setMapMode("heatmap")}
                className={`rounded-full px-3 py-1 text-xs font-bold ${mapMode === "heatmap" ? "bg-primary text-white" : "bg-white text-slate-600"}`}
              >
                Heatmap
              </button>
              <button
                type="button"
                onClick={() => setMapMode("route")}
                className={`rounded-full px-3 py-1 text-xs font-bold ${mapMode === "route" ? "bg-primary text-white" : "bg-white text-slate-600"}`}
              >
                Route
              </button>
            </div>
            <div className="h-[560px] overflow-hidden rounded-[1.5rem]">
              {leaflet && !mapError ? (
                <div ref={mapContainerRef} className="h-full w-full" />
              ) : mapError ? (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-red-600">{mapError}</div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">Loading map...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
