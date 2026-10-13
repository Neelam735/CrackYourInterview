const difficultyStyles = {
  Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  Hard: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
} as const;

export function Difficulty({ level }: { level: keyof typeof difficultyStyles }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyStyles[level]}`}>{level}</span>
  );
}

// The problem statement box shown at the top of each worked problem.
export function Problem({
  difficulty,
  link,
  children,
}: {
  difficulty: keyof typeof difficultyStyles;
  link?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose my-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Difficulty level={difficulty} />
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Practice on LeetCode ↗
          </a>
        )}
      </div>
      <div className="space-y-3 text-[15px] leading-7 text-slate-700 dark:text-slate-300 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] dark:[&_code]:bg-slate-800 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-50 [&_pre]:p-3 [&_pre]:text-sm dark:[&_pre]:bg-slate-950 [&_strong]:text-slate-900 dark:[&_strong]:text-white">
        {children}
      </div>
    </div>
  );
}

export function Complexity({ time, space }: { time: string; space: string }) {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-3">
      {[
        ["Time", time],
        ["Space", space],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
          <div className="mt-1 font-mono text-lg font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}
