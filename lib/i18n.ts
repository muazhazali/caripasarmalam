export interface Translations {
  // App/Home Titles
  appTitle: string
  heroTitle: string
  homeSubtitle: string
  // Navigation
  home: string
  markets: string
  mapView: string
  backToDirectory: string

  // Search & Filters
  searchPlaceholder: string
  allStates: string
  allDays: string
  sortByName: string
  sortByLocation: string
  sortByStallCount: string
  sortByAreaSize: string
  clearAllFilters: string
  filtersAmenities: string

  // Amenities
  parkingAvailable: string
  accessibleParking: string
  toiletFacilities: string
  prayerRoom: string

  // Market Info
  operatingSchedule: string
  amenitiesFacilities: string
  parking: string
  otherFacilities: string
  locationAddress: string
  fullAddress: string
  quickInfo: string
  totalStalls: string
  areaSize: string
  district: string
  state: string
  contactInformation: string
  actions: string
  getDirections: string
  shareMarket: string
  findNearest: string

  // Status
  available: string
  notAvailable: string
  active: string

  // Units
  kmSquared: string

  // Days
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string

  // Time
  morningMarket: string
  eveningMarket: string
  nightMarket: string
  lateNightMarket: string
  sundayMarket: string
  fridayMarket: string

  // Messages
  noMarketsFound: string
  tryAdjustingFilters: string
  showingResults: string
  of: string
  browseStateMarkets: string
  discoverMoreMarkets: string
  otherMarketsIn: string
  loadingMap: string
  yourLocation: string
  viewDetails: string
  openInGoogleMaps: string
  scheduleNotAvailable: string
  locationNotAvailable: string
  marketPhoto: string
}

export const translations: Record<string, Translations> = {
  en: {
    // App/Home Titles
    appTitle: "Find Night Markets",
    heroTitle: "Find Your Perfect Night Market",
    homeSubtitle: "Discover night markets across Malaysia",
    // Navigation
    home: "Home",
    markets: "Markets",
    mapView: "Map View",
    backToDirectory: "Back to Directory",

    // Search & Filters
    searchPlaceholder: "Search markets, locations, or addresses...",
    allStates: "All States",
    allDays: "All Days",
    sortByName: "Sort by Name",
    sortByLocation: "Sort by Location",
    sortByStallCount: "Sort by Stall Count",
    sortByAreaSize: "Sort by Area Size",
    clearAllFilters: "Clear All",
    filtersAmenities: "Filters & Amenities",

    // Amenities
    parkingAvailable: "Parking Available",
    accessibleParking: "Accessible Parking",
    toiletFacilities: "Toilet Facilities",
    prayerRoom: "Prayer Room",

    // Market Info
    operatingSchedule: "Operating Schedule",
    amenitiesFacilities: "Amenities & Facilities",
    parking: "Parking",
    otherFacilities: "Other Facilities",
    locationAddress: "Location & Address",
    fullAddress: "Full Address",
    quickInfo: "Quick Info",
    totalStalls: "Total Stalls",
    areaSize: "Area Size",
    district: "District",
    state: "State",
    contactInformation: "Contact Information",
    actions: "Actions",
    getDirections: "Get Directions",
    shareMarket: "Share Market",
    findNearest: "Find Nearest",

    // Status
    available: "Available",
    notAvailable: "Not Available",
    active: "Active",

    // Units
    kmSquared: "km²",

    // Days
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",

    // Time
    morningMarket: "Morning market",
    eveningMarket: "Evening market",
    nightMarket: "Night market",
    lateNightMarket: "Late night market",
    sundayMarket: "Sunday market",
    fridayMarket: "Friday market",

    // Messages
    noMarketsFound: "No markets found matching your criteria.",
    tryAdjustingFilters: "Try adjusting your search or filters.",
    showingResults: "Showing",
    of: "of",
    browseStateMarkets: "Browse",
    discoverMoreMarkets: "Discover more night markets in your area.",
    otherMarketsIn: "Other Markets in",
    loadingMap: "Loading map...",
    yourLocation: "Your Location",
    viewDetails: "View Details",
    openInGoogleMaps: "Open in Google Maps",
    scheduleNotAvailable: "Schedule not available",
    locationNotAvailable: "Location not available",
    marketPhoto: "Market Photo",
  },
  ms: {
    // App/Home Titles
    appTitle: "Cari Pasar Malam",
    heroTitle: "Cari Pasar Malam Pilihan Anda",
    homeSubtitle: "Terokai pasar malam di seluruh Malaysia",
    // Navigation
    home: "Laman Utama",
    markets: "Pasar",
    mapView: "Paparan Peta",
    backToDirectory: "Kembali ke Direktori",

    // Search & Filters
    searchPlaceholder: "Cari pasar, lokasi, atau alamat...",
    allStates: "Semua Negeri",
    allDays: "Semua Hari",
    sortByName: "Susun mengikut Nama",
    sortByLocation: "Susun mengikut Lokasi",
    sortByStallCount: "Susun mengikut Bilangan Gerai",
    sortByAreaSize: "Susun mengikut Saiz Kawasan",
    clearAllFilters: "Kosongkan Semua",
    filtersAmenities: "Penapis & Kemudahan",

    // Amenities
    parkingAvailable: "Tempat Letak Kereta Tersedia",
    accessibleParking: "Tempat Letak Kereta Mudah Akses",
    toiletFacilities: "Kemudahan Tandas",
    prayerRoom: "Surau",

    // Market Info
    operatingSchedule: "Jadual Operasi",
    amenitiesFacilities: "Kemudahan & Fasiliti",
    parking: "Tempat Letak Kereta",
    otherFacilities: "Kemudahan Lain",
    locationAddress: "Lokasi & Alamat",
    fullAddress: "Alamat Penuh",
    quickInfo: "Maklumat Pantas",
    totalStalls: "Jumlah Gerai",
    areaSize: "Saiz Kawasan",
    district: "Daerah",
    state: "Negeri",
    contactInformation: "Maklumat Hubungan",
    actions: "Tindakan",
    getDirections: "Dapatkan Arah",
    shareMarket: "Kongsi Pasar",
    findNearest: "Cari Terdekat",

    // Status
    available: "Tersedia",
    notAvailable: "Tidak Tersedia",
    active: "Aktif",

    // Units
    kmSquared: "km²",

    // Days
    monday: "Isnin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Khamis",
    friday: "Jumaat",
    saturday: "Sabtu",
    sunday: "Ahad",

    // Time
    morningMarket: "Pasar pagi",
    eveningMarket: "Pasar petang",
    nightMarket: "Pasar malam",
    lateNightMarket: "Pasar lewat malam",
    sundayMarket: "Pasar Ahad",
    fridayMarket: "Pasar Jumaat",

    // Messages
    noMarketsFound: "Tiada pasar yang ditemui mengikut kriteria anda.",
    tryAdjustingFilters: "Cuba laraskan carian atau penapis anda.",
    showingResults: "Menunjukkan",
    of: "daripada",
    browseStateMarkets: "Layari",
    discoverMoreMarkets: "Temui lebih banyak pasar malam di kawasan anda.",
    otherMarketsIn: "Pasar Lain di",
    loadingMap: "Memuatkan peta...",
    yourLocation: "Lokasi Anda",
    viewDetails: "Lihat Butiran",
    openInGoogleMaps: "Buka di Google Maps",
    scheduleNotAvailable: "Jadual tidak tersedia",
    locationNotAvailable: "Lokasi tidak tersedia",
    marketPhoto: "Foto Pasar",
  },
}

export function useTranslation(locale = "ms") {
  return translations[locale] || translations.ms || translations.en
}
