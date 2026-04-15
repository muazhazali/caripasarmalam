"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { approveSuggestion, rejectSuggestion } from "./actions";
import type { MarketSuggestion, SuggestionStatus } from "@/lib/suggestions-db";
import type { Market } from "@/lib/markets-data";
import type { MarketFormValues } from "@/lib/admin-schema";

interface Props {
  suggestions: MarketSuggestion[];
  targetMarkets: Record<string, Market>;
  currentStatus: SuggestionStatus;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DiffTable({ current, proposed }: { current: Market | null; proposed: MarketFormValues }) {
  const fields: { label: string; currentVal: string; proposedVal: string }[] = [
    {
      label: "Name",
      currentVal: current?.name ?? "—",
      proposedVal: proposed.name,
    },
    {
      label: "Address",
      currentVal: current?.address ?? "—",
      proposedVal: proposed.address,
    },
    {
      label: "District",
      currentVal: current?.district ?? "—",
      proposedVal: proposed.district,
    },
    {
      label: "State",
      currentVal: current?.state ?? "—",
      proposedVal: proposed.state,
    },
    {
      label: "Status",
      currentVal: current?.status ?? "—",
      proposedVal: proposed.status,
    },
    {
      label: "Description",
      currentVal: current?.description ?? "—",
      proposedVal: proposed.description ?? "—",
    },
    {
      label: "Area (m²)",
      currentVal: current?.area_m2?.toString() ?? "—",
      proposedVal: proposed.area_m2?.toString() ?? "—",
    },
    {
      label: "Total Stalls",
      currentVal: current?.total_shop?.toString() ?? "—",
      proposedVal: proposed.total_shop?.toString() ?? "—",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-md border text-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-3 py-2 font-medium text-muted-foreground w-1/4">Field</th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground w-1/3">Current</th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground w-1/3">Proposed</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => {
            const changed = f.currentVal !== f.proposedVal;
            return (
              <tr key={f.label} className={changed ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                <td className="px-3 py-2 font-medium">{f.label}</td>
                <td className={`px-3 py-2 ${changed ? "line-through text-muted-foreground" : ""}`}>{f.currentVal}</td>
                <td className={`px-3 py-2 ${changed ? "font-medium text-green-700 dark:text-green-400" : ""}`}>
                  {f.proposedVal}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SuggestionDetail({
  suggestion,
  currentMarket,
}: {
  suggestion: MarketSuggestion;
  currentMarket: Market | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant={suggestion.type === "new" ? "default" : "secondary"}>
          {suggestion.type === "new" ? "New Market" : "Update"}
        </Badge>
        <span className="text-sm text-muted-foreground">{formatDate(suggestion.created_at)}</span>
      </div>

      {suggestion.submitter_email && (
        <p className="text-sm">
          <span className="font-medium">Submitted by: </span>
          {suggestion.submitter_email}
        </p>
      )}

      {suggestion.type === "update" && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Field Changes</h3>
          <DiffTable current={currentMarket} proposed={suggestion.data} />
        </div>
      )}

      {suggestion.type === "new" && (
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{suggestion.data.name}</span>
            <span className="text-muted-foreground">Address</span>
            <span>{suggestion.data.address}</span>
            <span className="text-muted-foreground">District</span>
            <span>{suggestion.data.district}</span>
            <span className="text-muted-foreground">State</span>
            <span>{suggestion.data.state}</span>
            <span className="text-muted-foreground">Status</span>
            <span>{suggestion.data.status}</span>
            {suggestion.data.description && (
              <>
                <span className="text-muted-foreground">Description</span>
                <span>{suggestion.data.description}</span>
              </>
            )}
          </div>
        </div>
      )}

      {suggestion.rejection_reason && (
        <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
          <span className="font-medium">Rejection reason: </span>
          {suggestion.rejection_reason}
        </div>
      )}
    </div>
  );
}

export function SuggestionsAdminClient({ suggestions, targetMarkets, currentStatus }: Props) {
  const router = useRouter();
  const [selectedSuggestion, setSelectedSuggestion] = useState<MarketSuggestion | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    router.push(`/admin/suggestions?status=${status}`);
  }

  function handleApprove(id: string) {
    startTransition(async () => {
      const result = await approveSuggestion(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Suggestion approved and market updated.");
        setSelectedSuggestion(null);
      }
    });
  }

  function handleReject(id: string) {
    startTransition(async () => {
      const result = await rejectSuggestion(id, rejectReason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Suggestion rejected.");
        setRejectReason("");
        setSelectedSuggestion(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suggestions</h1>
        <p className="text-muted-foreground text-sm mt-1">Review user-submitted market suggestions.</p>
      </div>

      <Tabs value={currentStatus} onValueChange={handleStatusChange}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {suggestions.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No {currentStatus} suggestions.</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Market Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Submitted By
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s, i) => (
                <tr key={s.id} className={`border-b last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <td className="px-4 py-3">
                    <Badge variant={s.type === "new" ? "default" : "secondary"} className="whitespace-nowrap">
                      {s.type === "new" ? "New" : "Update"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{s.data.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {s.submitter_email ?? "Anonymous"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setSelectedSuggestion(s)}>
                        View
                      </Button>

                      {currentStatus === "pending" && (
                        <>
                          <Button size="sm" disabled={isPending} onClick={() => handleApprove(s.id)}>
                            Approve
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={isPending}>
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Suggestion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Optionally provide a reason for rejecting this suggestion.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-2 py-2">
                                <Label htmlFor={`reason-${s.id}`}>Reason (optional)</Label>
                                <Textarea
                                  id={`reason-${s.id}`}
                                  placeholder="e.g. Duplicate entry, incorrect info..."
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRejectReason("")}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReject(s.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Reject
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={selectedSuggestion !== null} onOpenChange={(o) => !o && setSelectedSuggestion(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Suggestion Detail</SheetTitle>
          </SheetHeader>
          {selectedSuggestion && (
            <SuggestionDetail
              suggestion={selectedSuggestion}
              currentMarket={
                selectedSuggestion.target_id ? (targetMarkets[selectedSuggestion.target_id] ?? null) : null
              }
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
