"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, MapPin, CalendarDays } from "lucide-react";
import type { Seller } from "@/lib/seller-types";
import { useLanguage } from "@/components/language-provider";
import { formatWeekday } from "@/lib/i18n";

export function SellerCard({ seller }: { seller: Seller }) {
  const { t, language } = useLanguage();
  const items = (seller.items ?? []).slice(0, 5);
  const locations = seller.locations ?? [];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          {seller.category ? (
            <Badge variant="secondary" className="bg-amber-400 dark:bg-gray-600/30">
              {seller.category}
            </Badge>
          ) : (
            <span />
          )}
        </div>
        <CardTitle className="text-lg flex items-center gap-2">
          <Store className="h-4 w-4 text-primary shrink-0" />
          {seller.name}
        </CardTitle>
        {locations.length > 0 && (
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {locations
              .map((l) => l.market_name || l.market_district)
              .filter(Boolean)
              .slice(0, 3)
              .join(", ")}
            {locations.length > 3 ? ` +${locations.length - 3}` : ""}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <p className="text-xs font-medium text-muted-foreground mb-2">{t.sellerItems}</p>
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {items.map((item) => (
              <Badge key={item.id} variant="outline" className="whitespace-normal break-words">
                {item.name}
                {item.price !== null && item.price !== undefined && (
                  <span className="text-muted-foreground ml-1">RM{item.price}</span>
                )}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">{t.sellerNoItems}</p>
        )}

        {locations.length > 0 && (
          <div className="space-y-1 mb-4">
            <p className="text-xs font-medium text-muted-foreground">{t.sellerAttendsMarkets}</p>
            {locations.slice(0, 3).map((loc) => (
              <div key={loc.id} className="flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <Link
                  href={`/markets/${loc.market_id}`}
                  className="hover:text-primary hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {loc.market_name}
                </Link>
                <span className="text-xs">· {loc.days.map((d) => formatWeekday(d, language)).join(", ")}</span>
              </div>
            ))}
            {locations.length > 3 && <p className="text-xs text-muted-foreground">+{locations.length - 3}</p>}
          </div>
        )}

        <div className="mt-auto" />
        <Button
          asChild
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/50 dark:bg-primary/15 dark:hover:bg-primary/25"
        >
          <Link href={`/sellers/${seller.id}`}>{t.viewSeller}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default SellerCard;
