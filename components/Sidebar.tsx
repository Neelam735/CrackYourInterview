"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection } from "@/lib/navigation";

export function Sidebar({ basePath, sections }: { basePath: string; sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-8 text-sm">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {section.title}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const href = `${basePath}/${item.slug}`;
              const active = pathname === href || (item.slug === "introduction" && pathname === basePath);

              if (item.comingSoon) {
                return (
                  <li key={item.slug}>
                    <span className="flex items-center justify-between rounded-md px-3 py-1.5 text-slate-400 dark:text-slate-600">
                      {item.title}
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase dark:bg-slate-800">
                        Soon
                      </span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "block rounded-md bg-brand-50 px-3 py-1.5 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                        : "block rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    }
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
