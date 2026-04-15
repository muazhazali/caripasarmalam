import { getSuggestions } from "@/lib/suggestions-db";
import { getMarketById } from "@/lib/db";
import { SuggestionsAdminClient } from "./suggestions-admin-client";
import type { SuggestionStatus } from "@/lib/suggestions-db";
import type { Market } from "@/lib/markets-data";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSuggestionsPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const status: SuggestionStatus = statusParam === "approved" || statusParam === "rejected" ? statusParam : "pending";

  const suggestions = await getSuggestions(status);

  // For update suggestions, fetch the current market data to show diffs
  const targetIds = suggestions.filter((s) => s.type === "update" && s.target_id).map((s) => s.target_id as string);

  const targetMarkets: Record<string, Market> = {};
  await Promise.all(
    targetIds.map(async (id) => {
      const market = await getMarketById(id);
      if (market) targetMarkets[id] = market;
    }),
  );

  return <SuggestionsAdminClient suggestions={suggestions} targetMarkets={targetMarkets} currentStatus={status} />;
}
