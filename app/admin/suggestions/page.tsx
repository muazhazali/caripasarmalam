export const dynamic = "force-dynamic";

import { getSuggestions } from "@/lib/suggestions-db";
import { getSellerSuggestions } from "@/lib/seller-suggestions-db";
import { getMarketById } from "@/lib/db";
import { getSellerById } from "@/lib/sellers-db";
import { SuggestionsAdminClient } from "./suggestions-admin-client";
import type { SuggestionStatus } from "@/lib/suggestions-db";
import type { SellerSuggestionStatus } from "@/lib/seller-suggestions-db";
import type { Market } from "@/lib/market-types";
import type { Seller } from "@/lib/seller-types";

interface PageProps {
  searchParams: Promise<{ status?: string; type?: string }>;
}

export default async function AdminSuggestionsPage({ searchParams }: PageProps) {
  const { status: statusParam, type: typeParam } = await searchParams;
  const type = typeParam === "sellers" ? "sellers" : "markets";
  const status: SuggestionStatus | SellerSuggestionStatus =
    statusParam === "approved" || statusParam === "rejected" ? statusParam : "pending";

  if (type === "sellers") {
    const suggestions = await getSellerSuggestions(status as SellerSuggestionStatus);

    const targetIds = suggestions.filter((s) => s.type === "update" && s.target_id).map((s) => s.target_id as string);
    const targetSellers: Record<string, Seller> = {};
    await Promise.all(
      targetIds.map(async (id) => {
        const seller = await getSellerById(id);
        if (seller) targetSellers[id] = seller;
      }),
    );

    return (
      <SuggestionsAdminClient
        type="sellers"
        currentStatus={status as SellerSuggestionStatus}
        sellerSuggestions={suggestions}
        targetSellers={targetSellers}
      />
    );
  }

  const suggestions = await getSuggestions(status as SuggestionStatus);

  // For update suggestions, fetch the current market data to show diffs
  const targetIds = suggestions.filter((s) => s.type === "update" && s.target_id).map((s) => s.target_id as string);

  const targetMarkets: Record<string, Market> = {};
  await Promise.all(
    targetIds.map(async (id) => {
      const market = await getMarketById(id);
      if (market) targetMarkets[id] = market;
    }),
  );

  return (
    <SuggestionsAdminClient
      type="markets"
      currentStatus={status as SuggestionStatus}
      suggestions={suggestions}
      targetMarkets={targetMarkets}
    />
  );
}
