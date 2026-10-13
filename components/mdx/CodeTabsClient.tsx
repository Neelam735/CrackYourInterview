"use client";

import { Children, type ReactNode } from "react";
import { setCodeLanguage, useCodeLanguage } from "@/lib/useCodeLanguage";

const labels: Record<string, string> = {
  python: "Python",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
};

export function CodeTabsClient({ languages, children }: { languages: string[]; children: ReactNode }) {
  const preferred = useCodeLanguage();
  const blocks = Children.toArray(children);
  const active = languages.includes(preferred) ? preferred : languages[0];

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-2 pt-2 dark:border-slate-800">
        {languages.map((language) => (
          <button
            key={language}
            type="button"
            role="tab"
            aria-selected={language === active}
            onClick={() => setCodeLanguage(language)}
            className={`-mb-px whitespace-nowrap rounded-t-lg border-b-2 px-3 py-1.5 text-sm font-medium ${
              language === active
                ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {labels[language] ?? language}
          </button>
        ))}
      </div>
      {blocks.map((block, i) => (
        <div key={languages[i]} role="tabpanel" hidden={languages[i] !== active} className="code-tab-panel">
          {block}
        </div>
      ))}
    </div>
  );
}
