"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, ShoppingBag, Map as MapIcon, Globe } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

function TabButton({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string
  label: string
  icon: any
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}

export default function MobileTabBar() {
  const pathname = usePathname()
  const [language, setLanguage] = useState(typeof window !== "undefined" ? localStorage.getItem("language") || "ms" : "ms")
  const t = useTranslation(language)

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "language" && e.newValue) setLanguage(e.newValue)
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const tabs = [
    { href: "/", label: t.home, icon: Home },
    { href: "/markets", label: t.markets, icon: ShoppingBag },
    { href: "/map", label: t.mapView, icon: MapIcon },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      role="navigation"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-4 items-center justify-between px-2 py-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.href}
              href={tab.href}
              label={tab.label}
              icon={tab.icon}
              isActive={pathname === tab.href}
            />
          ))}
          <button
            aria-label="Toggle language"
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => {
              const next = language === "ms" ? "en" : "ms"
              setLanguage(next)
              if (typeof window !== "undefined") localStorage.setItem("language", next)
            }}
          >
            <Globe className="h-5 w-5" />
            <span className="text-xs font-medium">{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}


