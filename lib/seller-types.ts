import { DayCode } from "@/app/enums";
import type { SellerFormValues } from "./seller-schema";

export type { SellerFormValues };

export type SellerStatus = "Active" | "Inactive";

export interface SellerSocialLink {
  platform: string;
  url: string;
}

export interface SellerItem {
  id: string;
  name: string;
  price: number | null;
  note?: string;
  sort_order: number;
}

export interface SellerLocation {
  id: string;
  market_id: string;
  // Denormalized for display convenience when listing sellers
  market_name?: string;
  market_district?: string;
  market_state?: string;
  days: DayCode[];
  stall?: string;
  notes?: string;
}

export interface Seller {
  id: string;
  name: string;
  category?: string;
  description?: string;
  phone?: string;
  social: SellerSocialLink[];
  status: SellerStatus;
  // Present in list/detail queries, absent from raw admin rows
  items?: SellerItem[];
  locations?: SellerLocation[];
  created_at: string;
  updated_at: string;
}

export interface SellerSuggestion {
  id: string;
  type: "new" | "update";
  target_id: string | null;
  data: SellerFormValues;
  submitter_email: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
}
