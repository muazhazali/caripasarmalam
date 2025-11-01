"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "@/lib/i18n"

interface LanguageContextValue {
  language: string
  setLanguage: (code: string) => void
  t: ReturnType<typeof useTranslation>
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({
  children,
  initialLanguage = "ms"
}: {
  children: React.ReactNode
  initialLanguage?: string
}) {
  const [language, setLanguageState] = useState<string>(initialLanguage)

  const t = useTranslation(language)

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code)
    if (typeof window !== "undefined") localStorage.setItem("language", code)
    // Also set a cookie so server-rendered pages can read the preference
    if (typeof document !== "undefined") {
      try {
        // 1 year
        document.cookie = `language=${code}; path=/; max-age=${60 * 60 * 24 * 365}`
      } catch (e) {
        // ignore
      }
    }
  }, [])

  // Sync with localStorage after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language")
      if (storedLanguage && storedLanguage !== language) {
        setLanguageState(storedLanguage)
        // keep server cookie in sync when hydrating
        if (typeof document !== "undefined") {
          try {
            document.cookie = `language=${storedLanguage}; path=/; max-age=${60 * 60 * 24 * 365}`
          } catch (e) {
            /* ignore */
          }
        }
      }
    }
  }, [language])

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "language" && e.newValue) setLanguageState(e.newValue)
    }
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage)
      return () => window.removeEventListener("storage", handleStorage)
    }
  }, [])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}


