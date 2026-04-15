"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import type { Market } from "@/lib/markets-data";
import { deleteMarket, updateMarketStatus } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "default",
  Inactive: "secondary",
  Suspended: "outline",
  Closed: "destructive",
};

const STATUSES = ["Active", "Inactive", "Suspended", "Closed"];

interface MarketsAdminClientProps {
  markets: Market[];
  count: number;
  page: number;
  pageSize: number;
}

export function MarketsAdminClient({ markets, count, page, pageSize }: MarketsAdminClientProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const totalPages = Math.ceil(count / pageSize);

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteMarket(deleteId);
      setDeleteId(null);
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateMarketStatus(id, status);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {count} market{count !== 1 ? "s" : ""} total
        </p>
        <Button asChild size="sm">
          <Link href="/admin/markets/new">New Market</Link>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>State / District</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No markets found.
                </TableCell>
              </TableRow>
            )}
            {markets.map((market) => (
              <TableRow key={market.id}>
                <TableCell className="font-medium max-w-xs truncate">{market.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {market.state} / {market.district}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        <Badge variant={STATUS_VARIANTS[market.status] ?? "secondary"}>
                          {market.status}
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {STATUSES.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => handleStatusChange(market.id, s)}
                          className={market.status === s ? "font-semibold" : ""}
                        >
                          {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/markets/${market.id}/edit`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(market.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={page > 1 ? `/admin/markets?page=${page - 1}` : undefined}
                aria-disabled={page <= 1}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={page < totalPages ? `/admin/markets?page=${page + 1}` : undefined}
                aria-disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Market</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The market will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
