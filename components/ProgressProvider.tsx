"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "progress:code";

type ProgressContextValue = {
  completed: Set<string>;
  setLessonCompleted: (slug: string, done: boolean) => void;
  /** "account" once progress is synced to the signed-in user, otherwise "browser". */
  storage: "account" | "browser";
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readLocal(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeLocal(slugs: Iterable<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
  } catch {}
}

function clearLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Signed out, progress lives in this browser. On sign-in it's merged into the
// account and the local copy is cleared, so the next person on a shared
// computer doesn't inherit it.
export function ProgressProvider({
  signedIn,
  userId,
  children,
}: {
  signedIn: boolean;
  userId?: string;
  children: React.ReactNode;
}) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [storage, setStorage] = useState<"account" | "browser">("browser");

  useEffect(() => {
    if (!signedIn) {
      setStorage("browser");
      setCompleted(new Set(readLocal()));
      return;
    }

    let cancelled = false;
    fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: readLocal() }),
    })
      .then((res) => (res.ok ? (res.json() as Promise<{ completed: string[] }>) : null))
      .then((data) => {
        if (cancelled) return;
        if (data) {
          clearLocal();
          setStorage("account");
          setCompleted(new Set(data.completed));
        } else {
          // No database configured: keep using browser storage.
          setStorage("browser");
          setCompleted(new Set(readLocal()));
        }
      })
      .catch(() => {
        if (!cancelled) setCompleted(new Set(readLocal()));
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn, userId]);

  const setLessonCompleted = useCallback(
    (slug: string, done: boolean) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (done) next.add(slug);
        else next.delete(slug);
        if (storage === "browser") writeLocal(next);
        return next;
      });
      if (storage === "account") {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, completed: done }),
        })
          .then((res) => (res.ok ? (res.json() as Promise<{ completed: string[] }>) : null))
          .then((data) => data && setCompleted(new Set(data.completed)))
          .catch(() => {});
      }
    },
    [storage],
  );

  const value = useMemo(() => ({ completed, setLessonCompleted, storage }), [completed, setLessonCompleted, storage]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used inside <ProgressProvider>");
  return value;
}
