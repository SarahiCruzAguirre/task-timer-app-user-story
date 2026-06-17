// app/providers.tsx
"use client";

/**
 * GLOBAL CUSTOM PROVIDERS CONFIGURATION
 * ---------------------------------------------------------------------------
 * This file wraps the root layout with all the client-side state providers
 * needed by our Next.js App Router application.
 * 
 * PROVIDERS WRAPPED:
 * 1. NextThemesProvider: Manages theme transitions (switching CSS classes e.g. 
 *    "dark" and "light" on the <html> element) and reads user system settings.
 * 2. I18nProvider: Our custom translation context provider that lets any child
 *    component access translations via `useTranslation()` and the `t()` helper.
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { I18nProvider } from "@/i18n/i18nContext";

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        {children}
      </I18nProvider>
    </NextThemesProvider>
  );
}