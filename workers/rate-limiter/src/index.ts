/**
 * RateLimiter Durable Object: precise sliding-window rate limiting.
 *
 * POST / { key, max, windowMs } -> { success, remaining, resetMs }
 *
 * Uses DO SQLite storage (requests table, created lazily) with
 * alarm-based pruning. Deployed as its own Worker; bound into the
 * main app as a service binding.
 */

interface RateLimitRequest {
  key: string;
  max: number;
  windowMs: number;
}

export class RateLimiter {
  private storage: DurableObjectStorage;

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    // Ensure schema exists (idempotent)
    await this.storage.sql.exec(`CREATE TABLE IF NOT EXISTS requests (key TEXT NOT NULL, ts INTEGER NOT NULL)`);
    await this.storage.sql.exec(`CREATE INDEX IF NOT EXISTS idx_requests_key_ts ON requests (key, ts)`);

    const body = (await request.json()) as RateLimitRequest;
    if (!body.key || typeof body.max !== "number" || typeof body.windowMs !== "number") {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const now = Date.now();
    const windowStart = now - body.windowMs;

    // Prune expired entries + count current window in one pass
    await this.storage.sql.exec(`DELETE FROM requests WHERE key = ?1 AND ts <= ?2`, body.key, windowStart);

    const rows = this.storage.sql
      .exec<{ n: number }>(`SELECT COUNT(*) AS n FROM requests WHERE key = ?1`, body.key)
      .toArray();

    const count = Number(rows[0]?.n ?? 0);
    const success = count < body.max;

    if (success) {
      await this.storage.sql.exec(`INSERT INTO requests (key, ts) VALUES (?1, ?2)`, body.key, now);
    }

    // Schedule alarm for pruning (idempotent; fires at earliest pending expiry)
    const currentAlarm = await this.storage.getAlarm();
    if (currentAlarm === null) {
      await this.storage.setAlarm(now + body.windowMs);
    }

    return Response.json({
      success,
      remaining: Math.max(0, body.max - count - (success ? 1 : 0)),
      resetMs: body.windowMs,
    });
  }

  async alarm(): Promise<void> {
    // Prune stale rows so the table doesn't grow unbounded
    await this.storage.sql.exec(`DELETE FROM requests WHERE ts <= ?1`, Date.now() - 7 * 24 * 60 * 60 * 1000);
  }
}
