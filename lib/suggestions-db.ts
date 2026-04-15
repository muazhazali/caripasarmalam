import { createClient } from "@/lib/supabase";
import type { MarketFormValues } from "@/lib/admin-schema";

export type SuggestionStatus = "pending" | "approved" | "rejected";

export interface MarketSuggestion {
  id: string;
  type: "new" | "update";
  target_id: string | null; // varchar, matches pasar_malams.id
  data: MarketFormValues;
  submitter_email: string | null;
  status: SuggestionStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export async function getSuggestions(status?: SuggestionStatus): Promise<MarketSuggestion[]> {
  const supabase = await createClient();
  let query = supabase
    .from("market_suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MarketSuggestion[];
}

export async function getSuggestionById(id: string): Promise<MarketSuggestion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_suggestions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as MarketSuggestion;
}

export async function countPendingSuggestions(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("market_suggestions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) return 0;
  return count ?? 0;
}
