import { useState, useEffect } from "react";

// Small hook that mirrors state to `localStorage`.
// Returns a tuple `[value, setValue]` and keeps data persistent between reloads.
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // On server render, return the initial value
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      // If parsing fails, fall back to initial value
      return initialValue;
    }
  });

  // Persist changes to localStorage when `storedValue` updates
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignore localStorage write errors (e.g., quota exceeded)
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
