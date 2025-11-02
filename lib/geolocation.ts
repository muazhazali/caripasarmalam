/**
 * Geolocation utilities for Malaysian states
 * Maps coordinates (latitude, longitude) to Malaysian states using bounding boxes
 */

// Malaysian state bounding boxes [minLat, minLng, maxLat, maxLng]
const STATE_BOUNDS: Record<string, [number, number, number, number]> = {
  'Johor': [1.12, 102.45, 2.76, 104.52],
  'Kedah': [5.05, 99.65, 6.73, 101.03],
  'Kelantan': [4.18, 101.27, 6.33, 102.96],
  'Kuala Lumpur': [3.02, 101.38, 3.35, 101.78],
  'Labuan': [5.20, 115.08, 5.47, 115.29],
  'Melaka': [2.09, 102.06, 2.61, 102.76],
  'Negeri Sembilan': [2.42, 101.73, 3.17, 102.58],
  'Pahang': [2.62, 101.55, 4.85, 104.44],
  'Penang': [5.06, 100.09, 5.61, 100.56],
  'Perak': [3.76, 100.18, 5.47, 101.78],
  'Perlis': [6.10, 100.07, 6.67, 100.39],
  'Putrajaya': [2.88, 101.65, 2.96, 101.72],
  'Sabah': [3.92, 115.27, 7.37, 119.27],
  'Sarawak': [0.85, 109.57, 5.07, 115.53],
  'Selangor': [2.62, 100.77, 3.90, 101.97],
  'Terengganu': [4.00, 102.46, 5.83, 103.64],
}

/**
 * Get the Malaysian state name from coordinates
 * Uses simple bounding box detection
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns State name or null if coordinates are outside Malaysia
 * 
 * @example
 * ```ts
 * const state = getStateFromCoordinates(3.1390, 101.6869) // Returns "Kuala Lumpur"
 * ```
 */
export function getStateFromCoordinates(
  latitude: number,
  longitude: number
): string | null {
  // Validate coordinates
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null
  }

  // Check each state's bounding box
  for (const [state, bounds] of Object.entries(STATE_BOUNDS)) {
    const [minLat, minLng, maxLat, maxLng] = bounds
    
    if (
      latitude >= minLat &&
      latitude <= maxLat &&
      longitude >= minLng &&
      longitude <= maxLng
    ) {
      return state
    }
  }

  // Coordinates are outside all Malaysian states
  return null
}

/**
 * Get all Malaysian state names
 */
export function getAllStates(): string[] {
  return Object.keys(STATE_BOUNDS)
}

/**
 * Check if coordinates are within Malaysia
 */
export function isWithinMalaysia(latitude: number, longitude: number): boolean {
  return getStateFromCoordinates(latitude, longitude) !== null
}

