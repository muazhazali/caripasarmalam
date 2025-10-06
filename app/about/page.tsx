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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante
          dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.
          Fusce nec tellus sed augue semper porta.
        </p>
        <p>
          Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat
          condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
          himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum
          ante quis turpis.
        </p>
        <p>
          Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum
          sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus.
        </p>
      </div>
    </div>
  )
}


