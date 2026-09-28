"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import type { Seller } from "@/lib/seller-types";
import { useLanguage } from "@/components/language-provider";
import { formatWeekday } from "@/lib/i18n";
import { DayCode } from "@/app/enums";

export function MarketSellersSection({ sellers }: { sellers: Seller[] }) {
  const { language } = useLanguage();

  if (sellers.length === 0) return null;

  const dayOrder: DayCode[] = [
    DayCode.Mon,
    DayCode.Tue,
    DayCode.Wed,
    DayCode.Thu,
    DayCode.Fri,
    DayCode.Sat,
    DayCode.Sun,
  ];

  // Group sellers by the day they attend this market
  const byDay = new Map<DayCode, Seller[]>();
  for (const seller of sellers) {
    const loc = (seller.locations ?? []).find((l) => l.days.length > 0);
    for (const day of loc?.days ?? []) {
      const list = byDay.get(day) ?? [];
      list.push(seller);
      byDay.set(day, list);
    }
  }
  const orderedDays = [...byDay.keys()].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  return (
    <div className="space-y-4">
      {orderedDays.map((day) => (
        <div key={day}>
          <h4 className="font-medium text-foreground mb-2">{formatWeekday(day, language)}</h4>
          <div className="flex flex-wrap gap-2">
            {(byDay.get(day) ?? []).map((seller) => (
              <Link key={`${day}-${seller.id}`} href={`/sellers/${seller.id}`}>
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                >
                  <Store className="h-3.5 w-3.5 mr-1" />
                  {seller.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketSellersCard({ sellers }: { sellers: Seller[] }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {t.sellersAtMarket}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sellers.length === 0 ? (
          <p className="text-muted-foreground">{t.noSellersAtMarket}</p>
        ) : (
          <MarketSellersSection sellers={sellers} />
        )}
      </CardContent>
    </Card>
  );
}
