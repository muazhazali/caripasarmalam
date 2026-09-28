import { getMarkets, getAllStates, getMarketById } from "@/lib/db";
import { getSellers } from "@/lib/sellers-db";
import { SuggestClient } from "./suggest-client";
import { SuggestSellerClient } from "./suggest-seller-client";
import type { Market } from "@/lib/market-types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add or update a market or seller",
  robots: {
    index: false,
    follow: true,
  },
};

interface PageProps {
  searchParams: Promise<{ marketId?: string; sellerId?: string; type?: string }>;
}

export default async function SuggestPage({ searchParams }: PageProps) {
  const { marketId, sellerId, type } = await searchParams;
  const sellerMode = type === "seller";

  if (sellerMode) {
    const [sellers, markets] = await Promise.all([getSellers({ limit: 1000 }), getMarkets()]);
    const preselectedSeller = sellerId ? (sellers.find((s) => s.id === sellerId) ?? null) : null;
    const marketOptions = markets.map((m) => ({ id: m.id, name: m.name, district: m.district, state: m.state }));

    return <SuggestSellerClient sellers={sellers} markets={marketOptions} preselectedSeller={preselectedSeller} />;
  }

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
