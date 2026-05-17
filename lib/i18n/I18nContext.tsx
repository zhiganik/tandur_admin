'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en, { Translations } from './locales/en';

type Locale = 'en';

const locales: Record<Locale, Translations> = { en };

interface I18nContextValue {
  t: Translations;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: { value: Locale; label: string }[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_KEY = 'tandur-locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (stored && locales[stored]) setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(LOCALE_KEY, l);
  };

  return (
    <I18nContext.Provider
      value={{
        t: locales[locale],
        locale,
        setLocale,
        availableLocales: [{ value: 'en', label: 'EN' }],
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
