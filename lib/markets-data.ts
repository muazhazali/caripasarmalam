export interface MarketSchedule {
  day: string
  sessions: {
    start: string
    end: string
    note: string
  }[]
}

export interface Market {
  id: string
  name: string
  address: string
  district: string
  state: string
  schedule: MarketSchedule[]
  parking: {
    available: boolean
    accessible: boolean
    notes: string
  }
  amenities: {
    toilet: boolean
    prayer_room: boolean
  }
  status: string
  area_m2: number
  total_shop: number | null
  description?: string
  contact?: {
    phone?: string
    email?: string
  }
  location?: {
    latitude: number
    longitude: number
    gmaps_link: string
  }
}

export const marketsData: Market[] = [
  {
    id: "taman-melawati-kl",
    name: "Pasar Malam Taman Melawati",
    address: "Pusat Bandar, 311, Lorong Selangor, Taman Melawati, 53100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Kuala Lumpur",
    state: "Kuala Lumpur",
    description:
      "One of the most popular night markets in Kuala Lumpur, Pasar Malam Taman Melawati offers a wide variety of local street food, fresh produce, and household items. Known for its vibrant atmosphere and authentic Malaysian cuisine.",
    schedule: [
      {
        day: "Tuesday",
        sessions: [{ start: "17:00", end: "22:00", note: "Night market" }],
      },
      {
        day: "Thursday",
        sessions: [{ start: "17:00", end: "22:00", note: "Night market" }],
      },
      {
        day: "Saturday",
        sessions: [
          { start: "07:00", end: "11:00", note: "Morning market" },
          { start: "17:00", end: "22:00", note: "Evening market" },
        ],
      },
    ],
    parking: {
      available: true,
      accessible: true,
      notes: "Limited roadside parking available. Best to arrive early for better parking spots.",
    },
    amenities: { toilet: true, prayer_room: true },
    status: "Active",
    area_m2: 4590.72,
    total_shop: 45,
    location: {
      latitude: 3.2104933,
      longitude: 101.7493301,
      gmaps_link: "https://maps.app.goo.gl/QmFnDaXLgfLxY8LM8",
    },
  },
  {
    id: "ss2-petaling-jaya",
    name: "Pasar Malam SS2",
    address: "Jalan SS 2/10, SS 2, 47300 Petaling Jaya, Selangor",
    district: "Petaling Jaya",
    state: "Selangor",
    description:
      "A bustling night market in the heart of Petaling Jaya, famous for its diverse food offerings and affordable prices. Popular among locals and students from nearby universities.",
    schedule: [
      {
        day: "Wednesday",
        sessions: [{ start: "18:00", end: "23:00", note: "Night market" }],
      },
    ],
    parking: { available: true, accessible: false, notes: "Street parking only. Can get crowded during peak hours." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 3200,
    total_shop: 38,
    location: {
      latitude: 3.1193,
      longitude: 101.6309,
      gmaps_link: "https://maps.app.goo.gl/example2",
    },
  },
  {
    id: "chow-kit-kl",
    name: "Pasar Malam Chow Kit",
    address: "Jalan Tuanku Abdul Rahman, Chow Kit, 50350 Kuala Lumpur",
    district: "Kuala Lumpur",
    state: "Kuala Lumpur",
    description:
      "A historic night market in the vibrant Chow Kit area, operating late into the night. Known for its authentic local atmosphere and traditional Malaysian street food.",
    schedule: [
      {
        day: "Saturday",
        sessions: [{ start: "19:00", end: "01:00", note: "Late night market" }],
      },
    ],
    parking: { available: false, accessible: false, notes: "No dedicated parking. Public transport recommended." },
    amenities: { toilet: true, prayer_room: true },
    status: "Active",
    area_m2: 2800,
    total_shop: 52,
    location: {
      latitude: 3.1569,
      longitude: 101.6953,
      gmaps_link: "https://maps.app.goo.gl/example3",
    },
  },
  {
    id: "taman-connaught-cheras",
    name: "Pasar Malam Taman Connaught",
    address: "Jalan Cerdas, Taman Connaught, 56000 Cheras, Kuala Lumpur",
    district: "Cheras",
    state: "Kuala Lumpur",
    description:
      "One of the longest night markets in Malaysia, stretching over 2 kilometers. Famous for its extensive variety of food, clothing, and household items at competitive prices.",
    schedule: [
      {
        day: "Wednesday",
        sessions: [{ start: "17:30", end: "22:30", note: "Evening market" }],
      },
    ],
    parking: {
      available: true,
      accessible: true,
      notes: "Ample parking space available in nearby areas and shopping complexes.",
    },
    amenities: { toilet: true, prayer_room: false },
    status: "Active",
    area_m2: 5200,
    total_shop: 68,
    location: {
      latitude: 3.0833,
      longitude: 101.7167,
      gmaps_link: "https://maps.app.goo.gl/example4",
    },
  },
  {
    id: "pasar-malam-batu-caves",
    name: "Pasar Malam Batu Caves",
    address: "Jalan Batu Caves, 68100 Batu Caves, Selangor",
    district: "Gombak",
    state: "Selangor",
    description:
      "Located near the famous Batu Caves temple, this night market offers a mix of local and Indian cuisine, reflecting the diverse community in the area.",
    schedule: [
      {
        day: "Tuesday",
        sessions: [{ start: "18:00", end: "23:00", note: "Night market" }],
      },
    ],
    parking: {
      available: true,
      accessible: true,
      notes: "Free parking available in designated areas near the market.",
    },
    amenities: { toilet: true, prayer_room: true },
    status: "Active",
    area_m2: 3800,
    total_shop: 42,
    location: {
      latitude: 3.2379,
      longitude: 101.684,
      gmaps_link: "https://maps.app.goo.gl/example5",
    },
  },
  {
    id: "pasar-malam-bangsar",
    name: "Pasar Malam Bangsar",
    address: "Jalan Telawi 2, Bangsar Baru, 59100 Kuala Lumpur",
    district: "Kuala Lumpur",
    state: "Kuala Lumpur",
    description:
      "An upscale night market in the trendy Bangsar area, known for its quality food offerings and modern atmosphere. Popular among expatriates and young professionals.",
    schedule: [
      {
        day: "Sunday",
        sessions: [{ start: "17:00", end: "22:00", note: "Sunday market" }],
      },
    ],
    parking: {
      available: true,
      accessible: false,
      notes: "Limited paid parking available. Public transport recommended during peak hours.",
    },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 2400,
    total_shop: 28,
    location: {
      latitude: 3.1319,
      longitude: 101.6741,
      gmaps_link: "https://maps.app.goo.gl/example6",
    },
  },
  {
    id: "pasar-malam-ampang",
    name: "Pasar Malam Ampang",
    address: "Jalan Ampang Utama 1/1, Ampang, 68000 Selangor",
    district: "Ampang",
    state: "Selangor",
    description:
      "A family-friendly night market with a good selection of local delicacies and fresh produce. Known for its clean environment and organized layout.",
    schedule: [
      {
        day: "Thursday",
        sessions: [{ start: "18:30", end: "23:30", note: "Night market" }],
      },
    ],
    parking: {
      available: true,
      accessible: true,
      notes: "Free parking available behind nearby shops and residential areas.",
    },
    amenities: { toilet: true, prayer_room: true },
    status: "Active",
    area_m2: 4100,
    total_shop: 55,
    location: {
      latitude: 3.1478,
      longitude: 101.7617,
      gmaps_link: "https://maps.app.goo.gl/example7",
    },
  },
  {
    id: "pasar-malam-setapak",
    name: "Pasar Malam Setapak",
    address: "Jalan Genting Klang, Setapak, 53300 Kuala Lumpur",
    district: "Kuala Lumpur",
    state: "Kuala Lumpur",
    description:
      "A neighborhood night market serving the local Setapak community with affordable food and daily necessities. Known for its friendly vendors and community atmosphere.",
    schedule: [
      {
        day: "Friday",
        sessions: [{ start: "17:00", end: "22:00", note: "Friday market" }],
      },
    ],
    parking: {
      available: false,
      accessible: false,
      notes: "Limited street parking only. Best accessed by public transport or motorcycle.",
    },
    amenities: { toilet: false, prayer_room: true },
    status: "Active",
    area_m2: 2900,
    total_shop: 35,
    location: {
      latitude: 3.1951,
      longitude: 101.7249,
      gmaps_link: "https://maps.app.goo.gl/example8",
    },
  },
]

export function getMarketById(id: string): Market | undefined {
  return marketsData.find((market) => market.id === id)
}

export function getAllMarkets(): Market[] {
  return marketsData
}
