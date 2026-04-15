import { getAdminMarkets } from "@/lib/db";
import { MarketsAdminClient } from "./markets-admin-client";

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminMarketsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const { markets, count } = await getAdminMarkets(page, PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Markets</h1>
      <MarketsAdminClient markets={markets} count={count} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
