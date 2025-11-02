"use client"

import { useLanguage } from "@/components/language-provider"

export default function AboutClient() {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t.aboutTitle}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>{t.aboutPara1}</p>
        <p>{t.aboutPara2}</p>
        <p>{t.aboutPara3}</p>
        <p>{t.aboutPara4}</p>
        <p>{t.aboutPara5}</p>
        <p>{t.aboutPara6}</p>
        <p>{t.aboutPara7}</p>
      </div>
    </div>
  )
}
