import Link from "next/link";
import type { Doc } from "@/lib/content";
import type { NavItem } from "@/lib/navigation";
import { MarkComplete } from "./MarkComplete";
import { MDXContent } from "./mdx/MDXContent";
import { Difficulty } from "./mdx/Problem";
import { TableOfContents } from "./TableOfContents";

export function DocPage({
  doc,
  basePath,
  prev,
  next,
}: {
  doc: Doc;
  basePath: string;
  prev: NavItem | null;
  next: NavItem | null;
}) {
  const { frontmatter } = doc;

  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1 py-10">
        <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{frontmatter.title}</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{frontmatter.description}</p>
          {(frontmatter.difficulty || frontmatter.readingTime) && (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              {frontmatter.difficulty && <Difficulty level={frontmatter.difficulty} />}
              {frontmatter.readingTime && <span>{frontmatter.readingTime} read</span>}
            </div>
          )}
        </header>

        <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-headings:tracking-tight prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-pre:bg-transparent prose-pre:p-0">
          <MDXContent source={doc.body} />
        </div>

        <MarkComplete slug={doc.slug} />

        <nav className="mt-8 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2 dark:border-slate-800">
          {prev ? (
            <PagerLink href={`${basePath}/${prev.slug}`} label="Previous" title={prev.title} />
          ) : (
            <span />
          )}
          {next && <PagerLink href={`${basePath}/${next.slug}`} label="Next" title={next.title} alignRight />}
        </nav>
      </article>

      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-10">
          <TableOfContents headings={doc.headings} />
        </div>
      </aside>
    </div>
  );
}

function PagerLink({ href, label, title, alignRight }: { href: string; label: string; title: string; alignRight?: boolean }) {
  return (
    <Link
      href={href}
      className={`group rounded-xl border border-slate-200 p-4 hover:border-brand-400 dark:border-slate-800 dark:hover:border-brand-600 ${
        alignRight ? "text-right sm:col-start-2" : ""
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
        {alignRight ? `${title} →` : `← ${title}`}
      </div>
    </Link>
  );
}
