import { z } from "zod";
import { DayCode } from "@/app/enums";

export const marketFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  status: z.enum(["Active", "Inactive", "Suspended", "Closed"]),
  description: z.string().optional(),
  area_m2: z.coerce.number().min(0).optional(),
  total_shop: z.coerce.number().int().min(0).optional(),
  shop_list: z.string().optional(),
  location: z
    .object({
      latitude: z.coerce.number(),
      longitude: z.coerce.number(),
      gmaps_link: z.string().optional().or(z.literal("")),
    })
    .optional(),
  schedule: z.array(
    z.object({
      days: z.array(z.nativeEnum(DayCode)).min(1, "Select at least one day"),
      times: z
        .array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
            end: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
            note: z.string().optional(),
          }),
        )
        .min(1, "Add at least one time slot"),
    }),
  ),
  amenities: z.object({
    toilet: z.boolean(),
    prayer_room: z.boolean(),
  }),
  parking: z.object({
    available: z.boolean(),
    accessible: z.boolean(),
    notes: z.string(),
  }),
});

export type MarketFormValues = z.infer<typeof marketFormSchema>;
