"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export function LoginClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const attempts = useRef(0);
  const lockedUntil = useRef<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (lockedUntil.current && Date.now() < lockedUntil.current) {
      const remaining = Math.ceil((lockedUntil.current - Date.now()) / 1000 / 60);
      setError(`Too many attempts. Try again in ${remaining} minute${remaining !== 1 ? "s" : ""}.`);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await loginAction(password);

    if (result.error) {
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        lockedUntil.current = Date.now() + LOCKOUT_MS;
        attempts.current = 0;
        setError("Too many failed attempts. Locked for 5 minutes.");
      } else {
        setError("Invalid credentials.");
      }
      setLoading(false);
      return;
    }

    router.push("/admin/markets");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
