"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Store, Phone, MessageCircle, MapPin, CalendarDays, ExternalLink, Share2, Tag } from "lucide-react";
import Link from "next/link";
import type { Seller } from "@/lib/seller-types";
import { useLanguage } from "@/components/language-provider";
import { formatWeekday } from "@/lib/i18n";

function formatPhoneLink(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (phone.startsWith("+")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+6${digits}`;
  return `tel:+${digits}`;
}

function formatWhatsappLink(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (phone.startsWith("+")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/6${digits}`;
  return `https://wa.me/${digits}`;
}

export default function SellerDetailClient({ seller }: { seller: Seller }) {
  const { t, language } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: seller.name,
    description: seller.description,
    ...(seller.category ? { jobTitle: seller.category } : {}),
    ...(seller.phone ? { telephone: seller.phone } : {}),
    ...(seller.social.length > 0 ? { sameAs: seller.social.map((s) => s.url) } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-2 min-w-0">
              <Link href="/sellers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.backToSellers}
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <nav className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1">
                  <Link href="/" className="hover:text-foreground shrink-0">
                    {t.home}
                  </Link>
                  <span>/</span>
                  <Link href="/sellers" className="hover:text-foreground shrink-0">
                    {t.sellers}
                  </Link>
                  <span>/</span>
                  <span className="text-foreground truncate min-w-0">{seller.name}</span>
                </nav>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  {seller.category && (
                    <Badge variant="secondary" className="bg-amber-400 dark:bg-gray-600/30">
                      <Tag className="h-3 w-3 mr-1" />
                      {seller.category}
                    </Badge>
                  )}
                  <Badge variant={seller.status === "Active" ? "default" : "outline"}>{seller.status}</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <Store className="h-8 w-8 text-primary shrink-0" />
                  {seller.name}
                </h1>
                {seller.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed">{seller.description}</p>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t.sellerItems}</CardTitle>
                </CardHeader>
                <CardContent>
                  {(seller.items ?? []).length > 0 ? (
                    <div className="space-y-2">
                      {(seller.items ?? []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 border-b last:border-0 pb-2 last:pb-0"
                        >
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.note && <span className="text-sm text-muted-foreground ml-2">({item.note})</span>}
                          </div>
                          <span className="text-sm font-semibold whitespace-nowrap">
                            {item.price !== null && item.price !== undefined ? `RM ${item.price}` : t.sellerAskPrice}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t.sellerNoItems}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {t.sellerAttendsMarkets}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(seller.locations ?? []).length > 0 ? (
                    <div className="space-y-3">
                      {(seller.locations ?? []).map((loc) => (
                        <div key={loc.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Link
                              href={`/markets/${loc.market_id}`}
                              className="font-medium hover:text-primary hover:underline truncate"
                            >
                              {loc.market_name || loc.market_id}
                            </Link>
                            <span className="text-sm text-muted-foreground">
                              · {loc.market_district}, {loc.market_state}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {loc.stall && (
                              <Badge variant="outline" className="text-xs">
                                {t.sellerStall} {loc.stall}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {loc.days.map((d) => formatWeekday(d, language)).join(", ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t.locationNotAvailable}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.sellerContact}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {seller.phone ? (
                    <>
                      <Button asChild className="w-full">
                        <a href={formatPhoneLink(seller.phone)}>
                          <Phone className="h-4 w-4 mr-2" />
                          {t.sellerCallNow} · {seller.phone}
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <a href={formatWhatsappLink(seller.phone)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {t.sellerWhatsapp}
                        </a>
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.notAvailable}</p>
                  )}

                  {seller.social.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">{t.sellerSocial}</p>
                      {seller.social.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {s.platform}
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.actions}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent cursor-pointer hover:text-white dark:hover:bg-gray-800"
                    onClick={async () => {
                      const url = window.location.href;
                      if (navigator.share) await navigator.share({ title: seller.name, url });
                      else await navigator.clipboard.writeText(url);
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t.shareMarket}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
