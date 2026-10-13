"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    // The active heading is the last one scrolled past the sticky header.
    function update() {
      let current = headings[0]?.id ?? null;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el && el.getBoundingClientRect().top <= 120) current = heading.id;
      }
      setActiveId(current);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        On this page
      </h3>
      <ul className="border-l border-slate-200 dark:border-slate-800">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`-ml-px block border-l-2 py-1 ${heading.depth === 3 ? "pl-6" : "pl-3"} ${
                activeId === heading.id
                  ? "border-brand-600 font-medium text-brand-700 dark:text-brand-300"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
