"use client";

import { useSyncExternalStore } from "react";

// The reader's preferred language, shared by every <CodeTabs> on the site
// and remembered across visits.
const STORAGE_KEY = "code-language";
const DEFAULT_LANGUAGE = "python";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setCodeLanguage(language: string) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {}
  listeners.forEach((listener) => listener());
}

export function useCodeLanguage(): string {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_LANGUAGE);
}
