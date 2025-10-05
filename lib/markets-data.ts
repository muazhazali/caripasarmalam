export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface MarketSchedule {
  days: Weekday[]
  times: {
    start: string
    end: string
    note?: string
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
        days: ["tue"],
        times: [{ start: "17:00", end: "22:00", note: "Night market" }],
      },
      {
        days: ["thu"],
        times: [{ start: "17:00", end: "22:00", note: "Night market" }],
      },
      {
        days: ["sat"],
        times: [
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
        days: ["wed"],
        times: [{ start: "18:00", end: "23:00", note: "Night market" }],
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
        days: ["sat"],
        times: [{ start: "19:00", end: "01:00", note: "Late night market" }],
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
        days: ["wed"],
        times: [{ start: "17:30", end: "22:30", note: "Evening market" }],
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
        days: ["tue"],
        times: [{ start: "18:00", end: "23:00", note: "Night market" }],
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
        days: ["sun"],
        times: [{ start: "17:00", end: "22:00", note: "Sunday market" }],
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
        days: ["thu"],
        times: [{ start: "18:30", end: "23:30", note: "Night market" }],
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
        days: ["fri"],
        times: [{ start: "17:00", end: "22:00", note: "Friday market" }],
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
  {
    id: "pasar-malam-jalan-30-10a-taman-perindustrian-iks",
    name: "Pasar Malam Jalan 30/10A, Taman Perindustrian IKS",
    address: "Taman Perindustrian IKS, Batu, 68100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Batu",
    state: "Kuala Lumpur",
    description: "A local night market in Taman Perindustrian IKS area, offering various food and goods to the community.",
    schedule: [
      {
        days: ["fri"],
        times: [{ start: "18:00", end: "22:00", note: "Friday night market" }],
      },
    ],
    parking: { available: true, accessible: true, notes: "Street parking available in the area." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 2000,
    total_shop: 25,
    location: {
      latitude: 3.221393,
      longitude: 101.68881,
      gmaps_link: "https://maps.app.goo.gl/KvXCzyGonwKktbg88",
    },
  },
  {
    id: "pasar-malam-jalan-kangsar-off-jalan-ipoh",
    name: "Pasar Malam Jalan Kangsar Off Jalan Ipoh",
    address: "Taman Rainbow, Batu, 51100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Batu",
    state: "Kuala Lumpur",
    description: "A neighborhood night market in Taman Rainbow area, serving the local community with fresh produce and local delicacies.",
    schedule: [
      {
        days: ["mon"],
        times: [{ start: "18:00", end: "22:00", note: "Monday night market" }],
      },
    ],
    parking: { available: true, accessible: true, notes: "Street parking available along the road." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 1800,
    total_shop: 22,
    location: {
      latitude: 3.1938417,
      longitude: 101.6777776,
      gmaps_link: "https://maps.app.goo.gl/Kux37PbHoT2yYHVb7",
    },
  },
  {
    id: "pasar-malam-pkns-jalan-kuching",
    name: "Pasar Malam PKNS Jalan Kuching",
    address: "Jinjang Selatan, Batu, 54200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Batu",
    state: "Kuala Lumpur",
    description: "A community night market in Jinjang Selatan area, known for its variety of local food and household items.",
    schedule: [
      {
        days: ["thu"],
        times: [{ start: "18:00", end: "22:00", note: "Thursday night market" }],
      },
    ],
    parking: { available: true, accessible: true, notes: "Parking available in nearby areas." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 2200,
    total_shop: 28,
    location: {
      latitude: 3.199854,
      longitude: 101.6688947,
      gmaps_link: "https://maps.app.goo.gl/KAebVGCzmPwf1jng8",
    },
  },
  {
    id: "pasar-malam-ppr-batu-muda",
    name: "Pasar Malam PPR Batu Muda",
    address: "Jalan 2/12a, Sentul, Batu, 51200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Batu",
    state: "Kuala Lumpur",
    description: "A residential night market serving the PPR Batu Muda community with affordable food and daily necessities.",
    schedule: [
      {
        days: ["thu"],
        times: [{ start: "16:30", end: "22:30", note: "Thursday evening market" }],
      },
      {
        days: ["tue"],
        times: [{ start: "16:30", end: "22:30", note: "Tuesday evening market" }],
      },
    ],
    parking: { available: true, accessible: true, notes: "Limited parking available in the residential area." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 1900,
    total_shop: 24,
    location: {
      latitude: 3.2056782,
      longitude: 101.6792353,
      gmaps_link: "https://maps.app.goo.gl/dtBKiiPAzRBWRMTw6",
    },
  },
  {
    id: "pasar-malam-sentul-pasar-dalam-4b",
    name: "Pasar Malam Sentul Pasar Dalam 4B",
    address: "Jalan 1/48a, Bandar Baru Sentul, Batu, 51000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Batu",
    state: "Kuala Lumpur",
    description: "A local night market in Bandar Baru Sentul, offering fresh produce and local food to the community.",
    schedule: [
      {
        days: ["fri"],
        times: [{ start: "17:00", end: "22:00", note: "Friday evening market" }],
      },
    ],
    parking: { available: true, accessible: true, notes: "Street parking available in the area." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 2100,
    total_shop: 26,
    location: {
      latitude: 3.1868429,
      longitude: 101.6959855,
      gmaps_link: "https://maps.app.goo.gl/73HuJG6uHwV7nxfr6",
    },
  },
  {
    id: "pasar-malam-taman-beringin",
    name: "Pasar Malam Taman Beringin",
    address: "Taman Beringin, Batu, Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Batu",
    state: "Kuala Lumpur",
    description: "A community night market in Taman Beringin area, serving local residents with various food and goods.",
    schedule: [
      {
        days: ["wed"],
        times: [{ start: "17:00", end: "22:00", note: "Wednesday evening market" }],
      },
    ],
    parking: { available: true, accessible: true, notes: "Street parking available in the residential area." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 1700,
    total_shop: 20,
    location: {
      latitude: 3.2189819,
      longitude: 101.6618913,
      gmaps_link: "https://maps.app.goo.gl/XPC3o4eQsFXUujta9",
    },
  },
  {
    id: "pasar-malam-taman-dato-senu",
    name: "Pasar Malam Taman Dato Senu",
    address: "Jalan Dato Senu 20, Taman Dato Senu, Batu, 51000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Batu",
    state: "Kuala Lumpur",
    description: "A neighborhood night market in Taman Dato Senu, known for its friendly atmosphere and local food offerings.",
    schedule: [
      {
        days: ["tue"],
        times: [{ start: "17:00", end: "22:00", note: "Tuesday evening market" }],
      },
    ],
    parking: { available: true, accessible: true, notes: "Street parking available along Jalan Dato Senu." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 2000,
    total_shop: 25,
    location: {
      latitude: 3.1939448,
      longitude: 101.6936048,
      gmaps_link: "https://maps.app.goo.gl/g3MW46tLMwRud2hw6",
    },
  },
  {
    id: "pasar-malam-jalan-manjoi-taman-kok-lian",
    name: "Pasar Malam Jalan Manjoi, Taman Kok Lian",
    address: "Taman Kok Lian, Batu, 51200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    district: "Batu",
    state: "Kuala Lumpur",
    description: "A local night market in Taman Kok Lian area, offering various food and household items to the community.",
    schedule: [
      {
        days: ["tue"],
        times: [{ start: "17:00", end: "22:00", note: "Tuesday evening market" }],
      },
    ],
    parking: { available: true, accessible: true, notes: "Street parking available in the residential area." },
    amenities: { toilet: false, prayer_room: false },
    status: "Active",
    area_m2: 1800,
    total_shop: 22,
    location: {
      latitude: 3.1987756,
      longitude: 101.6748066,
      gmaps_link: "https://maps.app.goo.gl/k5T6wyeMv8o9y1Lh6",
    },
  },
]

export function getMarketById(id: string): Market | undefined {
  return marketsData.find((market) => market.id === id)
}

export function getAllMarkets(): Market[] {
  return marketsData
}
