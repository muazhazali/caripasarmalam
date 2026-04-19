import { getMarkets, getAllStates, getMarketById } from "@/lib/db";
import { SuggestClient } from "./suggest-client";
import type { Market } from "@/lib/markets-data";

export const metadata = {
  title: "Suggest a Market",
};

interface PageProps {
  searchParams: Promise<{ marketId?: string }>;
}

export default async function SuggestPage({ searchParams }: PageProps) {
  const { marketId } = await searchParams;

  const [markets, states, preselectedMarket] = await Promise.all([
    getMarkets(),
    getAllStates(),
    marketId ? getMarketById(marketId) : Promise.resolve(null),
  ]);

  return (
    <SuggestClient
      markets={markets as Market[]}
      states={states}
      preselectedMarket={preselectedMarket as Market | null}
    />
  );
}
