"use client";

import { useState, useTransition } from "react";
import { CheckCircle, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { MarketForm } from "@/components/admin/market-form";
import { marketToFormValues } from "@/lib/suggestion-utils";
import { submitSuggestion } from "./actions";
import type { Market } from "@/lib/markets-data";
import type { MarketFormValues } from "@/lib/admin-schema";
import { toast } from "sonner";

type SuggestType = "new" | "update" | null;

interface SuggestClientProps {
  markets: Market[];
  states: string[];
}

export function SuggestClient({ markets, states }: SuggestClientProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<SuggestType>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setType(null);
    setSelectedMarket(null);
    setEmail("");
    setSuccess(false);
  }

  async function handleSubmit(data: MarketFormValues) {
    startTransition(async () => {
      const result = await submitSuggestion(
        type === "update" ? "update" : "new",
        selectedMarket?.id ?? null,
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
      <div className="min-h-screen flex items-center justify-center p-4">
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
    <div className="max-w-2xl mx-auto px-4 py-10 pb-20 md:pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t.suggestPageTitle || "Suggest a Market"}</h1>
        <p className="text-muted-foreground text-sm">
          {t.suggestPageSubtitle ||
            "Help us keep the directory up to date by suggesting a new market or an update to an existing one."}
        </p>
      </div>

      {/* Step 1: Type selector */}
      {type === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setType("new")}
            className="text-left rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="text-lg font-semibold mb-1">{t.suggestTypeNew || "Suggest a New Market"}</div>
            <div className="text-sm text-muted-foreground">
              {t.suggestTypeNewDesc || "Know a pasar malam that isn't listed yet?"}
            </div>
          </button>
          <button
            onClick={() => setType("update")}
            className="text-left rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="text-lg font-semibold mb-1">{t.suggestTypeUpdate || "Update an Existing Market"}</div>
            <div className="text-sm text-muted-foreground">
              {t.suggestTypeUpdateDesc || "See outdated info? Help us fix it."}
            </div>
          </button>
        </div>
      )}

      {/* Step 2: Market picker (update only) */}
      {type === "update" && selectedMarket === null && (
        <div className="space-y-4">
          <button
            onClick={() => setType(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
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
                      {markets.map((m) => (
                        <CommandItem
                          key={m.id}
                          value={m.name}
                          onSelect={() => {
                            setSelectedMarket(m);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", selectedMarket?.id === m.id ? "opacity-100" : "opacity-0")}
                          />
                          <div>
                            <div className="font-medium text-sm">{m.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {m.district}, {m.state}
                            </div>
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
      {type !== null && (type === "new" || selectedMarket !== null) && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (type === "update") setSelectedMarket(null);
                else setType(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            {type === "update" && selectedMarket && (
              <span className="text-sm text-muted-foreground">
                — updating <span className="font-medium text-foreground">{selectedMarket.name}</span>
              </span>
            )}
          </div>

          {/* Honeypot — hidden from real users, bots fill this */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none", tabIndex: -1 } as React.CSSProperties}>
            <label htmlFor="website">Website</label>
            <input
              id="website"
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
            <Label htmlFor="suggest-email">{t.suggestYourEmail}</Label>
            <Input
              id="suggest-email"
              type="email"
              placeholder={t.suggestYourEmailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t.suggestYourEmailHint}</p>
          </div>

          <MarketForm
            defaultValues={type === "update" && selectedMarket ? marketToFormValues(selectedMarket) : undefined}
            onSubmit={handleSubmit}
            states={states}
            isSubmitting={isPending}
            submitLabel={t.suggestSubmit}
          />
        </div>
      )}
    </div>
  );
}
