"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { MapPin } from "lucide-react";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  className?: string;
}

export default function InteractiveMap({ latitude, longitude, name, address, className = "" }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Only load map on client side
    if (typeof window === "undefined" || !mapRef.current) return;

    const loadMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = (await import("leaflet")).default;

        // Import CSS
        await import("leaflet/dist/leaflet.css");

        // Fix for default markers in Leaflet with webpack
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Initialize map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = L.map(mapRef.current).setView([latitude, longitude], 15);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add marker for the market
        const marker = L.marker([latitude, longitude]).addTo(map);

        // Add popup with market info
        marker
          .bindPopup(
            `
          <div class="p-2">
            <h3 class="font-semibold text-sm mb-1">${name}</h3>
            <p class="text-xs text-gray-600">${address}</p>
          </div>
        `,
          )
          .openPopup();

        mapInstanceRef.current = map;

        // mark as ready after first paint
        setTimeout(() => {
          setIsReady(true);
          map.invalidateSize();
        }, 0);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        if (mapRef.current) {
          resizeObserver.observe(mapRef.current);
        }

        // Store cleanup function
        const cleanup = () => {
          resizeObserver.disconnect();
        };

        return cleanup;
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    let cleanup: (() => void) | undefined;

    loadMap().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setIsReady(false);
    };
  }, [latitude, longitude, name, address]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: "256px" }} />
      {/* Loading fallback */}
      {!isReady && (
        <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">{t.loadingMap}</p>
          </div>
        </div>
      )}
    </div>
  );
}
