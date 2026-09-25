"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MarketFormValues } from "@/lib/admin-schema";
import { requireAdmin } from "@/lib/auth";
import {
  deleteMarketById,
  insertMarketFromForm,
  updateMarketFromForm,
  updateMarketStatus as updateMarketStatusInDb,
} from "@/lib/db";

function revalidateMarketPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/markets");
  revalidatePath("/admin/markets");
  if (id) revalidatePath(`/markets/${id}`);
}

export async function createMarket(data: MarketFormValues): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await insertMarketFromForm(data);
  } catch (e) {
    console.error("Error creating market:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidateMarketPaths();
  return {};
}

export async function updateMarket(id: string, data: MarketFormValues): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await updateMarketFromForm(id, data);
  } catch (e) {
    console.error("Error updating market:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidateMarketPaths(id);
  return {};
}

export async function deleteMarket(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await deleteMarketById(id);
  } catch (e) {
    console.error("Error deleting market:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidateMarketPaths(id);
  return {};
}

export async function updateMarketStatus(id: string, status: string): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await updateMarketStatusInDb(id, status);
  } catch (e) {
    console.error("Error updating market status:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidateMarketPaths(id);
  return {};
}

export async function signOut() {
  await requireAdmin();
  const { deleteSessionCookie } = await import("@/lib/auth");
  await deleteSessionCookie();
  redirect("/admin/login");
}
