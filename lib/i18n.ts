export interface Translations {
  // App/Home Titles
  appTitle: string;
  heroTitle: string;
  heroDescription: string;
  homeSubtitle: string;
  featuredMarkets: string;
  searchResults: string;
  // Navigation
  home: string;
  markets: string;
  mapView: string;
  backToDirectory: string;
  about: string;
  contributors: string;
  more: string;
  github: string;
  languageLabel: string;
  lightMode: string;
  darkMode: string;
  showMore: string;

  // Static Pages
  aboutTitle: string;
  contributorsTitle: string;
  contributorsSubtitle: string;

  // Quick Stats
  statsMarketsListed: string;
  statsWeeklyCoverage: string;
  statsNationwide: string;
  days: string;
  states: string;

  // Search & Filters
  searchPlaceholder: string;
  allStates: string;
  allDays: string;
  smartSort: string;
  sortByName: string;
  sortByLocation: string;
  sortByStallCount: string;
  sortByAreaSize: string;
  sortByDistance: string;
  clearAllFilters: string;
  filtersAmenities: string;
  filters: string;
  applyFilters: string;
  reset: string;
  stateLabel: string;
  dayLabel: string;
  dayOfWeekLabel: string;

  // Amenities
  parkingAvailable: string;
  accessibleParking: string;
  toiletFacilities: string;
  prayerRoom: string;

  // Market Info
  operatingSchedule: string;
  amenitiesFacilities: string;
  shopList: string;
  parking: string;
  toilet: string;
  otherFacilities: string;
  locationAddress: string;
  fullAddress: string;
  quickInfo: string;
  totalStalls: string;
  areaSize: string;
  district: string;
  state: string;
  actions: string;
  reportWrongInfo: string;
  getDirections: string;
  showDirection: string;
  shareMarket: string;
  findNearest: string;
  findNearestTitle: string;
  findNearestDescription: string;
  searching: string;

  // Status
  available: string;
  notAvailable: string;
  active: string;
  accessible: string;

  // Units
  kmSquared: string;
  kmFromHere: string;

  // Days
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;

  // Time
  morningMarket: string;
  eveningMarket: string;
  nightMarket: string;
  lateNightMarket: string;
  sundayMarket: string;
  fridayMarket: string;

  // Messages
  noMarketsFound: string;
  tryAdjustingFilters: string;
  showingResults: string;
  of: string;
  browseStateMarkets: string;
  discoverMoreMarkets: string;
  otherMarketsIn: string;
  loadingMap: string;
  yourLocation: string;
  viewDetails: string;
  viewAll: string;
  viewAllMarkets: string;
  openInGoogleMaps: string;
  scheduleNotAvailable: string;
  locationNotAvailable: string;
  marketPhoto: string;
  directoryTitle: string;
  directorySubtitle: string;
  footerText: string;
  // Contribution CTA
  flaticonAttribution: string;
  suggestMarket: string;
  addMarketCta: string;

  // Suggest page
  suggestPageTitle: string;
  suggestPageSubtitle: string;
  suggestTypeNew: string;
  suggestTypeNewDesc: string;
  suggestTypeUpdate: string;
  suggestTypeUpdateDesc: string;
  suggestSelectMarket: string;
  suggestSelectMarketPlaceholder: string;
  suggestSearchMarket: string;
  suggestNoMarketFound: string;
  suggestYourEmail: string;
  suggestYourEmailPlaceholder: string;
  suggestYourEmailHint: string;
  suggestSubmit: string;
  suggestSuccessTitle: string;
  suggestSuccessBody: string;
  suggestAnother: string;

  // Location prompt
  enableLocationTitle: string;
  enableLocationDescription: string;
  enableLocationButton: string;
  skipLocationButton: string;
  chooseStateButton: string;
  showingTopMarkets: string;
  selectStatePromptTitle: string;
  selectStatePromptDescription: string;

  // Open status
  openNow: string;
  closedNow: string;

  // Market form (suggest page)
  formSectionBasicInfo: string;
  formSectionDetails: string;
  formSectionSchedule: string;
  formSectionLocation: string;
  formSectionAmenities: string;
  formFieldName: string;
  formFieldAddress: string;
  formFieldDistrict: string;
  formFieldState: string;
  formFieldStatus: string;
  formFieldDescription: string;
  formFieldAreaM2: string;
  formFieldTotalStalls: string;
  formFieldShopList: string;
  formFieldShopListPlaceholder: string;
  formFieldLatitude: string;
  formFieldLongitude: string;
  formFieldGmapsLink: string;
  formFieldToilet: string;
  formFieldPrayerRoom: string;
  formFieldParking: string;
  formFieldAccessibleParking: string;
  formFieldParkingNotes: string;
  formScheduleDays: string;
  formScheduleTimeSlots: string;
  formScheduleFrom: string;
  formScheduleTo: string;
  formScheduleNote: string;
  formScheduleAddTimeSlot: string;
  formScheduleAddSchedule: string;
  formScheduleSchedule: string;
  formMapPickerTitle: string;
  formMapPickerHint: string;
  formMapPickerSearch: string;
  formMapPickerSearchBtn: string;
  formMapPickerClear: string;
  formSaving: string;

  // About page paragraphs
  aboutPara1: string;
  aboutPara2: string;
  aboutPara3: string;
  aboutPara4: string;
  aboutPara5: string;
  aboutPara6: string;
  aboutPara7: string;
}

