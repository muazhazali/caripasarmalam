"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Map as MapIcon, Github, Info, PlusCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import LanguageSwitcher from "@/components/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 transition-colors ${
        isActive
          ? "border-primary/30 bg-primary/10 text-primary dark:border-primary/50 dark:bg-primary/15"
          : "border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function DesktopNavbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const items: {
    href: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }[] = [
    { href: "/", label: t.home, icon: Home },
    { href: "/markets", label: t.markets, icon: ShoppingBag },
    { href: "/map", label: t.mapView, icon: MapIcon },
    { href: "/suggest", label: t.suggestMarket, icon: PlusCircle },
    { href: "/about", label: t.about, icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block dark:bg-background/90 dark:supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="text-lg font-semibold text-foreground transition-colors hover:text-primary">
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
            <ThemeToggle />
            <Link
              href="https://github.com/muazhazali/caripasarmalam"
              target="_blank"
              rel="noopener noreferrer"
              className="items-center rounded-md border border-transparent px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              aria-label="GitHub Repository"
            >
              <Github className="h-4 w-4" />
              {/* <span className="text-sm font-medium hidden lg:inline">GitHub</span> */}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
