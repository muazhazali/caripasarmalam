"use client";

import dynamic from "next/dynamic";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { marketFormSchema, type MarketFormValues } from "@/lib/admin-schema";
import { DayCode } from "@/app/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, MapPin, Clock, Info, Phone, Car, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const LocationMapPicker = dynamic(() => import("@/components/location-map-picker").then((m) => m.LocationMapPicker), {
  ssr: false,
});

// Labels interface — all optional so admin page can omit and get English defaults
export interface MarketFormLabels {
  sectionBasicInfo?: string;
  sectionDetails?: string;
  sectionSchedule?: string;
  sectionLocation?: string;
  sectionContact?: string;
  sectionAmenities?: string;
  fieldName?: string;
  fieldAddress?: string;
  fieldDistrict?: string;
  fieldState?: string;
  fieldStatus?: string;
  fieldDescription?: string;
  fieldAreaM2?: string;
  fieldTotalStalls?: string;
  fieldShopList?: string;
  fieldShopListPlaceholder?: string;
  fieldLatitude?: string;
  fieldLongitude?: string;
  fieldGmapsLink?: string;
  fieldPhone?: string;
  fieldEmail?: string;
  fieldToilet?: string;
  fieldPrayerRoom?: string;
  fieldParking?: string;
  fieldAccessibleParking?: string;
  fieldParkingNotes?: string;
  scheduleDays?: string;
  scheduleTimeSlots?: string;
  scheduleFrom?: string;
  scheduleTo?: string;
  scheduleNote?: string;
  scheduleAddTimeSlot?: string;
  scheduleAddSchedule?: string;
  scheduleSchedule?: string;
  mapPickerTitle?: string;
  mapPickerHint?: string;
  mapPickerSearch?: string;
  mapPickerSearchBtn?: string;
  mapPickerClear?: string;
  saving?: string;
}

const DEFAULT_LABELS: Required<MarketFormLabels> = {
  sectionBasicInfo: "Basic Info",
  sectionDetails: "Details",
  sectionSchedule: "Operating Schedule",
  sectionLocation: "Location",
  sectionContact: "Contact (optional)",
  sectionAmenities: "Amenities & Parking",
  fieldName: "Market Name *",
  fieldAddress: "Address *",
  fieldDistrict: "District *",
  fieldState: "State *",
  fieldStatus: "Status",
  fieldDescription: "Description",
  fieldAreaM2: "Area (m²)",
  fieldTotalStalls: "Total Stalls",
  fieldShopList: "Stall Types",
  fieldShopListPlaceholder: "e.g. Nasi Lemak, Rojak, Satay",
  fieldLatitude: "Latitude",
  fieldLongitude: "Longitude",
  fieldGmapsLink: "Google Maps Link",
  fieldPhone: "Phone",
  fieldEmail: "Email",
  fieldToilet: "Toilet",
  fieldPrayerRoom: "Prayer Room",
  fieldParking: "Parking Available",
  fieldAccessibleParking: "Accessible Parking",
  fieldParkingNotes: "Parking Notes",
  scheduleDays: "Operating Days",
  scheduleTimeSlots: "Time Slots",
  scheduleFrom: "From",
  scheduleTo: "To",
  scheduleNote: "Note (optional)",
  scheduleAddTimeSlot: "Add Time Slot",
  scheduleAddSchedule: "Add Schedule",
  scheduleSchedule: "Schedule",
  mapPickerTitle: "Pin Location on Map",
  mapPickerHint: "Click on the map to set the market location, or search by address below.",
  mapPickerSearch: "Search address...",
  mapPickerSearchBtn: "Search",
  mapPickerClear: "Clear pin",
  saving: "Saving...",
};

const DAY_OPTIONS = [
  { value: DayCode.Mon, label: "Mon", labelMs: "Isn" },
  { value: DayCode.Tue, label: "Tue", labelMs: "Sel" },
  { value: DayCode.Wed, label: "Wed", labelMs: "Rab" },
  { value: DayCode.Thu, label: "Thu", labelMs: "Kha" },
  { value: DayCode.Fri, label: "Fri", labelMs: "Jum" },
  { value: DayCode.Sat, label: "Sat", labelMs: "Sab" },
  { value: DayCode.Sun, label: "Sun", labelMs: "Ahd" },
];

const STATUS_OPTIONS = ["Active", "Inactive", "Suspended", "Closed"] as const;

interface MarketFormProps {
  defaultValues?: Partial<MarketFormValues>;
  onSubmit: (data: MarketFormValues) => Promise<void>;
  states: string[];
  isSubmitting: boolean;
  submitLabel?: string;
  labels?: MarketFormLabels;
}

const DEFAULT_VALUES: MarketFormValues = {
  name: "",
  address: "",
  district: "",
  state: "",
  status: "Active",
  description: "",
  shop_list: "",
  schedule: [{ days: [], times: [{ start: "17:00", end: "22:00", note: "" }] }],
  amenities: { toilet: false, prayer_room: false },
  parking: { available: false, accessible: false, notes: "" },
  contact: { phone: "", email: "" },
  location: { latitude: 0, longitude: 0, gmaps_link: "" },
};

