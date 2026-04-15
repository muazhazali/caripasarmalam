import { getMarkets, getAllStates } from "@/lib/db";
import { SuggestClient } from "./suggest-client";
import type { Market } from "@/lib/markets-data";

export const metadata = {
  title: "Suggest a Market",
};

export default async function SuggestPage() {
  const [markets, states] = await Promise.all([
    getMarkets(),
    getAllStates(),
  ]);

  return <SuggestClient markets={markets as Market[]} states={states} />;
}
