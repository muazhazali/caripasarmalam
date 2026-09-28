import { getSellerById } from "@/lib/sellers-db";
import { apiError, cacheHeaders, checkRateLimit, json, preflight } from "@/lib/api";

export const runtime = "nodejs";

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { limited, headers: rateHeaders } = await checkRateLimit(request, "api:seller", 60, 60 * 1000);
  if (limited) {
    return apiError(429, "rate_limited", "Too many requests. Please retry later.", { "Retry-After": "60" });
  }

  const { id } = await params;

  try {
    const seller = await getSellerById(id);
    if (!seller) {
      return apiError(404, "not_found", `Seller '${id}' not found.`);
    }
    return json({ data: seller }, { headers: { ...cacheHeaders(60, 300), ...rateHeaders } });
  } catch (e) {
    console.error("API /sellers/[id] error:", e);
    return apiError(500, "internal_error", "Failed to fetch seller.");
  }
}
