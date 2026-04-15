"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase";
import { marketFormSchema, type MarketFormValues } from "@/lib/admin-schema";

// ---------------------------------------------------------------------------
// Simple in-process rate limiter (resets on server restart / cold start)
// For production with multiple instances, replace with Redis/Upstash.
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;          // max submissions per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

// Periodically prune stale entries so the map doesn't grow forever
function pruneRateLimitMap() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------
export async function submitSuggestion(
  type: "new" | "update",
  targetId: string | null,
  data: MarketFormValues,
  submitterEmail?: string,
  honeypot?: string,          // must be empty — bots fill it, humans don't see it
): Promise<{ error?: string }> {

  // 1. Honeypot check — if filled, silently succeed (don't tell bots they failed)
  if (honeypot && honeypot.trim().length > 0) {
    return {};
  }

  // 2. Rate limit by IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  pruneRateLimitMap();

  if (!checkRateLimit(ip)) {
    return { error: "Too many submissions. Please try again in an hour." };
  }

  // 3. Server-side schema validation
  const parsed = marketFormSchema.safeParse(data);
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
    return { error: "Please select a market to update." };
  }

  // 6. Insert into DB
  const supabase = await createClient();

  const { error } = await supabase.from("market_suggestions").insert({
    type,
    target_id: targetId ?? null,
    data: parsed.data,
    submitter_email: submitterEmail?.trim() || null,
    status: "pending",
  });

  if (error) {
    console.error("Error submitting suggestion:", error);
    return { error: "Failed to submit suggestion. Please try again." };
  }

  return {};
}
