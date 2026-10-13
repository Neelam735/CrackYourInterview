"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CODE_BASE, type Difficulty, type NavSection } from "@/lib/navigation";
import { useProgress } from "./ProgressProvider";

const difficultyDot: Record<Difficulty, string> = {
  Easy: "bg-emerald-500",
  Medium: "bg-amber-500",
  Hard: "bg-rose-500",
};

function Check() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-emerald-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-label="Completed"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function Sidebar({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const { completed } = useProgress();
  const activeRef = useRef<HTMLAnchorElement>(null);

  const currentSection = sections.find((s) => pathname.startsWith(`${CODE_BASE}/${s.slug}/`))?.slug;
  const [open, setOpen] = useState<Set<string>>(() => new Set(currentSection ? [currentSection] : []));

  // Opening a page always expands its section.
  useEffect(() => {
    if (currentSection) setOpen((prev) => (prev.has(currentSection) ? prev : new Set(prev).add(currentSection)));
  }, [currentSection]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const total = sections.reduce((sum, s) => sum + s.pages.length, 0);
  const totalDone = sections.reduce(
    (sum, s) => sum + s.pages.filter((p) => completed.has(`${s.slug}/${p.slug}`)).length,
    0,
  );

  return (
    <nav className="text-sm">
      <div className="mb-6 px-3">
        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Your progress</span>
          <span>
            {totalDone} / {total}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(totalDone / Math.max(total, 1)) * 100}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1">
        {sections.map((section) => {
          const isOpen = open.has(section.slug);
          const done = section.pages.filter((p) => completed.has(`${section.slug}/${p.slug}`)).length;
          const allDone = done === section.pages.length;
          return (
            <li key={section.slug}>
              <button
                type="button"
                onClick={() => toggle(section.slug)}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  section.slug === currentSection ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <svg
                  className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span className="flex-1">{section.title}</span>
                {allDone ? (
                  <Check />
                ) : (
                  <span className="font-mono text-[11px] font-normal text-slate-400">
                    {done}/{section.pages.length}
                  </span>
                )}
              </button>

              {isOpen && (
                <ul className="mb-2 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 ml-5 dark:border-slate-800">
                  {section.pages.map((page) => {
                    const href = `${CODE_BASE}/${section.slug}/${page.slug}`;
                    const active = pathname === href;
                    const isDone = completed.has(`${section.slug}/${page.slug}`);
                    return (
                      <li key={page.slug}>
                        <Link
                          ref={active ? activeRef : undefined}
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-2 rounded-md py-1.5 pr-2 ${
                            page.kind === "problem" ? "pl-5" : "pl-2 font-medium"
                          } ${
                            active
                              ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                          }`}
                        >
                          {page.difficulty && (
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${difficultyDot[page.difficulty]}`}
                              title={page.difficulty}
                            />
                          )}
                          <span className="flex-1">{page.title}</span>
                          {isDone && <Check />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
