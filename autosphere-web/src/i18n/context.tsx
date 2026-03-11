import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { t as translate, type Locale, LOCALES } from './translations'

const LOCALE_STORAGE_KEY = 'autosphere-locale'

function loadStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
    if (stored && LOCALES.includes(stored)) return stored
  } catch {
    /* ignore */
  }
  return 'en'
}

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const LOCALE_TO_LANG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  hi: 'hi',
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadStoredLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    } catch {
      /* ignore */
    }
  }, [])

  // Apply locale to whole document so the website shifts to that language
  useEffect(() => {
    document.documentElement.lang = LOCALE_TO_LANG[locale] ?? locale
  }, [locale])

  const t = useCallback(
    (key: string) => translate(locale, key),
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function getStoredLocale(): Locale {
  return loadStoredLocale()
}
