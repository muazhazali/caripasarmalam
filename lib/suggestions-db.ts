import { getDB } from "./d1";
import type { MarketFormValues } from "./admin-schema";

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

function toSuggestion(raw: Record<string, unknown>): MarketSuggestion {
  return {
    ...(raw as unknown as Omit<MarketSuggestion, "data">),
    data: JSON.parse(String(raw.data)) as MarketFormValues,
  };
}

export async function getSuggestions(status?: SuggestionStatus): Promise<MarketSuggestion[]> {
  const db = await getDB();
  const stmt = status
    ? db.prepare("SELECT * FROM market_suggestions WHERE status = ? ORDER BY created_at DESC").bind(status)
    : db.prepare("SELECT * FROM market_suggestions ORDER BY created_at DESC");
  const { results } = await stmt.all<Record<string, unknown>>();
  return (results ?? []).map(toSuggestion);
}

export async function getSuggestionById(id: string): Promise<MarketSuggestion | null> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT * FROM market_suggestions WHERE id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!row) return null;
  return toSuggestion(row);
}

export async function countPendingSuggestions(): Promise<number> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM market_suggestions WHERE status = 'pending'")
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function insertSuggestion(input: {
  id: string;
  type: "new" | "update";
  targetId: string | null;
  data: MarketFormValues;
  submitterEmail: string | null;
}): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO market_suggestions (id, type, target_id, data, submitter_email, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    )
    .bind(
      input.id,
      input.type,
      input.targetId,
      JSON.stringify(input.data),
      input.submitterEmail,
      new Date().toISOString(),
    )
    .run();
}

export async function reviewSuggestion(
  id: string,
  update: { status: "approved" | "rejected"; reviewedBy: string; rejectionReason?: string | null },
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE market_suggestions SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?`,
    )
    .bind(update.status, update.rejectionReason ?? null, update.reviewedBy, new Date().toISOString(), id)
    .run();
}
