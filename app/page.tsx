import { getMarkets } from "@/lib/db"
import HomepageClient from "@/components/homepage-client"

interface HomePageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Extract filters from URL searchParams
  const state = searchParams?.state as string | undefined
  const day = searchParams?.day as string | undefined

  // Map localized day names to day codes
  const dayMap: Record<string, string> = {
    "Isnin": "mon",
    "Selasa": "tue",
    "Rabu": "wed",
    "Khamis": "thu",
    "Jumaat": "fri",
    "Sabtu": "sat",
    "Ahad": "sun",
  }
  
  const dayCode = day && dayMap[day] ? (dayMap[day] as any) : undefined

  // Fetch markets with server-side filters
  const filters = {
    state: state && state !== "All States" && state !== "Semua Negeri" ? state : undefined,
    day: dayCode,
    status: "Active" as const,
    limit: 50, // Initial load limit
  }

  const markets = await getMarkets(filters)
  
  return <HomepageClient initialMarkets={markets} initialState={state} />
}