export function MarketForm({ defaultValues, onSubmit, states, isSubmitting, submitLabel = "Save", labels }: MarketFormProps) {
  const L = { ...DEFAULT_LABELS, ...labels };

  const form = useForm<MarketFormValues>({
    resolver: zodResolver(marketFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule,
  } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  const lat = form.watch("location.latitude");
  const lng = form.watch("location.longitude");

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
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-sm">{L.fieldAddress}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} className="bg-background resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldDistrict}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldState}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="— select —" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((s) => (
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldStatus}</FormLabel>
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
          </CardContent>
        </Card>

        {/* ── Schedule ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                {L.sectionSchedule}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => appendSchedule({ days: [], times: [{ start: "17:00", end: "22:00", note: "" }] })}
              >
                <PlusCircle className="w-3 h-3 mr-1" />
                {L.scheduleAddSchedule}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            {scheduleFields.map((scheduleField, si) => (
              <ScheduleEntry
                key={scheduleField.id}
                form={form}
                scheduleIndex={si}
                onRemove={() => removeSchedule(si)}
                labels={L}
              />
            ))}
          </CardContent>
        </Card>

        {/* ── Location ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              {L.sectionLocation}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <LocationMapPicker
              latitude={lat && lat !== 0 ? lat : null}
              longitude={lng && lng !== 0 ? lng : null}
              onChange={(newLat, newLng) => {
                form.setValue("location.latitude", newLat, { shouldValidate: true });
                form.setValue("location.longitude", newLng, { shouldValidate: true });
              }}
              onClear={() => {
                form.setValue("location.latitude", 0);
                form.setValue("location.longitude", 0);
              }}
              labels={{
                title: L.mapPickerTitle,
                hint: L.mapPickerHint,
                search: L.mapPickerSearch,
                searchBtn: L.mapPickerSearchBtn,
                clear: L.mapPickerClear,
              }}
            />
            {/* Hidden lat/lng fields — still in form state, shown as read-only for transparency */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="location.latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">{L.fieldLatitude}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        className="bg-background text-sm"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">{L.fieldLongitude}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        className="bg-background text-sm"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location.gmaps_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">{L.fieldGmapsLink}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} className="bg-background text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Amenities & Parking ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Car className="w-4 h-4 text-primary" />
              {L.sectionAmenities}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { name: "amenities.toilet", label: L.fieldToilet },
                  { name: "amenities.prayer_room", label: L.fieldPrayerRoom },
                  { name: "parking.available", label: L.fieldParking },
                  { name: "parking.accessible", label: L.fieldAccessibleParking },
                ] as const
              ).map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            "w-full rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all text-left",
                            field.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/50",
                          )}
                        >
                          <span className="mr-2">{field.value ? "✓" : "○"}</span>
                          {label}
                        </button>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormField
              control={form.control}
              name="parking.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">{L.fieldParkingNotes}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Details ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Layers className="w-4 h-4 text-primary" />
              {L.sectionDetails}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-sm">{L.fieldDescription}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} className="bg-background resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area_m2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldAreaM2}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ""} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total_shop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldTotalStalls}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ""} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shop_list"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-sm">{L.fieldShopList}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={L.fieldShopListPlaceholder} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Contact ── */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-primary" />
              {L.sectionContact}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contact.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldPhone}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{L.fieldEmail}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value ?? ""} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

function ScheduleEntry({
  form,
  scheduleIndex: si,
  onRemove,
  labels: L,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  scheduleIndex: number;
  onRemove: () => void;
  labels: Required<MarketFormLabels>;
}) {
  const {
    fields: timeFields,
    append: appendTime,
    remove: removeTime,
  } = useFieldArray({
    control: form.control,
    name: `schedule.${si}.times`,
  });

  const days: DayCode[] = form.watch(`schedule.${si}.days`) ?? [];

  function toggleDay(day: DayCode) {
    const current: DayCode[] = form.getValues(`schedule.${si}.days`) ?? [];
    const updated = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    form.setValue(`schedule.${si}.days`, updated, { shouldValidate: true });
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {L.scheduleSchedule} {si + 1}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Day pills */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">{L.scheduleDays}</Label>
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

      {/* Time slots */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground block">{L.scheduleTimeSlots}</Label>
        {timeFields.map((timeField, ti) => (
          <div key={timeField.id} className="flex items-center gap-2 bg-background rounded-lg border px-3 py-2">
            <span className="text-xs text-muted-foreground shrink-0">{L.scheduleFrom}</span>
            <Input
              className="w-24 h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
              placeholder="17:00"
              {...form.register(`schedule.${si}.times.${ti}.start`)}
            />
            <span className="text-xs text-muted-foreground shrink-0">{L.scheduleTo}</span>
            <Input
              className="w-24 h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
              placeholder="22:00"
              {...form.register(`schedule.${si}.times.${ti}.end`)}
            />
            <Input
              className="flex-1 h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
              placeholder={L.scheduleNote}
              {...form.register(`schedule.${si}.times.${ti}.note`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTime(ti)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => appendTime({ start: "17:00", end: "22:00", note: "" })}
        >
          <PlusCircle className="w-3 h-3 mr-1" />
          {L.scheduleAddTimeSlot}
        </Button>
      </div>
    </div>
  );
}
