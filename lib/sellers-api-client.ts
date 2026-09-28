/**
 * Client-side fetch of sellers from the public API (/api/v1/sellers).
 * Client components must use this instead of importing lib/d1.ts or lib/sellers-db.ts.
 */

import type { Seller } from "./seller-types";

export interface SellersApiResponse {
  data: Seller[];
  meta: { count: number; limit: number; offset: number };
}

/**
 * Build an absolute URL for /api/v1/sellers usable from both
 * browser (relative) and server/SSR contexts (absolute).
 */
export function sellersApiUrl(params: Record<string, string | number | undefined> = {}): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  }
  const qs = search.toString();
  const path = `/api/v1/sellers${qs ? `?${qs}` : ""}`;
  if (typeof window !== "undefined") return path;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path}`;
}

export async function fetchSellersApi(params: Record<string, string | number | undefined> = {}): Promise<Seller[]> {
  const res = await fetch(sellersApiUrl(params), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Sellers API error: ${res.status}`);
  }
  const body = (await res.json()) as SellersApiResponse;
  return body.data;
}
