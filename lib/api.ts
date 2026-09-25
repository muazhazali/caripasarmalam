/**
 * Shared helpers for /api/v1 route handlers:
 * CORS (open access), rate limiting via RateLimiter Durable Object,
 * and cache headers for public GETs.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "X-API-Version": "1",
};

export function json(data: unknown, init: { status?: number; headers?: Record<string, string> } = {}): Response {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...init.headers,
    },
  });
}

export function apiError(
  status: number,
  code: string,
  message: string,
  extraHeaders?: Record<string, string>,
): Response {
  return json({ error: { code, message } }, { status, headers: extraHeaders });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function getLimiter(): { fetch: (input: string, init?: RequestInit) => Promise<Response> } | null {
  try {
    return (
      (getCloudflareContext().env as { RATE_LIMITER?: { fetch: (i: string, r?: RequestInit) => Promise<Response> } })
        .RATE_LIMITER ?? null
    );
  } catch {
    return null;
  }
}

/**
 * Rate limit a request through the RateLimiter Durable Object.
 * Fail-open for GETs (availability over strictness on public reads).
 */
export async function checkRateLimit(
  request: Request,
  route: string,
  max: number,
  windowMs: number,
): Promise<{ limited: boolean; headers: Record<string, string> }> {
  const limiter = getLimiter();
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!limiter) return { limited: false, headers: {} };

  try {
    const res = await limiter.fetch("https://rate-limiter.internal/", {
      method: "POST",
      body: JSON.stringify({ key: `${route}:${ip}`, max, windowMs }),
    });
    const data = (await res.json()) as { success: boolean; remaining?: number; resetMs?: number };
    return {
      limited: !data.success,
      headers: {
        "X-RateLimit-Limit": String(max),
        "X-RateLimit-Remaining": String(data.remaining ?? max),
        "X-RateLimit-Reset": String(Math.ceil((data.resetMs ?? windowMs) / 1000)),
      },
    };
  } catch (e) {
    console.error("Rate limiter unavailable, failing open:", e);
    return { limited: false, headers: {} };
  }
}

export function cacheHeaders(sMaxAge: number, staleWhileRevalidate: number): Record<string, string> {
  return { "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}` };
}
