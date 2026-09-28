"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import type { Seller } from "@/lib/seller-types";
import { useLanguage } from "@/components/language-provider";
import { fetchSellersApi } from "@/lib/sellers-api-client";
import { SellerCard } from "@/components/seller-card";

const malaysianStates = [
  "Semua Negeri",
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Pulau Pinang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
];

const ALL_STATES = "Semua Negeri";
const ALL_CATEGORIES = "__all__";

interface SellersFilterClientProps {
  initialSellers: Seller[];
  categories: string[];
  initialState?: string;
}

export function SellersFilterClient({ initialSellers, categories, initialState }: SellersFilterClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sellers, setSellers] = useState<Seller[]>(initialSellers);
  const [isLoading, setIsLoading] = useState(false);

  const qFromUrl = (searchParams.get("q") as string) || "";
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const stateFromUrl = searchParams.get("state");
  const defaultState = stateFromUrl || initialState || ALL_STATES;
  const [selectedState, setSelectedState] = useState(defaultState);
  const categoryFromUrl = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || ALL_CATEGORIES);

  // Fetch sellers using the public API when filters change
  const fetchSellers = useCallback(async (state?: string, category?: string, q?: string) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { status: "Active", limit: 150 };
      if (state && state !== ALL_STATES) params.state = state;
      if (category && category !== ALL_CATEGORIES) params.category = category;
      if (q && q.trim()) params.q = q.trim();

      const data = await fetchSellersApi(params);
      setSellers(data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search: refetch from API when the query changes
  useEffect(() => {
    if (searchQuery === qFromUrl) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      else params.delete("q");
      router.replace(`/sellers?${params.toString()}`);
      fetchSellers(selectedState, selectedCategory, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const setFilterParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === ALL_STATES || value === ALL_CATEGORIES) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`/sellers?${params.toString()}`);

      if (key === "state") setSelectedState(value || ALL_STATES);
      if (key === "category") setSelectedCategory(value || ALL_CATEGORIES);

      fetchSellers(
        key === "state" ? value || undefined : selectedState,
        key === "category" ? value || undefined : selectedCategory,
        searchQuery,
      );
    },
    [searchParams, router, selectedState, selectedCategory, searchQuery, fetchSellers],
  );

  // Client-side refinement of results (search box also matches client data)
  const filteredSellers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sellers.filter((seller) => {
      if (selectedState !== ALL_STATES) {
        const inState = (seller.locations ?? []).some((l) => l.market_state === selectedState);
        if (!inState) return false;
      }
      if (selectedCategory !== ALL_CATEGORIES && seller.category !== selectedCategory) return false;
      if (query) {
        const haystack = [seller.name, seller.category ?? "", ...(seller.items ?? []).map((i) => i.name)]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [sellers, searchQuery, selectedState, selectedCategory]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedState(ALL_STATES);
    setSelectedCategory(ALL_CATEGORIES);
    router.replace("/sellers");
    fetchSellers(undefined, undefined, "");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder={t.sellersSearchPlaceholder}
                  className="pl-10 h-11 md:h-12 text-base md:text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedState} onValueChange={(value) => setFilterParam("state", value)}>
                <SelectTrigger className="w-44 h-11 md:h-12!">
                  <SelectValue placeholder={t.stateLabel} />
                </SelectTrigger>
                <SelectContent>
                  {malaysianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state === ALL_STATES ? t.allStates : state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={(value) => setFilterParam("category", value)}>
                <SelectTrigger className="w-44 h-11 md:h-12!">
                  <SelectValue placeholder={t.sellerCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES}>{t.allCategories}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">{t.sellerDirectoryTitle}</h1>
            <p className="text-muted-foreground">
              {t.showingResults} {filteredSellers.length} {t.sellers}
            </p>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">{t.searching}</p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">{t.noSellersFound}</p>
            <p className="text-muted-foreground mb-4">{t.tryAdjustingSellerFilters}</p>
            <Button onClick={clearAllFilters}>{t.clearAllFilters}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
