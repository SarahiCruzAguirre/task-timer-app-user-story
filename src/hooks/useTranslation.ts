// hooks/useTranslation.ts
"use client";

/**
 * RE-EXPORT useTranslation HOOK
 * ---------------------------------------------------------------------------
 * This file re-exports the `useTranslation` hook from our i18nContext.
 * Keeping custom hooks in the `src/hooks` directory is a common project convention,
 * making imports cleaner and matching the folder structure.
 */

export { useTranslation } from "@/i18n/i18nContext";
