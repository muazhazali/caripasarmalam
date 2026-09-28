import { getDB } from "./d1";
import type { SellerSuggestion } from "./seller-types";
import type { SellerFormValues } from "./seller-schema";

export type SellerSuggestionStatus = "pending" | "approved" | "rejected";

function toSuggestion(raw: Record<string, unknown>): SellerSuggestion {
  return {
    ...(raw as unknown as Omit<SellerSuggestion, "data">),
    data: JSON.parse(String(raw.data)) as SellerFormValues,
  };
}

export async function getSellerSuggestions(status?: SellerSuggestionStatus): Promise<SellerSuggestion[]> {
  const db = await getDB();
  const stmt = status
    ? db.prepare("SELECT * FROM seller_suggestions WHERE status = ? ORDER BY created_at DESC").bind(status)
    : db.prepare("SELECT * FROM seller_suggestions ORDER BY created_at DESC");
  const { results } = await stmt.all<Record<string, unknown>>();
  return (results ?? []).map(toSuggestion);
}

export async function getSellerSuggestionById(id: string): Promise<SellerSuggestion | null> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT * FROM seller_suggestions WHERE id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!row) return null;
  return toSuggestion(row);
}

export async function countPendingSellerSuggestions(): Promise<number> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM seller_suggestions WHERE status = 'pending'")
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function insertSellerSuggestion(input: {
  id: string;
  type: "new" | "update";
  targetId: string | null;
  data: SellerFormValues;
  submitterEmail: string | null;
}): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO seller_suggestions (id, type, target_id, data, submitter_email, status, created_at)
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

export async function reviewSellerSuggestion(
  id: string,
  update: { status: "approved" | "rejected"; reviewedBy: string; rejectionReason?: string | null },
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE seller_suggestions SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?`,
    )
    .bind(update.status, update.rejectionReason ?? null, update.reviewedBy, new Date().toISOString(), id)
    .run();
}
