import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Frontmatter = {
  title: string;
  description: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  readingTime?: string;
};

export type Heading = {
  depth: 2 | 3;
  text: string;
  id: string;
};

export type Doc = {
  slug: string;
  frontmatter: Frontmatter;
  body: string;
  headings: Heading[];
};

export function getDoc(track: string, slug: string): Doc | null {
  // Slugs come from the URL, so only allow kebab-case path segments.
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(slug)) return null;
  const file = path.join(CONTENT_DIR, track, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as Frontmatter,
    body: content,
    headings: extractHeadings(content),
  };
}

// Mirrors the ids rehype-slug generates so the table of contents links match.
function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const text = match[2].replace(/`/g, "").replace(/\[(.+?)\]\(.+?\)/g, "$1");
    headings.push({
      depth: match[1].length as 2 | 3,
      text,
      id: slugger.slug(text),
    });
  }
  return headings;
}
