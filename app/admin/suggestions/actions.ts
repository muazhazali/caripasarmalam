"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getAdminUser } from "@/lib/auth";
import { insertMarketFromForm, updateMarketFromForm } from "@/lib/db";
import { getSuggestionById, reviewSuggestion } from "@/lib/suggestions-db";
import { insertSellerFromForm, updateSellerFromForm } from "@/lib/sellers-db";
import { getSellerSuggestionById, reviewSellerSuggestion } from "@/lib/seller-suggestions-db";
import type { SellerFormValues } from "@/lib/seller-schema";

export async function approveSuggestion(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const user = await getAdminUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const suggestion = await getSuggestionById(id);
  if (!suggestion) return { error: "Suggestion not found." };
  if (suggestion.status !== "pending") return { error: "Suggestion is not pending." };

  try {
    if (suggestion.type === "new") {
      await insertMarketFromForm(suggestion.data);
    } else {
      if (!suggestion.target_id) return { error: "Missing target market ID." };
      await updateMarketFromForm(suggestion.target_id, suggestion.data);
    }

    await reviewSuggestion(id, { status: "approved", reviewedBy: user.id });
  } catch (e) {
    console.error("Error approving suggestion:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidatePath("/admin/suggestions");
  revalidatePath("/markets");
  revalidatePath("/");

  return { error: undefined };
}

export async function rejectSuggestion(id: string, reason?: string): Promise<{ error?: string }> {
  await requireAdmin();
  const user = await getAdminUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  try {
    await reviewSuggestion(id, {
      status: "rejected",
      reviewedBy: user.id,
      rejectionReason: reason?.trim() || null,
    });
  } catch (e) {
    console.error("Error rejecting suggestion:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidatePath("/admin/suggestions");
  return {};
}

export async function approveSellerSuggestion(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const user = await getAdminUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  const suggestion = await getSellerSuggestionById(id);
  if (!suggestion) return { error: "Suggestion not found." };
  if (suggestion.status !== "pending") return { error: "Suggestion is not pending." };

  try {
    const data = suggestion.data as SellerFormValues;
    if (suggestion.type === "new") {
      await insertSellerFromForm(data);
    } else {
      if (!suggestion.target_id) return { error: "Missing target seller ID." };
      await updateSellerFromForm(suggestion.target_id, data);
    }

    await reviewSellerSuggestion(id, { status: "approved", reviewedBy: user.id });
  } catch (e) {
    console.error("Error approving seller suggestion:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidatePath("/admin/suggestions");
  revalidatePath("/sellers");
  revalidatePath("/");

  return { error: undefined };
}

export async function rejectSellerSuggestion(id: string, reason?: string): Promise<{ error?: string }> {
  await requireAdmin();
  const user = await getAdminUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  try {
    await reviewSellerSuggestion(id, {
      status: "rejected",
      reviewedBy: user.id,
      rejectionReason: reason?.trim() || null,
    });
  } catch (e) {
    console.error("Error rejecting seller suggestion:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidatePath("/admin/suggestions");
  return {};
}
