"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSuggestionById } from "@/lib/suggestions-db";
import { marketFormToDbRow } from "@/lib/db-transform";

export async function approveSuggestion(id: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const suggestion = await getSuggestionById(id);
  if (!suggestion) return { error: "Suggestion not found." };
  if (suggestion.status !== "pending") return { error: "Suggestion is not pending." };

  const row = marketFormToDbRow(suggestion.data);

  if (suggestion.type === "new") {
    const { error } = await supabase.from("pasar_malams").insert(row);
    if (error) {
      console.error("Error creating market from suggestion:", error);
      return { error: error.message };
    }
  } else {
    if (!suggestion.target_id) return { error: "Missing target market ID." };
    const { error } = await supabase.from("pasar_malams").update(row).eq("id", suggestion.target_id);
    if (error) {
      console.error("Error updating market from suggestion:", error);
      return { error: error.message };
    }
  }

  const { error: reviewError } = await supabase
    .from("market_suggestions")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (reviewError) {
    console.error("Error updating suggestion status:", reviewError);
    return { error: reviewError.message };
  }

  revalidatePath("/admin/suggestions");
  revalidatePath("/markets");
  revalidatePath("/");

  return { error: undefined };
}

export async function rejectSuggestion(id: string, reason?: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await supabase
    .from("market_suggestions")
    .update({
      status: "rejected",
      rejection_reason: reason?.trim() || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    console.error("Error rejecting suggestion:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/suggestions");
  return {};
}
