export const dynamic = "force-dynamic";

import { getAdminSellers } from "@/lib/sellers-db";
import { SellersAdminClient } from "./sellers-admin-client";

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminSellersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const { sellers, count } = await getAdminSellers(page, PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sellers</h1>
      <SellersAdminClient sellers={sellers} count={count} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
