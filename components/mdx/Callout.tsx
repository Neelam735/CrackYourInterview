const styles = {
  tip: {
    label: "Tip",
    className: "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
  },
  info: {
    label: "Note",
    className: "border-brand-300 bg-brand-50 text-brand-950 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-100",
  },
  warning: {
    label: "Watch out",
    className: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
  },
  interview: {
    label: "In the interview",
    className: "border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100",
  },
} as const;

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof styles;
  title?: string;
  children: React.ReactNode;
}) {
  const style = styles[type];
  return (
    <div className={`not-prose my-6 rounded-xl border-l-4 px-5 py-4 text-[15px] leading-7 ${style.className}`}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-80">{title ?? style.label}</p>
      <div className="[&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] dark:[&_code]:bg-white/10 [&>p+p]:mt-3">
        {children}
      </div>
    </div>
  );
}
