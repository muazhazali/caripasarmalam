"use client";

import { useState } from "react";
import { MarketForm } from "@/components/admin/market-form";
import { updateMarket } from "@/app/admin/actions";
import type { MarketFormValues } from "@/lib/admin-schema";
import { toast } from "sonner";

interface EditMarketClientProps {
  id: string;
  defaultValues: MarketFormValues;
  states: string[];
}

export function EditMarketClient({ id, defaultValues, states }: EditMarketClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: MarketFormValues) {
    setIsSubmitting(true);
    const result = await updateMarket(id, data);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Market updated successfully");
  }

  return (
    <MarketForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      states={states}
      isSubmitting={isSubmitting}
      submitLabel="Save Changes"
    />
  );
}
