"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MarketFormValues } from "@/lib/admin-schema";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { marketFormToDbRow } from "@/lib/db-transform";

function revalidateMarketPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/markets");
  revalidatePath("/admin/markets");
  if (id) revalidatePath(`/markets/${id}`);
}

export async function createMarket(data: MarketFormValues): Promise<{ error?: string }> {
  const supabase = await requireAdmin();
  const row = marketFormToDbRow(data);

  const { error } = await supabase.from("pasar_malams").insert(row);

  if (error) {
    console.error("Error creating market:", error);
    return { error: error.message };
  }

  revalidateMarketPaths();
  return {};
}

export async function updateMarket(id: string, data: MarketFormValues): Promise<{ error?: string }> {
  const supabase = await requireAdmin();
  const row = marketFormToDbRow(data);

  const { error } = await supabase.from("pasar_malams").update(row).eq("id", id);

  if (error) {
    console.error("Error updating market:", error);
    return { error: error.message };
  }

  revalidateMarketPaths(id);
  return {};
}

export async function deleteMarket(id: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("pasar_malams").delete().eq("id", id);

  if (error) {
    console.error("Error deleting market:", error);
    return { error: error.message };
  }

  revalidateMarketPaths(id);
  return {};
}

export async function updateMarketStatus(id: string, status: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("pasar_malams").update({ status }).eq("id", id);

  if (error) {
    console.error("Error updating market status:", error);
    return { error: error.message };
  }

  revalidateMarketPaths(id);
  return {};
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
