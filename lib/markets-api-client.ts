/**
 * Client-side fetch of markets from the public API (/api/v1).
 * Replaces direct Supabase browser access.
 */

import type { Market } from "./markets-data";

export interface MarketsApiResponse {
  data: Market[];
  meta: { count: number; limit: number; offset: number };
}

/**
 * Build an absolute URL for /api/v1/markets usable from both
 * browser (relative) and server/SSR contexts (absolute, since a
 * Worker cannot fetch its own origin via a relative path).
 */
export function marketsApiUrl(params: Record<string, string | number | undefined> = {}): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  }
  const qs = search.toString();
  const path = `/api/v1/markets${qs ? `?${qs}` : ""}`;
  if (typeof window !== "undefined") return path;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path}`;
}

export async function fetchMarketsApi(params: Record<string, string | number | undefined> = {}): Promise<Market[]> {
  const res = await fetch(marketsApiUrl(params), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Markets API error: ${res.status}`);
  }
  const body = (await res.json()) as MarketsApiResponse;
  return body.data;
}