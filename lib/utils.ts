import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time helpers for market open status
import type { Market, Weekday } from "@/lib/markets-data";

interface OpenStatus {
  status: "open" | "closed";
  closesAt?: Date;
  nextOpenAt?: Date;
}

function getMalaysiaNow(date?: Date): Date {
  const now = date ? new Date(date) : new Date();
  // Malaysia is UTC+8 with no DST; construct equivalent time in UTC then shift
  const tzOffsetMinutes = 8 * 60;
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  return new Date(utc.getTime() + tzOffsetMinutes * 60000);
}

function parseTimeToMinutes(time24: string): number {
  const [h, m] = time24.split(":").map((v) => parseInt(v, 10));
  return h * 60 + (m || 0);
}

function weekdayIndex(code: Weekday): number {
  switch (code) {
    case "mon":
      return 1;
    case "tue":
      return 2;
    case "wed":
      return 3;
    case "thu":
      return 4;
    case "fri":
      return 5;
    case "sat":
      return 6;
    case "sun":
      return 0;
    default:
      return 0;
  }
}

export function getMarketOpenStatus(market: Market, now?: Date): OpenStatus {
  const localNow = getMalaysiaNow(now);
  const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
  const currentWeekday = localNow.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun

  // Flatten schedule into day -> time ranges
  type Range = { day: number; start: number; end: number };
  const ranges: Range[] = [];

  for (const rule of market.schedule || []) {
    // @ts-ignore schedule.days may exist in data but not declared; align at use sites
    const days: Weekday[] = (rule as any).days || [];
    for (const day of days) {
      for (const t of rule.times || []) {
        const start = parseTimeToMinutes(t.start);
        const end = parseTimeToMinutes(t.end);
        const dayIdx = weekdayIndex(day);
        if (end >= start) {
          ranges.push({ day: dayIdx, start, end });
        } else {
          // Cross-midnight: split into two segments
          ranges.push({ day: dayIdx, start, end: 24 * 60 });
          ranges.push({ day: (dayIdx + 1) % 7, start: 0, end });
        }
      }
    }
  }

  // Check if open now
  const openNow = ranges.some((r) => r.day === currentWeekday && currentMinutes >= r.start && currentMinutes < r.end);
  if (openNow) {
    // Determine the nearest closing time for today
    const todayClosings = ranges
      .filter((r) => r.day === currentWeekday && currentMinutes < r.end && currentMinutes >= r.start)
      .map((r) => r.end);
    const closesMinutes = Math.min(...todayClosings);
    const closesAt = new Date(localNow);
    closesAt.setHours(Math.floor(closesMinutes / 60), closesMinutes % 60, 0, 0);
    return { status: "open", closesAt };
  }

  // Find next opening time within next 7 days
  let bestDeltaMinutes = Infinity;
  let nextDay: number = currentWeekday;
  let nextMinutes = 0;
  for (let deltaDay = 0; deltaDay < 7; deltaDay++) {
    const day = (currentWeekday + deltaDay) % 7;
    const minutesFromNowToStartOfDay = deltaDay * 24 * 60;
    for (const r of ranges) {
      if (r.day !== day) continue;
      const candidateMinutes =
        minutesFromNowToStartOfDay + Math.max(0, r.start - (deltaDay === 0 ? currentMinutes : 0));
      if (candidateMinutes >= 0 && candidateMinutes < bestDeltaMinutes) {
        bestDeltaMinutes = candidateMinutes;
        nextDay = day;
        nextMinutes = r.start;
      }
    }
  }

  let nextOpenAt: Date | undefined;
  if (bestDeltaMinutes !== Infinity) {
    nextOpenAt = new Date(localNow.getTime() + bestDeltaMinutes * 60000);
    const hours = Math.floor(nextMinutes / 60);
    const mins = nextMinutes % 60;
    nextOpenAt.setHours(hours, mins, 0, 0);
  }

  return { status: "closed", nextOpenAt };
}
