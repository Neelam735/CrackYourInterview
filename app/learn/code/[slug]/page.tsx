import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/DocPage";
import { getDoc, getDocSlugs } from "@/lib/content";
import { getAdjacent } from "@/lib/navigation";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getDocSlugs("code").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc("code", slug);
  if (!doc) return {};
  return { title: doc.frontmatter.title, description: doc.frontmatter.description };
}

export default async function CodeDocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc("code", slug);
  if (!doc) notFound();
  const { prev, next } = getAdjacent(slug);
  return <DocPage doc={doc} basePath="/learn/code" prev={prev} next={next} />;
}
