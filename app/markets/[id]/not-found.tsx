import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <MapPin className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Pasar Tidak Dijumpai</CardTitle>
            <CardDescription>Pasar yang anda cari tiada atau mungkin telah dipadam.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/markets">
              <Button className="w-full">Lihat Semua Pasar</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Kembali ke Laman Utama
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
