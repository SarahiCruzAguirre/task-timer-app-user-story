// components/LanguageSwitcher.tsx
"use client";

/**
 * LANGUAGE SWITCHER COMPONENT
 * ---------------------------------------------------------------------------
 * This component provides an interface for toggling the application's locale
 * between English (en) and Spanish (es).
 * 
 * HOW IT WORKS:
 * 1. Hook Integration: We consume the `useTranslation` hook to get the active
 *    `locale` and the state setter `setLocale`.
 * 2. Visual Buttons: It renders a small pill container containing two buttons
 *    ("ES" and "EN").
 * 3. Conditional Styling: The active locale button receives a solid purple
 *    gradient, while the inactive button remains transparent and faded.
 * 4. Interaction: Clicking a button invokes `setLocale(lang)`, triggering the
 *    React Context to update the dictionary, which instantly translates all
 *    `t()` keys on the screen.
 */

import { useTranslation } from "@/hooks/useTranslation";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-bg-input border border-border-main p-1 rounded-xl">
      {/* Spanish Language Toggle Button */}
      <button
        onClick={() => setLocale("es")}
        className={`min-w-0 px-2 h-7 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
          locale === "es"
            ? "bg-linear-to-r from-purple-700 to-purple-900 text-white shadow"
            : "text-text-muted hover:text-text-main hover:bg-bg-card-hover"
        }`}
      >
        ES
      </button>

      {/* English Language Toggle Button */}
      <button
        onClick={() => setLocale("en")}
        className={`min-w-0 px-2 h-7 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
          locale === "en"
            ? "bg-linear-to-r from-purple-700 to-purple-900 text-white shadow"
            : "text-text-muted hover:text-text-main hover:bg-bg-card-hover"
        }`}
      >
        EN
      </button>
    </div>
  );
}
