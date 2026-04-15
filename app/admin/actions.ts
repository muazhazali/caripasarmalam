"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MarketFormValues } from "@/lib/admin-schema";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function marketFormToDbRow(data: MarketFormValues) {
  return {
    name: data.name,
    address: data.address,
    district: data.district,
    state: data.state,
    status: data.status,
    description: data.description ?? null,
    area_m2: data.area_m2 ?? null,
    total_shop: data.total_shop ?? null,
    shop_list: data.shop_list ?? null,
    amen_toilet: data.amenities.toilet,
    amen_prayer_room: data.amenities.prayer_room,
    parking_available: data.parking.available,
    parking_accessible: data.parking.accessible,
    parking_notes: data.parking.notes,
    location: data.location
      ? {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          gmaps_link: data.location.gmaps_link ?? "",
        }
      : null,
    schedule: data.schedule,
    contact: data.contact
      ? {
          phone: data.contact.phone ?? null,
          email: data.contact.email ?? null,
        }
      : null,
  };
}

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
