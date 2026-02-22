"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Map as MapIcon, MoreHorizontal, Info, Users, Github, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { GB, MY } from "country-flag-icons/react/3x2";

function TabButton({
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
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const tabs = [
    { href: "/", label: t.home, icon: Home },
    { href: "/markets", label: t.markets, icon: ShoppingBag },
    { href: "/map", label: t.mapView, icon: MapIcon },
  ];

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
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="More options"
                className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-xs font-medium">{t.more}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-4xl py-4 px-6">
              <SheetHeader className="p-[1rem_0]">
                <SheetTitle>{t.more}</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/about"
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-4 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Info className="h-4 w-4" />
                  <span>{t.about}</span>
                </Link>
                <Link
                  href="/contributors"
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-4 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>{t.contributors}</span>
                </Link>
                <a
                  href="https://github.com/muazhazali/caripasarmalam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-4 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>{t.github}</span>
                </a>
                <button
                  aria-label="Toggle language"
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-4 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    const next = language === "ms" ? "en" : "ms";
                    setLanguage(next);
                  }}
                >
                  {language === "ms" ? <MY className="h-4 w-4" /> : <GB className="h-4 w-4" />}
                  <span>
                    {t.languageLabel}: {language.toUpperCase()}
                  </span>
                </button>
                <button
                  aria-label="Toggle theme"
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-4 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>{theme === "light" ? t.darkMode : t.lightMode}</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
