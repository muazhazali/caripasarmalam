"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "@/lib/i18n"

interface LanguageContextValue {
  language: string
  setLanguage: (code: string) => void
  t: ReturnType<typeof useTranslation>
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children, initialLanguage = "ms" }: { children: React.ReactNode; initialLanguage?: string }) {
  const [language, setLanguageState] = useState<string>(initialLanguage)

  const t = useTranslation(language)

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("language", code)
        // Persist cookie for SSR to pick up on next server render
        document.cookie = `language=${code}; path=/; max-age=${60 * 60 * 24 * 365}`
      } catch {}
    }
  }, [])

  useEffect(() => {
    // Sync from localStorage if user had a preference and cookie/server value differed.
    try {
      const stored = localStorage.getItem("language")
      if (stored && stored !== language) setLanguageState(stored)
    } catch {}

    function handleStorage(e: StorageEvent) {
      if (e.key === "language" && e.newValue) setLanguageState(e.newValue)
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}


