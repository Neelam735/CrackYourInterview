"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "./ProgressProvider";
import { useAuthEnabled } from "./Providers";

export function MarkComplete({ slug }: { slug: string }) {
  const { completed, setLessonCompleted, storage } = useProgress();
  const authEnabled = useAuthEnabled();
  const pathname = usePathname();
  const done = completed.has(slug);

  return (
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="font-semibold">{done ? "Lesson complete" : "Finished this lesson?"}</div>
        <div className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {storage === "account" ? (
            "Progress is saved to your account."
          ) : authEnabled ? (
            <>
              Progress is saved in this browser.{" "}
              <Link
                href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Sign in
              </Link>{" "}
              to keep it across devices.
            </>
          ) : (
            "Progress is saved in this browser."
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setLessonCompleted(slug, !done)}
        aria-pressed={done}
        className={
          done
            ? "inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
            : "inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        }
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <path d="M5 13l4 4L19 7" />
        </svg>
        {done ? "Completed" : "Mark as complete"}
      </button>
    </div>
  );
}
