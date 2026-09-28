"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/components/language-provider";
import { SellerForm, SELLER_DEFAULT_VALUES, type SellerFormLabels } from "@/components/admin/seller-form";
import { sellerToFormValues } from "@/lib/suggestion-utils";
import { submitSellerSuggestion } from "./seller-actions";
import type { Seller } from "@/lib/seller-types";
import { sellerFormSchema, type SellerFormValues } from "@/lib/seller-schema";
import { toast } from "sonner";

type SuggestType = "new" | "update" | null;

interface SuggestSellerClientProps {
  sellers: Seller[];
  markets: { id: string; name: string; district: string; state: string }[];
  preselectedSeller?: Seller | null;
}

export function SuggestSellerClient({ sellers, markets, preselectedSeller }: SuggestSellerClientProps) {
  const { t } = useLanguage();

  const formLabels: SellerFormLabels = {
    sectionBasicInfo: t.formSectionBasicInfo,
    sectionItems: t.formSectionSellerItems,
    sectionLocations: t.formSectionSellerLocations,
    sectionContact: t.formSectionSellerContact,
    fieldName: t.formFieldSellerName,
    fieldCategory: t.formFieldSellerCategory,
    fieldCategoryPlaceholder: t.formFieldSellerCategoryPlaceholder,
    fieldPhone: t.formFieldSellerPhone,
    fieldDescription: t.formFieldDescription,
    fieldItemName: t.formFieldItemName,
    fieldItemPrice: t.formFieldItemPrice,
    fieldItemNote: t.formFieldItemNote,
    fieldSelectMarket: t.formFieldSelectMarket,
    fieldStall: t.formFieldStall,
    fieldLocationNotes: t.formFieldLocationNotes,
    fieldSocialPlatform: t.formFieldSocialPlatform,
    fieldSocialUrl: t.formFieldSocialUrl,
    addItem: t.formAddItem,
    addLocation: t.formAddLocation,
    addSocial: t.formAddSocial,
    saving: t.formSaving,
  };

  const [type, setType] = useState<SuggestType>(preselectedSeller ? "update" : null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(preselectedSeller ?? null);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      ...SELLER_DEFAULT_VALUES,
      ...(type === "update" && selectedSeller ? sellerToFormValues(selectedSeller) : {}),
      items: [],
      locations: [],
      social: [],
    },
  });

  function reset() {
    setType(null);
    setSelectedSeller(null);
    setEmail("");
    setSuccess(false);
    form.reset({ ...SELLER_DEFAULT_VALUES, items: [], locations: [], social: [] });
  }

  function pickSeller(seller: Seller) {
    setSelectedSeller(seller);
    setType("update");
    form.reset(sellerToFormValues(seller));
  }

  async function handleSubmit(data: SellerFormValues) {
    startTransition(async () => {
      const result = await submitSellerSuggestion(
        type === "update" ? "update" : "new",
        selectedSeller?.id ?? null,
        data,
        email || undefined,
        honeypot,
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h2 className="text-xl font-semibold">{t.suggestSuccessTitle}</h2>
            <p className="text-muted-foreground text-sm">{t.suggestSuccessBody}</p>
            <Button onClick={reset} variant="outline" className="mt-2">
              {t.suggestAnother}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/suggest">{t.suggestMarket}</Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/suggest?type=seller">{t.suggestSeller}</Link>
        </Button>
      </div>

      {/* Step 1: Type selector */}
      {type === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setType("new")}
            className="text-left rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="text-lg font-semibold mb-1">{t.suggestSeller}</div>
            <div className="text-sm text-muted-foreground">{t.sellerDirectorySubtitle}</div>
          </button>
          <button
            onClick={() => setType("update")}
            className="text-left rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="text-lg font-semibold mb-1">{t.suggestTypeUpdate}</div>
            <div className="text-sm text-muted-foreground">{t.suggestTypeUpdateDesc}</div>
          </button>
        </div>
      )}

      {/* Step 2: Seller picker (update only) */}
      {type === "update" && selectedSeller === null && (
        <div className="space-y-4">
          <button
            onClick={() => setType(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {t.backToDirectory}
          </button>
          <div className="space-y-2">
            <Label>{t.suggestSelectMarket}</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                  {t.suggestSelectMarketPlaceholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder={t.suggestSearchMarket} />
                  <CommandList>
                    <CommandEmpty>{t.suggestNoMarketFound}</CommandEmpty>
                    <CommandGroup>
                      {sellers.map((s) => (
                        <CommandItem
                          key={s.id}
                          value={s.name}
                          onSelect={() => {
                            pickSeller(s);
                            setOpen(false);
                          }}
                        >
                          <Check className="mr-2 h-4 w-4 opacity-0" />
                          <div>
                            <div className="font-medium text-sm">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.category}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Step 3: The form */}
      {type !== null && (type === "new" || selectedSeller !== null) && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (type === "update") setSelectedSeller(null);
                else setType(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {t.backToDirectory}
            </button>
            {type === "update" && selectedSeller && (
              <span className="text-sm text-muted-foreground">
                — updating <span className="font-medium text-foreground">{selectedSeller.name}</span>
              </span>
            )}
          </div>

          {/* Honeypot — hidden from real users, bots fill this */}
          <div
            aria-hidden="true"
            style={
              {
                position: "absolute",
                left: "-9999px",
                opacity: 0,
                pointerEvents: "none",
                tabIndex: -1,
              } as React.CSSProperties
            }
          >
            <label htmlFor="seller-website">Website</label>
            <input
              id="seller-website"
              name="website"
              type="text"
              autoComplete="off"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <Label htmlFor="suggest-seller-email">{t.suggestYourEmail}</Label>
            <Input
              id="suggest-seller-email"
              type="email"
              placeholder={t.suggestYourEmailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t.suggestYourEmailHint}</p>
          </div>

          <SellerForm
            form={form}
            onSubmit={handleSubmit}
            markets={markets}
            isSubmitting={isPending}
            submitLabel={t.suggestSubmit}
            labels={formLabels}
          />
        </div>
      )}
    </div>
  );
}
