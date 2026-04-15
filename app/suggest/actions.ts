"use server";

import { createClient } from "@/lib/supabase";
import { marketFormSchema, type MarketFormValues } from "@/lib/admin-schema";

export async function submitSuggestion(
  type: "new" | "update",
  targetId: string | null,
  data: MarketFormValues,
  submitterEmail?: string
): Promise<{ error?: string }> {
  const parsed = marketFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

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
    return { error: error.message };
  }

  return {};
}
