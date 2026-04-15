"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { marketFormSchema, type MarketFormValues } from "@/lib/admin-schema";
import { DayCode } from "@/app/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";

const DAY_OPTIONS = [
  { value: DayCode.Mon, label: "Mon" },
  { value: DayCode.Tue, label: "Tue" },
  { value: DayCode.Wed, label: "Wed" },
  { value: DayCode.Thu, label: "Thu" },
  { value: DayCode.Fri, label: "Fri" },
  { value: DayCode.Sat, label: "Sat" },
  { value: DayCode.Sun, label: "Sun" },
];

const STATUS_OPTIONS = ["Active", "Inactive", "Suspended", "Closed"] as const;

interface MarketFormProps {
  defaultValues?: Partial<MarketFormValues>;
  onSubmit: (data: MarketFormValues) => Promise<void>;
  states: string[];
  isSubmitting: boolean;
  submitLabel?: string;
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

export function MarketForm({ defaultValues, onSubmit, states, isSubmitting, submitLabel = "Save" }: MarketFormProps) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
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
                  <FormLabel>District *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>State *</FormLabel>
                  <FormControl>
                    <Input {...field} list="states-list" />
                  </FormControl>
                  <datalist id="states-list">
                    {states.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
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
                  <FormLabel>Area (m²)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ""} />
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
                  <FormLabel>Total Stalls</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ""} />
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
                  <FormLabel>Shop List (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Nasi Lemak, Rojak, Satay" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Schedule</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSchedule({ days: [], times: [{ start: "17:00", end: "22:00", note: "" }] })}
              >
                <PlusCircle className="w-4 h-4 mr-1" /> Add Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduleFields.map((scheduleField, si) => (
              <ScheduleEntry
                key={scheduleField.id}
                form={form}
                scheduleIndex={si}
                onRemove={() => removeSchedule(si)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location (optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="location.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} value={field.value ?? ""} />
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
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.gmaps_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps Link</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact (optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contact.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Amenities & Parking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Amenities &amp; Parking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="amenities.toilet"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Toilet</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amenities.prayer_room"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Prayer Room</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parking.available"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Parking</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parking.accessible"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Accessible Parking</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="parking.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parking Notes</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
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
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  scheduleIndex: number;
  onRemove: () => void;
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
    <div className="border rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Schedule {si + 1}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Days */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Days</Label>
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1 cursor-pointer">
              <Checkbox checked={days.includes(value)} onCheckedChange={() => toggleDay(value)} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Time Slots</Label>
        {timeFields.map((timeField, ti) => (
          <div key={timeField.id} className="flex items-center gap-2">
            <Input className="w-28" placeholder="17:00" {...form.register(`schedule.${si}.times.${ti}.start`)} />
            <span className="text-muted-foreground text-sm">to</span>
            <Input className="w-28" placeholder="22:00" {...form.register(`schedule.${si}.times.${ti}.end`)} />
            <Input
              className="flex-1"
              placeholder="Note (optional)"
              {...form.register(`schedule.${si}.times.${ti}.note`)}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => removeTime(ti)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendTime({ start: "17:00", end: "22:00", note: "" })}
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Add Time Slot
        </Button>
      </div>
    </div>
  );
}
