"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationMapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  onClear: () => void;
  labels?: {
    title?: string;
    hint?: string;
    search?: string;
    searchBtn?: string;
    clear?: string;
  };
}

export function LocationMapPicker({ latitude, longitude, onChange, onClear, labels = {} }: LocationMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const title = labels.title ?? "Pin Location on Map";
  const hint = labels.hint ?? "Click on the map to set the market location.";
  const searchPlaceholder = labels.search ?? "Search address...";
  const searchBtnLabel = labels.searchBtn ?? "Search";
  const clearLabel = labels.clear ?? "Clear pin";

  // Initialize map once
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let resizeObserver: ResizeObserver | null = null;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) return;

      const initialLat = latitude && latitude !== 0 ? latitude : 3.139;
      const initialLng = longitude && longitude !== 0 ? longitude : 101.6869;
      const initialZoom = latitude && latitude !== 0 ? 15 : 6;

      const map = L.map(mapRef.current!).setView([initialLat, initialLng], initialZoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Place existing pin if coords provided
      if (latitude && latitude !== 0 && longitude && longitude !== 0) {
        markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
        });
      }

      // Click to place / move marker
      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLatLng();
            onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
          });
        }
        onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
      });

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
        setIsReady(true);
      }, 100);

      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      if (mapRef.current) resizeObserver.observe(mapRef.current);
    };

    init();

    return () => {
      resizeObserver?.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external lat/lng changes (e.g. form reset)
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return;
    const L_ref = markerRef.current;
    if (latitude && latitude !== 0 && longitude && longitude !== 0) {
      if (L_ref) {
        L_ref.setLatLng([latitude, longitude]);
      }
      mapInstanceRef.current.setView([latitude, longitude], 15);
    } else if (!latitude || latitude === 0) {
      if (L_ref && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(L_ref);
        markerRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  async function handleSearch() {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=my&limit=1`,
      );
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon } = results[0];
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lon);
        const L = (await import("leaflet")).default;
        if (markerRef.current) {
          markerRef.current.setLatLng([parsedLat, parsedLng]);
        } else {
          markerRef.current = L.marker([parsedLat, parsedLng], { draggable: true }).addTo(mapInstanceRef.current);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLatLng();
            onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
          });
        }
        mapInstanceRef.current.setView([parsedLat, parsedLng], 16);
        onChange(parseFloat(parsedLat.toFixed(6)), parseFloat(parsedLng.toFixed(6)));
      }
    } catch {
      // silently fail
    } finally {
      setIsSearching(false);
    }
  }

  function handleClear() {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    onClear();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {latitude && latitude !== 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground h-7 px-2">
            <X className="w-3 h-3 mr-1" />
            {clearLabel}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{hint}</p>

      {/* Address search */}
      <div className="flex gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={handleSearch} disabled={isSearching} className="shrink-0">
          <Search className="w-4 h-4 mr-1" />
          {searchBtnLabel}
        </Button>
      </div>

      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border bg-muted" style={{ height: 300 }}>
        <div ref={mapRef} className="w-full h-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <MapPin className="w-6 h-6 animate-pulse text-muted-foreground" />
          </div>
        )}
      </div>

      {latitude && latitude !== 0 && longitude && longitude !== 0 && (
        <p className="text-xs text-muted-foreground font-mono">
          {latitude}, {longitude}
        </p>
      )}
    </div>
  );
}
