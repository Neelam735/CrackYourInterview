import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/DocPage";
import { getDoc } from "@/lib/content";
import { getAdjacent } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Coding Interview Patterns",
  description: "Learn the patterns behind coding interview questions with step-by-step visual walkthroughs.",
};

export default function CodeIndexPage() {
  const doc = getDoc("code", "introduction");
  if (!doc) notFound();
  const { prev, next } = getAdjacent("introduction");
  return <DocPage doc={doc} basePath="/learn/code" prev={prev} next={next} />;
}
