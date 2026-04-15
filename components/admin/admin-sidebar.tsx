"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, PlusCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/admin/actions";

const navItems = [
  { href: "/admin/markets", label: "Markets", icon: LayoutList },
  { href: "/admin/markets/new", label: "New Market", icon: PlusCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b">
        <Link href="/admin/markets" className="font-semibold text-sm">
          Admin Panel
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent ${
              pathname === href ? "bg-accent font-medium" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t">
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" type="submit">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}
