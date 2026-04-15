"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarketForm } from "@/components/admin/market-form";
import { createMarket } from "@/app/admin/actions";
import type { MarketFormValues } from "@/lib/admin-schema";
import { toast } from "sonner";

interface NewMarketClientProps {
  states: string[];
}

export function NewMarketClient({ states }: NewMarketClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: MarketFormValues) {
    setIsSubmitting(true);
    const result = await createMarket(data);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Market created successfully");
    router.push("/admin/markets");
  }

  return (
    <MarketForm
      onSubmit={handleSubmit}
      states={states}
      isSubmitting={isSubmitting}
      submitLabel="Create Market"
    />
  );
}
