import type { Metadata } from "next";
import { getSellers, getSellerCategories } from "@/lib/sellers-db";
import { SellersFilterClient } from "@/components/sellers-filter-client";

interface SellersPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: SellersPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const hasIndexableFilters = Boolean(
    resolvedSearchParams?.q || resolvedSearchParams?.category || resolvedSearchParams?.state,
  );

  return {
    title: "Direktori Penjual Pasar Malam Malaysia | Cari Makanan & Penjual",
    description:
      "Cari penjual pasar malam seluruh Malaysia, item dan harga jualan, serta lokasi pasar yang mereka hadiri setiap minggu.",
    alternates: {
      canonical: "/sellers",
    },
    robots: hasIndexableFilters ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function SellersPage({ searchParams }: SellersPageProps) {
  const resolvedSearchParams = await searchParams;
  const state = resolvedSearchParams?.state as string | undefined;

  const [sellers, categories] = await Promise.all([
    getSellers({ state: state && state !== "All States" && state !== "Semua Negeri" ? state : undefined, limit: 150 }),
    getSellerCategories(),
  ]);

  return <SellersFilterClient initialSellers={sellers} categories={categories} initialState={state} />;
}
