import { getAllMarkets } from "@/lib/markets-data"
import HomepageClient from "@/components/homepage-client"

export default function HomePage() {
  const markets = getAllMarkets()
  
  return <HomepageClient markets={markets} />
}
