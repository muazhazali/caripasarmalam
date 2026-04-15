"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, PlusCircle, LogOut, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/app/admin/actions";

interface AdminSidebarProps {
  pendingCount?: number;
}

export function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b">
        <Link href="/admin/markets" className="font-semibold text-sm">
          Admin Panel
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-2 flex-1">
        <Link
          href="/admin/markets"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent ${
            pathname === "/admin/markets" ? "bg-accent font-medium" : "text-muted-foreground"
          }`}
        >
          <LayoutList className="w-4 h-4" />
          Markets
        </Link>
        <Link
          href="/admin/markets/new"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent ${
            pathname === "/admin/markets/new" ? "bg-accent font-medium" : "text-muted-foreground"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          New Market
        </Link>
        <Link
          href="/admin/suggestions"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent ${
            pathname.startsWith("/admin/suggestions") ? "bg-accent font-medium" : "text-muted-foreground"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Suggestions
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
              {pendingCount}
            </Badge>
          )}
        </Link>
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
