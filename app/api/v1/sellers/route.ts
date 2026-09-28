import { getSellers, searchSellers } from "@/lib/sellers-db";
import { apiError, cacheHeaders, checkRateLimit, json, preflight } from "@/lib/api";
import type { Weekday } from "@/lib/market-types";

export const runtime = "nodejs";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 100;

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: Request) {
  const { limited, headers: rateHeaders } = await checkRateLimit(request, "api:sellers", 60, 60 * 1000);
  if (limited) {
    return apiError(429, "rate_limited", "Too many requests. Please retry later.", { "Retry-After": "60" });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const state = url.searchParams.get("state") ?? undefined;
  const district = url.searchParams.get("district") ?? undefined;
  const marketId = url.searchParams.get("marketId") ?? undefined;
  const day = url.searchParams.get("day") ?? undefined;
  const status = url.searchParams.get("status") ?? "Active";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);

  try {
    let sellers;
    if (q && q.trim().length > 0) {
      // FTS search across items, names, categories; remaining filters applied client-side
      // of the API consumer when combined. Simple q search keeps this endpoint fast.
      sellers = await searchSellers(q, limit);
    } else {
      sellers = await getSellers({
        category,
        state,
        district,
        marketId,
        day: day as Weekday,
        status,
        limit,
        offset,
      });
    }

    return json(
      { data: sellers, meta: { count: sellers.length, limit, offset } },
      { headers: { ...cacheHeaders(60, 300), ...rateHeaders } },
    );
  } catch (e) {
    console.error("API /sellers error:", e);
    return apiError(500, "internal_error", "Failed to fetch sellers.");
  }
}
