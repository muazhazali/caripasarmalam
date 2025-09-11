"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, ShoppingBag, Map as MapIcon } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import LanguageSwitcher from "@/components/language-switcher"

function NavLink({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: any; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

export default function DesktopNavbar() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  const items = [
    { href: "/", label: t.home, icon: Home },
    { href: "/markets", label: t.markets, icon: ShoppingBag },
    { href: "/map", label: t.mapView, icon: MapIcon },
  ]

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
            {t.appTitle}
          </Link>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1" aria-label="Primary">
              {items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </div>
    </header>
  )
}


