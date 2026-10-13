export type NavItem = {
  slug: string;
  title: string;
  comingSoon?: boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

// Order of the Coding track. Each available item has a matching
// file in content/code/<slug>.mdx.
export const codeNavigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { slug: "introduction", title: "Introduction" },
      { slug: "big-o", title: "Big-O Cheat Sheet" },
    ],
  },
  {
    title: "Patterns",
    items: [
      { slug: "two-pointers", title: "Two Pointers" },
      { slug: "sliding-window", title: "Sliding Window" },
      { slug: "binary-search", title: "Binary Search" },
      { slug: "stack", title: "Stack" },
      { slug: "fast-slow-pointers", title: "Fast & Slow Pointers" },
      { slug: "intervals", title: "Intervals", comingSoon: true },
      { slug: "heap", title: "Heap", comingSoon: true },
      { slug: "trees", title: "Trees (DFS / BFS)", comingSoon: true },
      { slug: "graphs", title: "Graphs", comingSoon: true },
      { slug: "backtracking", title: "Backtracking", comingSoon: true },
      { slug: "dynamic-programming", title: "Dynamic Programming", comingSoon: true },
    ],
  },
];

export const availableCodeItems = codeNavigation
  .flatMap((section) => section.items)
  .filter((item) => !item.comingSoon);

export function getAdjacent(slug: string) {
  const index = availableCodeItems.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? availableCodeItems[index - 1] : null,
    next: index >= 0 && index < availableCodeItems.length - 1 ? availableCodeItems[index + 1] : null,
  };
}
