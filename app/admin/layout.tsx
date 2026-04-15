import type React from "react";
import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { countPendingSuggestions } from "@/lib/suggestions-db";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingCount = await countPendingSuggestions();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar pendingCount={pendingCount} />
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
