"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import type { Seller } from "@/lib/seller-types";
import { deleteSeller, updateSellerStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const STATUS_VARIANTS: Record<string, "default" | "secondary"> = {
  Active: "default",
  Inactive: "secondary",
};

const STATUSES = ["Active", "Inactive"];

interface SellersAdminClientProps {
  sellers: Seller[];
  count: number;
  page: number;
  pageSize: number;
}

export function SellersAdminClient({ sellers, count, page, pageSize }: SellersAdminClientProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const totalPages = Math.ceil(count / pageSize);

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteSeller(deleteId);
      setDeleteId(null);
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateSellerStatus(id, status);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {count} seller{count !== 1 ? "s" : ""} total
        </p>
        <Button asChild size="sm">
          <Link href="/admin/sellers/new">New Seller</Link>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Locations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No sellers found.
                </TableCell>
              </TableRow>
            )}
            {sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell className="font-medium max-w-xs truncate">{seller.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{seller.category ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                  {(seller.locations ?? []).length}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        <Badge variant={STATUS_VARIANTS[seller.status] ?? "secondary"}>
                          {seller.status}
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {STATUSES.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => handleStatusChange(seller.id, s)}
                          className={seller.status === s ? "font-semibold" : ""}
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
                      <Link href={`/admin/sellers/${seller.id}/edit`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(seller.id)}
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
                href={page > 1 ? `/admin/sellers?page=${page - 1}` : undefined}
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
                href={page < totalPages ? `/admin/sellers?page=${page + 1}` : undefined}
                aria-disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Seller</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The seller, their items, and their locations will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
