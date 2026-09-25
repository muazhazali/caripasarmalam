"use server";

import { login } from "@/lib/auth";

export async function loginAction(password: string): Promise<{ error?: string }> {
  if (!password || password.length > 256) return { error: "Invalid credentials." };
  return login(password);
}