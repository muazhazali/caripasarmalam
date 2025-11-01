export async function openDirections(destLat: number, destLng: number): Promise<void> {
  const mapsBase = "https://www.google.com/maps/dir/?api=1"
  const destination = `${destLat},${destLng}`

  const getCurrentPosition = () =>
    new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      }),
    )

  if (typeof navigator !== "undefined" && "geolocation" in navigator) {
    try {
      const pos = await getCurrentPosition()
      const origin = `${pos.coords.latitude},${pos.coords.longitude}`
      const url = `${mapsBase}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
      window.open(url, "_blank", "noopener")
      return
    } catch (err) {
      // user denied or timed out - fall through to fallback
    }
  }

  const fallbackUrl = `${mapsBase}&destination=${encodeURIComponent(destination)}`
  window.open(fallbackUrl, "_blank", "noopener")
}

export default openDirections