export const translations: Record<string, Translations> = {
  en: {
    // App/Home Titles
    appTitle: "Find Night Markets",
    heroTitle: "Find Your Nearest Night Market",
    heroDescription: "Explore Malaysian night markets with operating hours, amenities, and locations",
    homeSubtitle: "Discover night markets across Malaysia",
    featuredMarkets: "Featured Markets",
    searchResults: "Search Results",
    // Navigation
    home: "Home",
    markets: "Markets",
    mapView: "Map View",
    backToDirectory: "Back to Directory",
    about: "About",
    contributors: "Contributors",
    more: "More",
    github: "GitHub",
    languageLabel: "Language",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    showMore: "Show more",

    // Static Pages
    aboutTitle: "About",
    contributorsTitle: "Contributors",
    contributorsSubtitle: "People who help build this project.",

    // Quick Stats
    statsMarketsListed: "Markets Listed",
    statsWeeklyCoverage: "Weekly Coverage",
    statsNationwide: "Nationwide",
    days: "days",
    states: "states",

    // Search & Filters
    searchPlaceholder: "Search markets, locations, or addresses...",
    allStates: "All States",
    allDays: "All Days",
    smartSort: "Smart Sort (Nearest Open)",
    sortByName: "Sort by Name",
    sortByLocation: "Sort by Location",
    sortByStallCount: "Sort by Stall Count",
    sortByAreaSize: "Sort by Area Size",
    sortByDistance: "Sort by Distance",
    clearAllFilters: "Clear All",
    filtersAmenities: "Filters & Amenities",
    filters: "Filters",
    applyFilters: "Apply Filters",
    reset: "Reset",
    stateLabel: "State",
    dayLabel: "Day",
    dayOfWeekLabel: "Day of Week",

    // Amenities
    parkingAvailable: "Parking Available",
    accessibleParking: "Accessible Parking",
    toiletFacilities: "Toilet Facilities",
    prayerRoom: "Prayer Room",

    // Market Info
    operatingSchedule: "Operating Schedule",
    amenitiesFacilities: "Amenities & Facilities",
    shopList: "Stalls & Items",
    parking: "Parking",
    toilet: "Toilet",
    otherFacilities: "Other Facilities",
    locationAddress: "Location & Address",
    fullAddress: "Full Address",
    quickInfo: "Quick Info",
    totalStalls: "Total Stalls",
    areaSize: "Area Size",
    district: "District",
    state: "State",
    actions: "Actions",
    reportWrongInfo: "Report Wrong Info",
    getDirections: "Get Directions",
    showDirection: "Show Direction",
    shareMarket: "Share Market",
    findNearest: "Find Nearest",
    findNearestTitle: "Find Nearby Markets",
    findNearestDescription: "Use your current location to list the nearest markets.",
    searching: "Searching...",

    // Status
    available: "Available",
    notAvailable: "Not Available",
    active: "Active",
    accessible: "Accessible",

    // Units
    kmSquared: "km²",
    kmFromHere: "km from here",

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
    viewAll: "View All",
    viewAllMarkets: "View All Markets",
    openInGoogleMaps: "Open in Google Maps",
    scheduleNotAvailable: "Schedule not available",
    locationNotAvailable: "Location not available",
    marketPhoto: "Market Photo",
    directoryTitle: "Night Market Directory",
    directorySubtitle: "Browse all night markets across Malaysia",
    footerText: `© ${new Date().getFullYear()} Malaysia Night Market Directory. An open-source project for the community.`,
    flaticonAttribution: "Maps-and-location icons created by nawicon - Flaticon",
    // Contribution CTA
    suggestMarket: "Add or update a market",
    addMarketCta: "Know a market we missed or info to update? Submit it here.",

    // Suggest page
    suggestPageTitle: "Suggest a Market",
    suggestPageSubtitle:
      "Help us keep the directory up to date by suggesting a new market or an update to an existing one.",
    suggestTypeNew: "Suggest a New Market",
    suggestTypeNewDesc: "Know a pasar malam that isn't listed yet?",
    suggestTypeUpdate: "Update an Existing Market",
    suggestTypeUpdateDesc: "See outdated info? Help us fix it.",
    suggestSelectMarket: "Select market to update",
    suggestSelectMarketPlaceholder: "Search markets...",
    suggestSearchMarket: "Search market name...",
    suggestNoMarketFound: "No market found.",
    suggestYourEmail: "Your email (optional)",
    suggestYourEmailPlaceholder: "you@example.com",
    suggestYourEmailHint: "We may reach out if we need more info. We won't spam you.",
    suggestSubmit: "Submit Suggestion",
    suggestSuccessTitle: "Thank you for your suggestion!",
    suggestSuccessBody: "Our team will review it and update the directory if approved.",
    suggestAnother: "Submit another suggestion",

    // Location prompt
    enableLocationTitle: "See nearby markets",
    enableLocationDescription: "Turn on location to sort by distance and find the closest markets.",
    enableLocationButton: "Use my location",
    skipLocationButton: "Not now",
    chooseStateButton: "Choose state",
    showingTopMarkets: "Showing top 20 markets (enable location for nearest)",
    selectStatePromptTitle: "Select a state to explore markets",
    selectStatePromptDescription: "Choose a state from the dropdown, or enable location to see nearby markets.",

    // Open status
    openNow: "Open now",
    closedNow: "Closed",

    // Market form (suggest page)
    formSectionBasicInfo: "Basic Info",
    formSectionDetails: "Details",
    formSectionSchedule: "Operating Schedule",
    formSectionLocation: "Location",
    formSectionAmenities: "Amenities & Parking",
    formFieldName: "Market Name *",
    formFieldAddress: "Address *",
    formFieldDistrict: "District *",
    formFieldState: "State *",
    formFieldStatus: "Status",
    formFieldDescription: "Description",
    formFieldAreaM2: "Area (m²)",
    formFieldTotalStalls: "Total Stalls",
    formFieldShopList: "Stall Types",
    formFieldShopListPlaceholder: "e.g. Nasi Lemak, Rojak, Satay",
    formFieldLatitude: "Latitude",
    formFieldLongitude: "Longitude",
    formFieldGmapsLink: "Google Maps Link",
    formFieldToilet: "Toilet",
    formFieldPrayerRoom: "Prayer Room",
    formFieldParking: "Parking Available",
    formFieldAccessibleParking: "Accessible Parking",
    formFieldParkingNotes: "Parking Notes",
    formScheduleDays: "Operating Days",
    formScheduleTimeSlots: "Time Slots",
    formScheduleFrom: "From",
    formScheduleTo: "To",
    formScheduleNote: "Note (optional)",
    formScheduleAddTimeSlot: "Add Time Slot",
    formScheduleAddSchedule: "Add Schedule",
    formScheduleSchedule: "Schedule",
    formMapPickerTitle: "Pin Location on Map",
    formMapPickerHint: "Click on the map to set the market location, or search by address below.",
    formMapPickerSearch: "Search address...",
    formMapPickerSearchBtn: "Search",
    formMapPickerClear: "Clear pin",
    formSaving: "Submitting...",

    // About page
    aboutPara1: "Project background",
    aboutPara2:
      "During my time (Muaz, the owner) as a student at UiTM Perlis, I encountered a significant challenge in locating the nearest night market (pasar malam). Information available at the time was limited to general postings on social media (Facebook), which only provided vague locations and operating days.",
    aboutPara3:
      "Crucially, precise location details and specific operating hours were absent. This lack of accurate information required relying on guesswork, which could lead to wasted time, fuel, effort, and expense if the location was visited outside of operating hours.",
    aboutPara4:
      "This recurring issue prompted the conception of this project. The primary objective is to facilitate the search for night markets across Malaysia for the benefit of the public.",
    aboutPara5:
      "We sincerely hope this website will be a significant asset in your food exploration missions! We encourage you to share this project with your friends, family, neighbours, and even your cats! 😽",
    aboutPara6: "",
    aboutPara7: "",
  },
  ms: {
    // App/Home Titles
    appTitle: "Cari Pasar Malam",
    heroTitle: "Cari Pasar Malam Terdekat Anda",
    heroDescription: "Jelajahi pasar malam Malaysia dengan maklumat waktu operasi, kemudahan dan lokasi",
    homeSubtitle: "Terokai pasar malam di seluruh Malaysia",
    featuredMarkets: "Pasar Pilihan",
    searchResults: "Hasil Carian",
    // Navigation
    home: "Utama",
    markets: "Pasar",
    mapView: "Peta",
    backToDirectory: "Kembali ke Direktori",
    about: "Tentang",
    contributors: "Penyumbang",
    more: "Lagi",
    github: "GitHub",
    languageLabel: "Bahasa",
    lightMode: "Mod Cerah",
    darkMode: "Mod Gelap",
    showMore: "Tunjukkan lagi",

    // Static Pages
    aboutTitle: "Tentang",
    contributorsTitle: "Penyumbang",
    contributorsSubtitle: "Mereka yang membantu membangunkan projek ini.",

    // Quick Stats
    statsMarketsListed: "Jumlah Pasar Tersenarai",
    statsWeeklyCoverage: "Liputan Mingguan",
    statsNationwide: "Seluruh Negara",
    days: "hari",
    states: "negeri",

    // Search & Filters
    searchPlaceholder: "Cari pasar, lokasi, atau alamat...",
    allStates: "Semua Negeri",
    allDays: "Semua Hari",
    smartSort: "Susun Pintar (Terdekat dibuka)",
    sortByName: "Susun mengikut Nama",
    sortByLocation: "Susun mengikut Lokasi",
    sortByStallCount: "Susun mengikut Bilangan Gerai",
    sortByAreaSize: "Susun mengikut Saiz Kawasan",
    sortByDistance: "Susun mengikut Jarak",
    clearAllFilters: "Kosongkan Semua",
    filtersAmenities: "Penapis & Kemudahan",
    filters: "Penapis",
    applyFilters: "Guna Penapis",
    reset: "Set Semula",
    stateLabel: "Negeri",
    dayLabel: "Hari",
    dayOfWeekLabel: "Hari dalam Minggu",

    // Amenities
    parkingAvailable: "Tempat Letak Kereta Tersedia",
    accessibleParking: "Tempat Letak Kereta Mudah Akses",
    toiletFacilities: "Kemudahan Tandas",
    prayerRoom: "Surau",

    // Market Info
    operatingSchedule: "Jadual Operasi",
    amenitiesFacilities: "Kemudahan & Fasiliti",
    shopList: "Senarai Gerai/Item",
    parking: "Tempat Letak Kereta",
    toilet: "Tandas",
    otherFacilities: "Kemudahan Lain",
    locationAddress: "Lokasi & Alamat",
    fullAddress: "Alamat Penuh",
    quickInfo: "Maklumat Pantas",
    totalStalls: "Jumlah Gerai",
    areaSize: "Saiz Kawasan",
    district: "Daerah",
    state: "Negeri",
    actions: "Tindakan",
    reportWrongInfo: "Laporkan Maklumat Salah",
    getDirections: "Dapatkan Arah",
    showDirection: "Tunjuk Arah",
    shareMarket: "Kongsi Pasar",
    findNearest: "Cari Terdekat",
    findNearestTitle: "Cari Pasar Terdekat",
    findNearestDescription: "Guna lokasi semasa anda untuk senarai paling dekat.",
    searching: "Mencari...",

    // Status
    available: "Tersedia",
    notAvailable: "Tidak Tersedia",
    active: "Aktif",
    accessible: "Mudah Akses",

    // Units
    kmSquared: "km²",
    kmFromHere: "km dari sini",

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
    viewAll: "Lihat Semua",
    viewAllMarkets: "Lihat Semua Pasar",
    openInGoogleMaps: "Buka di Google Maps",
    scheduleNotAvailable: "Jadual tidak tersedia",
    locationNotAvailable: "Lokasi tidak tersedia",
    marketPhoto: "Foto Pasar",
    directoryTitle: "Direktori Pasar Malam",
    directorySubtitle: "Lihat semua pasar malam di seluruh Malaysia",
    footerText: `© ${new Date().getFullYear()} Direktori Pasar Malam Malaysia. Projek sumber terbuka untuk komuniti.`,
    flaticonAttribution: "Ikon peta dan lokasi dicipta oleh nawicon - Flaticon",
    // Contribution CTA
    suggestMarket: "Tambah atau kemas kini pasar",
    addMarketCta: "Tahu pasar baharu atau maklumat perlu dikemas kini? Hantar di sini.",

    // Suggest page
    suggestPageTitle: "Cadang Pasar",
    suggestPageSubtitle:
      "Bantu kami kemas kini direktori dengan mencadangkan pasar baharu atau kemas kini maklumat sedia ada.",
    suggestTypeNew: "Cadang Pasar Baharu",
    suggestTypeNewDesc: "Tahu pasar malam yang belum disenaraikan?",
    suggestTypeUpdate: "Kemas Kini Pasar Sedia Ada",
    suggestTypeUpdateDesc: "Nampak maklumat lapuk? Bantu kami betulkan.",
    suggestSelectMarket: "Pilih pasar untuk dikemas kini",
    suggestSelectMarketPlaceholder: "Cari pasar...",
    suggestSearchMarket: "Cari nama pasar...",
    suggestNoMarketFound: "Tiada pasar dijumpai.",
    suggestYourEmail: "E-mel anda (pilihan)",
    suggestYourEmailPlaceholder: "anda@contoh.com",
    suggestYourEmailHint: "Kami mungkin menghubungi anda jika perlu maklumat lanjut. Kami tidak akan menghantar spam.",
    suggestSubmit: "Hantar Cadangan",
    suggestSuccessTitle: "Terima kasih atas cadangan anda!",
    suggestSuccessBody: "Pasukan kami akan menyemak dan mengemas kini direktori jika diluluskan.",
    suggestAnother: "Hantar cadangan lain",

    // Location prompt
    enableLocationTitle: "Lihat pasar berdekatan",
    enableLocationDescription: "Hidupkan lokasi untuk susun ikut jarak dan cari pasar terdekat.",
    enableLocationButton: "Guna lokasi saya",
    skipLocationButton: "Lain kali",
    chooseStateButton: "Pilih negeri",
    showingTopMarkets: "Menunjukkan 20 pasar teratas (hidupkan lokasi untuk terdekat)",
    selectStatePromptTitle: "Pilih negeri untuk terokai pasar",
    selectStatePromptDescription: "Pilih negeri dari senarai, atau hidupkan lokasi untuk lihat pasar berdekatan.",

    // Open status
    openNow: "Dibuka sekarang",
    closedNow: "Tutup",

    // Market form (suggest page)
    formSectionBasicInfo: "Maklumat Asas",
    formSectionDetails: "Butiran",
    formSectionSchedule: "Jadual Operasi",
    formSectionLocation: "Lokasi",
    formSectionAmenities: "Kemudahan & Tempat Letak Kereta",
    formFieldName: "Nama Pasar *",
    formFieldAddress: "Alamat *",
    formFieldDistrict: "Daerah *",
    formFieldState: "Negeri *",
    formFieldStatus: "Status",
    formFieldDescription: "Penerangan",
    formFieldAreaM2: "Keluasan (m²)",
    formFieldTotalStalls: "Jumlah Gerai",
    formFieldShopList: "Jenis Gerai",
    formFieldShopListPlaceholder: "cth. Nasi Lemak, Rojak, Satay",
    formFieldLatitude: "Latitud",
    formFieldLongitude: "Longitud",
    formFieldGmapsLink: "Pautan Google Maps",
    formFieldToilet: "Tandas",
    formFieldPrayerRoom: "Surau",
    formFieldParking: "Tempat Letak Kereta",
    formFieldAccessibleParking: "Tempat Letak Kereta OKU",
    formFieldParkingNotes: "Nota Tempat Letak Kereta",
    formScheduleDays: "Hari Operasi",
    formScheduleTimeSlots: "Slot Masa",
    formScheduleFrom: "Dari",
    formScheduleTo: "Hingga",
    formScheduleNote: "Nota (pilihan)",
    formScheduleAddTimeSlot: "Tambah Slot Masa",
    formScheduleAddSchedule: "Tambah Jadual",
    formScheduleSchedule: "Jadual",
    formMapPickerTitle: "Tandakan Lokasi di Peta",
    formMapPickerHint: "Klik pada peta untuk tetapkan lokasi pasar, atau cari mengikut alamat di bawah.",
    formMapPickerSearch: "Cari alamat...",
    formMapPickerSearchBtn: "Cari",
    formMapPickerClear: "Buang pin",
    formSaving: "Menghantar...",

    // About page (Malay)
    aboutPara1: "Latar Belakang Projek",
    aboutPara2: "Masa saya(Muaz) duduk di UiTM Perlis, tak tahu mana pasar malam yang terdekat.",
    aboutPara3: "Ada pun time tu, hanya post dalam FB lokasi pasar secara kasar, dah hari operasi.",
    aboutPara4: "Takde lokasi yang tepat dan masa operasi.",
    aboutPara5:
      "Takkan nak terjah je ke tempat tu kan? Buatnya datang tapi takde orang. Kan dah bazir masa, minyak, tenaga, duit.",
    aboutPara6:
      "Maka saya pun terfikir la nak buat projek ni untuk memudahkan orang cari pasar malam di sekitar Malaysia.",
    aboutPara7:
      "Harap projek ini membantu dalam misi food hunting anda! Jangan lupa share kat kawan2, family, jiran, sepupu, sepapat, keluarga mentua dan anak2 bulus 😽",
  },
};

export function useTranslation(locale = "ms") {
  return translations[locale] || translations.ms || translations.en;
}

import { DayCode } from "@/app/enums";
// Helpers to format weekday codes and schedule rules
import type { Weekday, MarketSchedule } from "@/lib/markets-data";

export function formatWeekday(code: DayCode, locale: string = "ms"): string {
  const t = translations[locale] || translations.ms;
  switch (code) {
    case DayCode.Mon:
      return t.monday;
    case DayCode.Tue:
      return t.tuesday;
    case DayCode.Wed:
      return t.wednesday;
    case DayCode.Thu:
      return t.thursday;
    case DayCode.Fri:
      return t.friday;
    case DayCode.Sat:
      return t.saturday;
    case DayCode.Sun:
      return t.sunday;
    default:
      return code;
  }
}

export function formatWeekdayList(codes: DayCode[], locale: string = "ms"): string {
  return codes.map((c) => formatWeekday(c, locale)).join(", ");
}

export function formatScheduleRule(rule: MarketSchedule, locale: string = "ms"): string {
  const dayText = formatWeekdayList(rule.days, locale);
  const timeText = rule.times.map((t) => `${t.start}-${t.end}`).join(", ");
  return `${dayText} ${timeText}`;
}
