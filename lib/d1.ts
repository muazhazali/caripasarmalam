/**
 * D1 access helpers (SQLite via Cloudflare Workers binding).
 * Replaces lib/supabase.ts. Server-only.
 * getDB() is async (getCloudflareContext async mode) so it works in
 * static routes and route handlers alike.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DatabaseRow } from "./db-transform";

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

export async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return (env as { DB: D1Database }).DB;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return crypto.randomUUID();
}

export function parseJson<T>(text: unknown, fallback: T): T {
  if (text === null || text === undefined) return fallback;
  if (typeof text === "object") return text as T;
  try {
    return JSON.parse(String(text)) as T;
  } catch {
    return fallback;
  }
}

export function boolToInt(value: unknown): 0 | 1 {
  return value ? 1 : 0;
}

export function toDatabaseRow(raw: Record<string, unknown>): DatabaseRow {
  return raw as unknown as DatabaseRow;
}