export type MapApp = "google" | "apple" | "waze";

export interface MapAppOption {
  id: MapApp;
  name: string;
  icon: string;
  buildUrl: (lat: number, lng: number) => string;
  canOpen: () => boolean;
}

export const MAP_APPS: MapAppOption[] = [
  {
    id: "google",
    name: "Google Maps",
    icon: "🗺️",
    buildUrl: (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    canOpen: () => true,
  },
  {
    id: "apple",
    name: "Apple Maps",
    icon: "🗺️",
    // The `maps://` scheme is often blocked by desktop browsers and
    // developer-mode mobile simulators, so prefer `https://maps.apple.com`
    // for checking on desktop browser while develop.
    buildUrl: (lat, lng) => `maps://maps.apple.com/?daddr=${lat},${lng}`,
    canOpen: () => {
      if (typeof navigator === "undefined") return false;
      return /iPhone|iPad|iPod|Macintosh|Mac OS X/.test(navigator.userAgent);
    },
  },
  {
    id: "waze",
    name: "Waze",
    icon: "🛣️",
    buildUrl: (lat, lng) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    canOpen: () => true,
  },
];

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export async function openDirections(destLat: number, destLng: number, onShowChooser?: () => void): Promise<void> {
  const mapsBase = "https://www.google.com/maps/dir/?api=1";
  const destination = `${destLat},${destLng}`;

  const getCurrentPosition = () =>
    new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      }),
    );

  // On mobile, show map app chooser
  if (isMobile()) {
    onShowChooser?.();
    return;
  }

  // Desktop: Default to Google Maps with current location as origin
  if (typeof navigator !== "undefined" && "geolocation" in navigator) {
    try {
      const pos = await getCurrentPosition();
      const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
      const url = `${mapsBase}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
      window.open(url, "_blank", "noopener");
      return;
    } catch (err) {
      // user denied or timed out - fall through to fallback
    }
  }

  const fallbackUrl = `${mapsBase}&destination=${encodeURIComponent(destination)}`;
  window.open(fallbackUrl, "_blank", "noopener");
}

export function openWithMapApp(mapApp: MapAppOption, lat: number, lng: number): void {
  const url = mapApp.buildUrl(lat, lng);
  window.open(url, "_blank", "noopener");
}

export default openDirections;