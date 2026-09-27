import { DayCode } from "@/app/enums";

export type Weekday = DayCode.Mon | DayCode.Tue | DayCode.Wed | DayCode.Thu | DayCode.Fri | DayCode.Sat | DayCode.Sun;

export interface MarketSchedule {
  days: Weekday[];
  times: {
    start: string;
    end: string;
    note?: string;
  }[];
}

export interface Market {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  schedule: MarketSchedule[];
  parking: {
    available: boolean;
    accessible: boolean;
    notes: string;
  };
  amenities: {
    toilet: boolean;
    prayer_room: boolean;
  };
  status: string;
  area_m2: number;
  total_shop: number | null;
  // Optional list of stall types or popular items, split from comma-separated text
  shop_list?: string[];
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    gmaps_link: string;
  };
}
