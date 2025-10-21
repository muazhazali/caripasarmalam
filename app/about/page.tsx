import type { Metadata } from "next"
import { cookies } from "next/headers"
import { useTranslation } from "@/lib/i18n"

export const metadata: Metadata = {
  title: "About | Cari Pasar Malam Malaysia",
}

export default async function AboutPage() {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get("language")?.value
  const lang = cookieLang === "en" ? "en" : "ms"
  const t = useTranslation(lang)
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t.aboutTitle}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Latar Belakang Projek
        </p>
        <p>
          Masa saya duduk di UiTM Perlis, tak tahu mana pasar malam yang terdekat. 
        </p>
        <p>
          Ada pun time tu, hanya post dalam FB lokasi pasar secara kasar, dah hari operasi. 
        </p>
        <p>
          Takde lokasi yang tepat dan masa operasi.
        </p>
        <p>
          Takkan nak terjah je ke tempat tu kan? Buatnya datang tapi takde orang. Kan dah bazir masa, minyak, tenaga, duit. Huhu
        </p>
        <p>
          Maka saya pun terfikir la nak buat projek ni untuk memudahkan orang cari pasar malam di sekitar Malaysia.
        </p>
        <br />
        <p>
          Harap projek ini membantu dalam misi food hunting anda!
          <br />
          Jangan lupa share kat kawan2, family, jiran, sepupu, sepapat, keluarga mentua dan kucing sebelah rumah 😽
        </p>
      </div>
    </div>
  )
}


