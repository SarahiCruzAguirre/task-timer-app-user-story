// app/i18n/i18nContext.tsx
"use client";

/**
 * INTERNATIONALIZATION (i18n) CONTEXT PROVIDER
 * ---------------------------------------------------------------------------
 * This file sets up a lightweight, context-based internationalization system
 * for client-side components in our Next.js application.
 * 
 * WHY THIS APPROACH?
 * Next.js App Router projects often require complex setup for libraries like
 * next-intl (which alters routes, e.g., /en/about or /es/about, complicating
 * links). By creating a simple custom React Context, we can toggle languages
 * globally and instantaneously on the client without modifying URLs or
 * breaking existing routes.
 * 
 * HOW IT WORKS:
 * 1. Locale State: We maintain the selected language ("en" or "es") in React state,
 *    persisted in localStorage so the user's preference survives refreshes.
 * 2. Dictionaries: We statically import English (en.json) and Spanish (es.json)
 *    translation files.
 * 3. Translation Helper (t): We expose a translate function `t(key)` that looks
 *    up the key in the active dictionary and returns the matching translation.
 *    If the key is missing, it falls back to the key name.
 */

import React, { createContext, useState, useEffect, useContext } from "react";
import en from "./locales/en.json";
import es from "./locales/es.json";

// Define the supported locales
export type Locale = "en" | "es";

// Map dictionaries to locales
const translations = { en, es };

// Type definition for the Translation Context
interface I18nContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// Create the Context with default empty values
const I18nContext = createContext<I18nContextProps | undefined>(undefined);

// Local Storage Key to persist language selection
const LOCAL_STORAGE_LANG_KEY = "taskos_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Locale state, default to Spanish ("es") as the initial page language
  const [locale, setLocaleState] = useState<Locale>("es");

  // Read saved locale from localStorage on mount (client-side only)
  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCAL_STORAGE_LANG_KEY) as Locale;
    if (savedLocale === "en" || savedLocale === "es") {
      setLocaleState(savedLocale);
    }
  }, []);

  // Update locale state and persist the choice in localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY, newLocale);
  };

  // The 't' translation function: looks up keys in the current locale dictionary
  const t = (key: string): string => {
    const dictionary = translations[locale] as Record<string, string>;
    return dictionary[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Custom hook to consume the i18n Context in any component
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
