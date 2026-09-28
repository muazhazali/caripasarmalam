"use server";

import { revalidatePath } from "next/cache";
import type { SellerFormValues } from "@/lib/seller-schema";
import { requireAdmin } from "@/lib/auth";
import {
  deleteSellerById,
  insertSellerFromForm,
  updateSellerFromForm,
  updateSellerStatus as updateSellerStatusInDb,
} from "@/lib/sellers-db";

function revalidateSellerPaths(id?: string) {
  revalidatePath("/sellers");
  revalidatePath("/admin/sellers");
  if (id) revalidatePath(`/sellers/${id}`);
}

export async function createSeller(data: SellerFormValues): Promise<{ error?: string; id?: string }> {
  await requireAdmin();

  try {
    const id = await insertSellerFromForm(data);
    revalidateSellerPaths(id);
    return { id };
  } catch (e) {
    console.error("Error creating seller:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateSeller(id: string, data: SellerFormValues): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await updateSellerFromForm(id, data);
  } catch (e) {
    console.error("Error updating seller:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidateSellerPaths(id);
  return {};
}

export async function deleteSeller(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await deleteSellerById(id);
  } catch (e) {
    console.error("Error deleting seller:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidateSellerPaths(id);
  return {};
}

export async function updateSellerStatus(id: string, status: string): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    await updateSellerStatusInDb(id, status);
  } catch (e) {
    console.error("Error updating seller status:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  revalidateSellerPaths(id);
  return {};
}
