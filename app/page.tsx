import Link from "next/link";
import { codeNavigation } from "@/lib/navigation";

const features = [
  {
    title: "Patterns, not memorization",
    body: "Most interview questions are variations of a dozen patterns. Learn to recognize the pattern and the solution follows.",
  },
  {
    title: "Step-through visualizations",
    body: "Watch pointers move, windows slide and stacks grow, one decision at a time, with the reasoning for every step.",
  },
  {
    title: "Interview-ready explanations",
    body: "Each problem goes from brute force to optimal, with the complexity analysis and talking points interviewers expect.",
  },
];

export default function HomePage() {
  const patterns = codeNavigation.find((section) => section.title === "Patterns")?.items ?? [];

  return (
    <main>
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-brand-100),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-brand-900)_50%,transparent),transparent_60%)]" />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="mb-4 inline-block rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
            Free coding interview course
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Crack the coding interview
            <br />
            <span className="text-brand-600 dark:text-brand-400">one pattern at a time</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Learn the algorithm patterns behind the most common interview questions, with interactive walkthroughs
            that show exactly how each solution works.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/learn/code"
              className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Start learning
            </Link>
            <Link
              href="/learn/code/two-pointers"
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
            >
              Try a visualization
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{feature.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Coding patterns</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Work through them in order, or jump to the one you need.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patterns.map((pattern, index) =>
            pattern.comingSoon ? (
              <div
                key={pattern.slug}
                className="rounded-xl border border-dashed border-slate-300 p-5 text-slate-400 dark:border-slate-700 dark:text-slate-600"
              >
                <span className="font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-1 font-semibold">{pattern.title}</h3>
                <p className="mt-1 text-sm">Coming soon</p>
              </div>
            ) : (
              <Link
                key={pattern.slug}
                href={`/learn/code/${pattern.slug}`}
                className="group rounded-xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md dark:border-slate-800 dark:hover:border-brand-600"
              >
                <span className="font-mono text-xs text-brand-600 dark:text-brand-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {pattern.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Read the guide →</p>
              </Link>
            ),
          )}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © {new Date().getFullYear()} CrackYourInterview
      </footer>
    </main>
  );
}
