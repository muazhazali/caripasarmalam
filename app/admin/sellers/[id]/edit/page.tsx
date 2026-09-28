export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSellerById } from "@/lib/sellers-db";
import { getMarkets } from "@/lib/db";
import { EditSellerClient } from "./edit-seller-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSellerPage({ params }: PageProps) {
  const { id } = await params;
  const [seller, markets] = await Promise.all([getSellerById(id), getMarkets({ limit: 1000 })]);

  if (!seller) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Seller</h1>
      <EditSellerClient
        id={id}
        seller={seller}
        markets={markets.map((m) => ({ id: m.id, name: m.name, district: m.district, state: m.state }))}
      />
    </div>
  );
}
