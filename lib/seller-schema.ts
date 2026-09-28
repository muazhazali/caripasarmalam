import { z } from "zod";
import { DayCode } from "@/app/enums";

const DAY_CODES = Object.values(DayCode) as [string, ...string[]];

export const sellerFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  category: z.string().max(60).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  phone: z
    .string()
    .max(20)
    .optional()
    .default("")
    .refine((v) => v === "" || /^[+]?[\d\s()-]{6,20}$/.test(v), "Invalid phone number"),
  social: z
    .array(
      z.object({
        platform: z.string().min(1).max(40),
        url: z
          .string()
          .min(1)
          .max(300)
          .refine((v) => /^https?:\/\//i.test(v), "URL must start with http(s)://"),
      }),
    )
    .max(10)
    .optional()
    .default([]),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  items: z
    .array(
      z.object({
        name: z.string().min(1, "Item name is required").max(120),
        price: z.number().min(0).max(1000000).nullable().optional().default(null),
        note: z.string().max(120).optional().default(""),
      }),
    )
    .max(100)
    .optional()
    .default([]),
  locations: z
    .array(
      z.object({
        market_id: z.string().min(1, "Select a market"),
        days: z.array(z.string().refine((d) => DAY_CODES.includes(d), "Invalid day")).min(1, "Select at least one day"),
        stall: z.string().max(40).optional().default(""),
        notes: z.string().max(300).optional().default(""),
      }),
    )
    .max(50)
    .optional()
    .default([]),
});

export type SellerFormValues = z.input<typeof sellerFormSchema>;
export type SellerFormParsed = z.output<typeof sellerFormSchema>;
