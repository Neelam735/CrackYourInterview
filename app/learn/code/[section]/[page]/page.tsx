import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/DocPage";
import { getDoc } from "@/lib/content";
import { findPage, flatPages, getAdjacent } from "@/lib/navigation";

type Props = { params: Promise<{ section: string; page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return flatPages.map((page) => ({ section: page.section.slug, page: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, page } = await params;
  const doc = getDoc("code", `${section}/${page}`);
  if (!doc) return {};
  const nav = findPage(section, page);
  const title = nav && nav.kind === "concept" && nav.section.slug !== "introduction"
    ? `${nav.section.title}: ${doc.frontmatter.title}`
    : doc.frontmatter.title;
  return { title, description: doc.frontmatter.description };
}

export default async function CodePage({ params }: Props) {
  const { section, page } = await params;
  const nav = findPage(section, page);
  const doc = getDoc("code", `${section}/${page}`);
  if (!nav || !doc) notFound();
  const { prev, next } = getAdjacent(nav.id);
  return <DocPage doc={doc} page={nav} prev={prev} next={next} />;
}
