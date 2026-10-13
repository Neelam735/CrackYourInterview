# CrackYourInterview

A coding interview prep site that teaches algorithm patterns with step-by-step visual walkthroughs.

Built with **Next.js (App Router)**, **MDX** and **Tailwind CSS v4**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all lessons are statically generated)
npm run lint     # type-check
```

## Project structure

```
app/
  page.tsx                   Landing page
  learn/code/layout.tsx      Docs layout: sidebar + content
  learn/code/page.tsx        /learn/code (renders the introduction)
  learn/code/[slug]/page.tsx One page per lesson
components/
  DocPage.tsx                Article header, MDX body, prev/next, table of contents
  Sidebar.tsx, TableOfContents.tsx
  mdx/                       Components usable inside MDX (Callout, Problem, Complexity, Difficulty)
  visualizer/                Step-through algorithm visualizer
content/code/*.mdx           Lesson content
lib/navigation.ts            Sidebar order (add new lessons here)
lib/content.ts               Reads MDX files and extracts headings
```

## Adding a lesson

1. Create `content/code/<slug>.mdx` with `title` and `description` frontmatter.
2. Add `{ slug, title }` to `lib/navigation.ts` (remove `comingSoon` if it was a placeholder).

### MDX components

```mdx
<Problem difficulty="Medium" link="https://leetcode.com/problems/...">

Problem statement in **markdown**.

</Problem>

<Visualizer id="two-sum-sorted" />

<Complexity time="O(n)" space="O(1)" />

<Callout type="tip | info | warning | interview" title="Optional title">
Body text.
</Callout>
```

## Adding a visualization

Visualizations live in `components/visualizer/scenarios.ts`. Each scenario runs the real algorithm and records a `Frame` (array, pointers, window, highlighted cells, stack, variables and an explanation) at every decision. Register it in the `scenarios` map and reference it from MDX with `<Visualizer id="..." />`.
