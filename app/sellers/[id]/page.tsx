import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSellerById } from "@/lib/sellers-db";
import SellerDetailClient from "@/components/seller-detail-client";

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getSellerById(id);

  if (!seller) {
    return {
      title: "Seller Not Found",
      description: "The requested seller could not be found.",
    };
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app";
  const url = `${base}/sellers/${seller.id}`;
  const title = `${seller.name} | Penjual Pasar Malam${seller.category ? ` ${seller.category}` : ""}`;
  const itemsText = (seller.items ?? [])
    .slice(0, 8)
    .map((i) => i.name)
    .join(", ");
  const description =
    seller.description ||
    (itemsText
      ? `${seller.name} menjual ${itemsText} di pasar malam sekitar Malaysia.`
      : `Maklumat penjual ${seller.name} dan lokasi jualan di pasar malam Malaysia.`);

  return {
    title,
    description,
    keywords: ["penjual pasar malam", "sellers pasar malam", seller.name, seller.category ?? "", itemsText]
      .filter(Boolean)
      .join(", "),
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      locale: "ms_MY",
      url,
      siteName: "Cari Pasar Malam Malaysia",
      title,
      description,
    },
  };
}

export default async function SellerPage({ params }: SellerPageProps) {
  const { id } = await params;
  const seller = await getSellerById(id);

  if (!seller) notFound();

  return <SellerDetailClient seller={seller} />;
}
