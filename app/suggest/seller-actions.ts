"use server";

import { headers } from "next/headers";
import { newId } from "@/lib/d1";
import { insertSellerSuggestion } from "@/lib/seller-suggestions-db";
import { sellerFormSchema, type SellerFormValues } from "@/lib/seller-schema";

// Same fail-closed rate limit as market suggestions: 5/hour per IP.
async function checkSubmitRateLimit(ip: string): Promise<boolean> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const limiter = (
      getCloudflareContext().env as {
        RATE_LIMITER?: { fetch: (input: string, init?: RequestInit) => Promise<Response> };
      }
    ).RATE_LIMITER;
    if (!limiter) return true; // limiter not deployed yet (local dev without preview)
    const res = await limiter.fetch("https://rate-limiter.internal/", {
      method: "POST",
      body: JSON.stringify({ key: `suggest-seller:${ip}`, max: 5, windowMs: 60 * 60 * 1000 }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch (e) {
    console.error("Rate limiter unreachable, blocking submission:", e);
    return false;
  }
}

export async function submitSellerSuggestion(
  type: "new" | "update",
  targetId: string | null,
  data: SellerFormValues,
  submitterEmail?: string,
  honeypot?: string, // must be empty — bots fill it, humans don't see it
): Promise<{ error?: string }> {
  // 1. Honeypot check — if filled, silently succeed (don't tell bots they failed)
  if (honeypot && honeypot.trim().length > 0) {
    return {};
  }

  // 2. Rate limit by IP (Durable Object, cross-isolate)
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = headersList.get("cf-connecting-ip") ?? forwarded ?? "unknown";

  if (!(await checkSubmitRateLimit(ip))) {
    return { error: "Too many submissions. Please try again in an hour." };
  }

  // 3. Server-side schema validation
  const parsed = sellerFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  // 4. Email format sanity check (if provided)
  if (submitterEmail) {
    const emailTrimmed = submitterEmail.trim();
    if (emailTrimmed.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      return { error: "Invalid email address." };
    }
  }

  // 5. For "update" type, target_id is required
  if (type === "update" && !targetId) {
    return { error: "Please select a seller to update." };
  }

  // 6. Insert into D1 (phone/social stay in the suggestion payload until admin approval)
  try {
    await insertSellerSuggestion({
      id: newId(),
      type,
      targetId: targetId ?? null,
      data: parsed.data,
      submitterEmail: submitterEmail?.trim() || null,
    });
  } catch (e) {
    console.error("Error submitting seller suggestion:", e);
    return { error: "Failed to submit suggestion. Please try again." };
  }

  return {};
}
