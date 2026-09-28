"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SellerForm } from "@/components/admin/seller-form";
import { updateSeller } from "../../actions";
import { sellerFormSchema, type SellerFormValues } from "@/lib/seller-schema";
import type { Seller } from "@/lib/seller-types";
import { sellerToFormValues } from "@/lib/suggestion-utils";
import { toast } from "sonner";

interface EditSellerClientProps {
  id: string;
  seller: Seller;
  markets: { id: string; name: string; district: string; state: string }[];
}

export function EditSellerClient({ id, seller, markets }: EditSellerClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: sellerToFormValues(seller),
  });

  async function handleSubmit(data: SellerFormValues) {
    setIsSubmitting(true);
    const result = await updateSeller(id, data);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Seller updated successfully");
    router.push("/admin/sellers");
  }

  return (
    <SellerForm
      form={form}
      onSubmit={handleSubmit}
      markets={markets}
      isSubmitting={isSubmitting}
      submitLabel="Save Changes"
    />
  );
}
