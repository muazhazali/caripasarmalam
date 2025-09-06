import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <MapPin className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Market Not Found</CardTitle>
            <CardDescription>The market you're looking for doesn't exist or may have been removed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/markets">
              <Button className="w-full">Browse All Markets</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
