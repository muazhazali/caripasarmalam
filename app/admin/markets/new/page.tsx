import { getAllStates } from "@/lib/db";
import { NewMarketClient } from "./new-market-client";

export default async function NewMarketPage() {
  const states = await getAllStates();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Market</h1>
      <NewMarketClient states={states} />
    </div>
  );
}
