/* Node's filesystem modules are required only on the server side.
   They are loaded dynamically inside loadMarkets() to avoid bundling errors
   in the client build. */

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

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
  area_m2: number | null;
  total_shop: number | null;
  description?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    gmaps_link: string;
  };
}

/**
 * Parses a CSV line into an array of fields, handling quoted commas.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i - 1] !== '\\') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((v) => v.trim());
}

/**
 * Loads market data from the CSV file at runtime (server side).
 */
function loadMarkets(): Market[] {
  // Load only on the server where Node's fs and path are available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path');
  const csvPath = path.join(process.cwd(), 'dataset', 'pasar-malam-malaysia.csv');
  const raw = fs.readFileSync(csvPath, { encoding: 'utf8' });
  const lines: string[] = raw.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
  const dataLines: string[] = lines.slice(1); // skip header

  return dataLines.map((line: string) => {
    const fields = parseCsvLine(line);
    const [
      name = '',
      address = '',
      _cityTown = '',
      district = '',
      _postcode = '',
      state = '',
      latStr = '',
      longStr = '',
      gmaps = '',
      operating_day = '',
      operating_hour = '',
      parkingStr = '',
      areaStr = '',
      amenitiesStr = '',
      status = '',
      totalShopStr = '',
    ] = fields;

    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const schedule: MarketSchedule[] = [];
    if (operating_day && operating_hour) {
      const days = operating_day
        .split(/[,&]/)
        .map((d) => d.trim().toLowerCase().substring(0, 3) as Weekday)
        .filter(Boolean);
      const [startRaw = '', endRaw = ''] = operating_hour.split('-').map((s) => s.trim());
      schedule.push({ days, times: [{ start: startRaw, end: endRaw }] });
    }

    const parking = {
      available: parkingStr.length > 0,
      accessible: false,
      notes: parkingStr,
    };

    const amenities = {
      toilet: /toilet/i.test(amenitiesStr),
      prayer_room: /prayer|room/i.test(amenitiesStr),
    };

    const area_m2 = areaStr ? parseFloat(areaStr) : null;
    const total_shop = totalShopStr ? parseInt(totalShopStr, 10) : null;

    const location = {
      latitude: latStr ? parseFloat(latStr) : 0,
      longitude: longStr ? parseFloat(longStr) : 0,
      gmaps_link: gmaps,
    };

    return {
      id,
      name,
      address,
      district,
      state,
      schedule,
      parking,
      amenities,
      status: status || 'Active',
      area_m2,
      total_shop,
      location,
    };
  });
}

export const marketsData: Market[] = typeof window === 'undefined' ? loadMarkets() : [];

export function getMarketById(id: string): Market | undefined {
  return marketsData.find((market) => market.id === id);
}

export function getAllMarkets(): Market[] {
  return marketsData;
}
