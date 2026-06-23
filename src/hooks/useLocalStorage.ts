import { useState, useEffect } from "react";

/**
 * A custom hook to synchronize state with localStorage.
 * Automatically saves the value whenever it changes, and restores it on mount.
 */
export function useLocalStorageState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch (err) {
      console.error(`Error parsing localStorage key "${key}":`, err);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error(`Error setting localStorage key "${key}":`, err);
    }
  }, [key, state]);

  return [state, setState];
}
