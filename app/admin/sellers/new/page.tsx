export const dynamic = "force-dynamic";

import { getMarkets } from "@/lib/db";
import { NewSellerClient } from "./new-seller-client";

export default async function NewSellerPage() {
  const markets = await getMarkets({ limit: 1000 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Seller</h1>
      <NewSellerClient
        markets={markets.map((m) => ({ id: m.id, name: m.name, district: m.district, state: m.state }))}
      />
    </div>
  );
}
