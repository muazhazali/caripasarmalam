"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SellerForm, SELLER_DEFAULT_VALUES } from "@/components/admin/seller-form";
import { createSeller } from "../actions";
import { sellerFormSchema, type SellerFormValues } from "@/lib/seller-schema";
import { toast } from "sonner";

interface NewSellerClientProps {
  markets: { id: string; name: string; district: string; state: string }[];
}

export function NewSellerClient({ markets }: NewSellerClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: { ...SELLER_DEFAULT_VALUES, items: [], locations: [], social: [] },
  });

  async function handleSubmit(data: SellerFormValues) {
    setIsSubmitting(true);
    const result = await createSeller(data);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Seller created successfully");
    router.push("/admin/sellers");
  }

  return (
    <SellerForm
      form={form}
      onSubmit={handleSubmit}
      markets={markets}
      isSubmitting={isSubmitting}
      submitLabel="Create Seller"
    />
  );
}
