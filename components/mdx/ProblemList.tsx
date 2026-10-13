"use client";

import Link from "next/link";
import { useProgress } from "@/components/ProgressProvider";
import { CODE_BASE, codeNavigation } from "@/lib/navigation";
import { Difficulty } from "./Problem";

// Lists a section's problem pages, e.g. <ProblemList section="two-pointers" />.
export function ProblemList({ section }: { section: string }) {
  const { completed } = useProgress();
  const nav = codeNavigation.find((s) => s.slug === section);
  if (!nav) return null;
  const problems = nav.pages.filter((page) => page.kind === "problem");

  return (
    <div className="not-prose my-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
      {problems.map((page) => {
        const id = `${section}/${page.slug}`;
        return (
          <Link
            key={page.slug}
            href={`${CODE_BASE}/${id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                completed.has(id) ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-700"
              }`}
              aria-label={completed.has(id) ? "Completed" : "Not completed"}
            >
              {completed.has(id) && (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="flex-1 font-medium">{page.title}</span>
            {page.difficulty && <Difficulty level={page.difficulty} />}
          </Link>
        );
      })}
    </div>
  );
}
