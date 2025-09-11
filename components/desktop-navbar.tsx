"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Map as MapIcon } from "lucide-react"

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

  const items = [
    { href: "/", label: "Nearest", icon: Home },
    { href: "/markets", label: "Markets", icon: ShoppingBag },
    { href: "/map", label: "Map", icon: MapIcon },
  ]

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
            Cari Pasar Malam
          </Link>
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
        </div>
      </div>
    </header>
  )
}


