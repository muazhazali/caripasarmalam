"use client";

import { useFieldArray } from "react-hook-form";
import type { SellerFormValues } from "@/lib/seller-schema";
import { DayCode } from "@/app/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Store, Tag, Info, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SellerFormLabels {
  sectionBasicInfo?: string;
  sectionItems?: string;
  sectionLocations?: string;
  sectionContact?: string;
  fieldName?: string;
  fieldCategory?: string;
  fieldCategoryPlaceholder?: string;
  fieldPhone?: string;
  fieldDescription?: string;
  fieldItemName?: string;
  fieldItemPrice?: string;
  fieldItemNote?: string;
  fieldSelectMarket?: string;
  fieldStall?: string;
  fieldLocationNotes?: string;
  fieldSocialPlatform?: string;
  fieldSocialUrl?: string;
  addItem?: string;
  addLocation?: string;
  addSocial?: string;
  saving?: string;
}

const DEFAULT_LABELS: Required<SellerFormLabels> = {
  sectionBasicInfo: "Basic Info",
  sectionItems: "Items & Prices",
  sectionLocations: "Selling Locations",
  sectionContact: "Contact & Social",
  fieldName: "Seller Name *",
  fieldCategory: "Category",
  fieldCategoryPlaceholder: "e.g. Food, Drinks, Kuih",
  fieldPhone: "Phone Number",
  fieldDescription: "Description",
  fieldItemName: "Item Name",
  fieldItemPrice: "Price (RM)",
  fieldItemNote: "Note (optional)",
  fieldSelectMarket: "Select market",
  fieldStall: "Stall No.",
  fieldLocationNotes: "Notes (optional)",
  fieldSocialPlatform: "Platform",
  fieldSocialUrl: "URL",
  addItem: "Add Item",
  addLocation: "Add Location",
  addSocial: "Add Social Link",
  saving: "Saving...",
};

const DAY_OPTIONS = [
  { value: DayCode.Mon, label: "Mon" },
  { value: DayCode.Tue, label: "Tue" },
  { value: DayCode.Wed, label: "Wed" },
  { value: DayCode.Thu, label: "Thu" },
  { value: DayCode.Fri, label: "Fri" },
  { value: DayCode.Sat, label: "Sat" },
  { value: DayCode.Sun, label: "Sun" },
];

const STATUS_OPTIONS = ["Active", "Inactive"] as const;

export const SELLER_DEFAULT_VALUES: SellerFormValues = {
  name: "",
  category: "",
  description: "",
  phone: "",
  social: [],
  status: "Active",
  items: [],
  locations: [],
};

interface SellerFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  markets: { id: string; name: string; district: string; state: string }[];
  isSubmitting: boolean;
  submitLabel?: string;
  labels?: SellerFormLabels;
  onSubmit: (data: SellerFormValues) => Promise<void> | void;
}

export function SellerForm({ form, markets, isSubmitting, submitLabel = "Save", labels, onSubmit }: SellerFormProps) {
  const L = { ...DEFAULT_LABELS, ...labels };

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const {
    fields: locationFields,
    append: appendLocation,
    remove: removeLocation,
  } = useFieldArray({ control: form.control, name: "locations" });

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({ control: form.control, name: "social" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Basic Info ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Info className="w-4 h-4 text-primary" />
              {L.sectionBasicInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-sm">{L.fieldName}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldCategory}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={L.fieldCategoryPlaceholder} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-sm">{L.fieldDescription}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} className="bg-background resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Items & Prices ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Store className="w-4 h-4 text-primary" />
                {L.sectionItems}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => appendItem({ name: "", price: null, note: "" })}
              >
                <PlusCircle className="w-3 h-3 mr-1" />
                {L.addItem}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {itemFields.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
            {itemFields.map((itemField, ii) => (
              <div key={itemField.id} className="flex items-center gap-2 bg-background rounded-lg border px-3 py-2">
                <Input
                  className="flex-1 h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                  placeholder={L.fieldItemName}
                  {...form.register(`items.${ii}.name`)}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-24 h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                  placeholder={L.fieldItemPrice}
                  {...form.register(`items.${ii}.price`)}
                />
                <Input
                  className="w-32 h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                  placeholder={L.fieldItemNote}
                  {...form.register(`items.${ii}.note`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(ii)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Selling Locations ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {L.sectionLocations}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => appendLocation({ market_id: "", days: [], stall: "", notes: "" })}
              >
                <PlusCircle className="w-3 h-3 mr-1" />
                {L.addLocation}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            {locationFields.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
            {locationFields.map((locationField, li) => (
              <LocationEntry
                key={locationField.id}
                form={form}
                locationIndex={li}
                markets={markets}
                labels={L}
                onRemove={() => removeLocation(li)}
              />
            ))}
          </CardContent>
        </Card>

        {/* ── Contact & Social ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Tag className="w-4 h-4 text-primary" />
                {L.sectionContact}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => appendSocial({ platform: "", url: "" })}
              >
                <PlusCircle className="w-3 h-3 mr-1" />
                {L.addSocial}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldPhone}</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="0123456789" className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {socialFields.map((socialField, si) => (
              <div key={socialField.id} className="flex items-center gap-2 bg-background rounded-lg border px-3 py-2">
                <Input
                  className="w-32 h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                  placeholder={L.fieldSocialPlatform}
                  {...form.register(`social.${si}.platform`)}
                />
                <Input
                  className="flex-1 h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                  placeholder={L.fieldSocialUrl}
                  {...form.register(`social.${si}.url`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocial(si)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? L.saving : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function LocationEntry({
  form,
  locationIndex: li,
  markets,
  labels: L,
  onRemove,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  locationIndex: number;
  markets: { id: string; name: string; district: string; state: string }[];
  labels: Required<SellerFormLabels>;
  onRemove: () => void;
}) {
  const days: DayCode[] = form.watch(`locations.${li}.days`) ?? [];

  function toggleDay(day: DayCode) {
    const current: DayCode[] = form.getValues(`locations.${li}.days`) ?? [];
    const updated = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    form.setValue(`locations.${li}.days`, updated, { shouldValidate: true });
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {L.sectionLocations} {li + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <FormField
        control={form.control}
        name={`locations.${li}.market_id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">{L.fieldSelectMarket}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={L.fieldSelectMarket} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {markets.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} — {m.district}, {m.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Day pills */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Days</Label>
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleDay(value)}
              className={cn(
                "w-10 h-10 rounded-full text-xs font-semibold border-2 transition-all select-none",
                days.includes(value)
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`locations.${li}.stall`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">{L.fieldStall}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} className="bg-background text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${li}.notes`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">{L.fieldLocationNotes}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} className="bg-background text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
