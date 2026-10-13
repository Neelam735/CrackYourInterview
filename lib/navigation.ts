export type Difficulty = "Easy" | "Medium" | "Hard";

export type NavPage = {
  slug: string;
  title: string;
  /** Problem pages are indented under the concept page before them. */
  kind: "concept" | "problem";
  difficulty?: Difficulty;
};

export type NavSection = {
  slug: string;
  title: string;
  pages: NavPage[];
};

export type FlatPage = NavPage & {
  section: NavSection;
  /** Progress key and URL suffix: "<section>/<page>". */
  id: string;
  href: string;
};

export const CODE_BASE = "/learn/code";

const concept = (slug: string, title: string): NavPage => ({ slug, title, kind: "concept" });
const problem = (slug: string, title: string, difficulty: Difficulty): NavPage => ({
  slug,
  title,
  kind: "problem",
  difficulty,
});

// The Coding track, in reading order. Every page has a matching file at
// content/code/<section>/<page>.mdx.
export const codeNavigation: NavSection[] = [
  {
    slug: "introduction",
    title: "Introduction",
    pages: [concept("overview", "Introduction"), concept("big-o", "Big-O Cheat Sheet")],
  },
  {
    slug: "two-pointers",
    title: "Two Pointers",
    pages: [
      concept("overview", "Overview"),
      problem("container-with-most-water", "Container With Most Water", "Medium"),
      problem("two-sum-sorted", "Two Sum (Sorted Array)", "Medium"),
      problem("3-sum", "3-Sum", "Medium"),
      problem("triangle-numbers", "Triangle Numbers", "Medium"),
      problem("move-zeroes", "Move Zeroes", "Easy"),
      problem("sort-colors", "Sort Colors", "Medium"),
      problem("trapping-rain-water", "Trapping Rain Water", "Hard"),
    ],
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    pages: [
      concept("fixed-length", "Fixed Length Sliding Window"),
      problem("max-sum-subarray-size-k", "Maximum Sum of Subarrays of Size K", "Easy"),
      problem("max-points-from-cards", "Max Points You Can Obtain From Cards", "Medium"),
      problem("max-sum-distinct-subarrays", "Max Sum of Distinct Subarrays Length k", "Medium"),
      concept("variable-length", "Variable Length Sliding Window"),
      problem("longest-substring-without-repeating", "Longest Substring Without Repeating Characters", "Medium"),
      problem("longest-repeating-character-replacement", "Longest Repeating Character Replacement", "Medium"),
    ],
  },
  {
    slug: "intervals",
    title: "Intervals",
    pages: [
      concept("overview", "Overview"),
      problem("can-attend-meetings", "Can Attend Meetings", "Easy"),
      problem("insert-interval", "Insert Interval", "Medium"),
      problem("non-overlapping-intervals", "Non-Overlapping Intervals", "Medium"),
      problem("merge-intervals", "Merge Intervals", "Medium"),
      problem("employee-free-time", "Employee Free Time", "Hard"),
    ],
  },
  {
    slug: "stack",
    title: "Stack",
    pages: [
      concept("overview", "Overview"),
      problem("valid-parentheses", "Valid Parentheses", "Easy"),
      problem("decode-string", "Decode String", "Medium"),
      problem("longest-valid-parentheses", "Longest Valid Parentheses", "Hard"),
      concept("monotonic-stack", "Monotonic Stack"),
      problem("daily-temperatures", "Daily Temperatures", "Medium"),
      problem("largest-rectangle-in-histogram", "Largest Rectangle in Histogram", "Hard"),
    ],
  },
  {
    slug: "linked-list",
    title: "Linked List",
    pages: [
      concept("overview", "Overview"),
      problem("linked-list-cycle", "Linked List Cycle", "Easy"),
      problem("palindrome-linked-list", "Palindrome Linked List", "Easy"),
      problem("remove-nth-node-from-end", "Remove Nth Node From End of List", "Medium"),
      problem("reorder-list", "Reorder List", "Medium"),
      problem("swap-nodes-in-pairs", "Swap Nodes in Pairs", "Medium"),
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    pages: [
      concept("overview", "Overview"),
      problem("apple-harvest", "Apple Harvest (Koko Eating Bananas)", "Medium"),
      problem("search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "Medium"),
      problem("split-array-largest-sum", "Split Array Largest Sum", "Hard"),
      problem("kth-smallest-in-sorted-matrix", "Kth Smallest Element in a Sorted Matrix", "Medium"),
      problem("minimum-shipping-capacity", "Minimum Shipping Capacity", "Medium"),
    ],
  },
  {
    slug: "heap",
    title: "Heap",
    pages: [
      concept("overview", "Overview"),
      problem("kth-largest-element", "Kth Largest Element in an Array", "Medium"),
      problem("k-closest-points", "K Closest Points to Origin", "Medium"),
      problem("find-k-closest-elements", "Find K Closest Elements", "Medium"),
      problem("merge-k-sorted-lists", "Merge K Sorted Lists", "Hard"),
      problem("median-from-data-stream", "Median from Data Stream", "Hard"),
    ],
  },
  {
    slug: "depth-first-search",
    title: "Depth-First Search",
    pages: [
      concept("introduction", "Introduction"),
      concept("fundamentals", "Fundamentals"),
      concept("return-values", "Return Values"),
      problem("maximum-depth", "Maximum Depth of Binary Tree", "Easy"),
      problem("path-sum", "Path Sum", "Easy"),
      concept("passing-values-down", "Passing Values Down and Helper Functions"),
      problem("validate-bst", "Validate Binary Search Tree", "Medium"),
      problem("calculate-tilt", "Calculate Tilt", "Easy"),
      problem("diameter-of-binary-tree", "Diameter of a Binary Tree", "Easy"),
      problem("path-sum-ii", "Path Sum II", "Medium"),
      problem("longest-univalue-path", "Longest Univalue Path", "Medium"),
      concept("graphs-overview", "Graphs Overview"),
      concept("adjacency-list", "Adjacency List"),
      problem("copy-graph", "Copy Graph", "Medium"),
      problem("graph-valid-tree", "Graph Valid Tree", "Medium"),
      concept("matrices", "Matrices"),
      problem("flood-fill", "Flood Fill", "Easy"),
      problem("number-of-islands", "Number of Islands", "Medium"),
      problem("surrounded-regions", "Surrounded Regions", "Medium"),
      problem("pacific-atlantic-water-flow", "Pacific Atlantic Water Flow", "Medium"),
    ],
  },
  {
    slug: "breadth-first-search",
    title: "Breadth-First Search",
    pages: [
      concept("introduction", "Introduction"),
      concept("overview", "Overview"),
      problem("level-order-sum", "Level Order Sum", "Easy"),
      problem("rightmost-node", "Rightmost Node", "Medium"),
      problem("zigzag-level-order", "Zigzag Level Order", "Medium"),
      problem("maximum-width", "Maximum Width of Binary Tree", "Medium"),
      concept("graphs-overview", "Graphs Overview"),
      problem("minimum-knight-moves", "Minimum Knight Moves", "Medium"),
      problem("rotting-oranges", "Rotting Oranges", "Medium"),
      problem("01-matrix", "01-Matrix", "Medium"),
      problem("bus-routes", "Bus Routes", "Hard"),
    ],
  },
  {
    slug: "backtracking",
    title: "Backtracking",
    pages: [
      concept("overview", "Overview"),
      problem("word-search", "Word Search", "Medium"),
      concept("solution-space-trees", "Solution Space Trees"),
      problem("subsets", "Subsets", "Medium"),
      problem("generate-parentheses", "Generate Parentheses", "Medium"),
      problem("combination-sum", "Combination Sum", "Medium"),
      problem("palindrome-partitioning", "Palindrome Partitioning", "Medium"),
      problem("n-queens", "N-Queens", "Hard"),
    ],
  },
  {
    slug: "graphs",
    title: "Graphs",
    pages: [
      concept("overview", "Overview"),
      problem("course-schedule", "Course Schedule", "Medium"),
      problem("course-schedule-ii", "Course Schedule II", "Medium"),
      concept("shortest-path-algorithms", "Shortest Path Algorithms"),
      problem("network-delay-time", "Network Delay Time", "Medium"),
      problem("cheapest-flights-within-k-stops", "Cheapest Flights Within K Stops", "Medium"),
      problem("path-with-minimum-effort", "Path With Minimum Effort", "Medium"),
      problem("find-city-fewest-reachable", "Find City with Fewest Reachable", "Medium"),
    ],
  },
  {
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    pages: [
      concept("fundamentals", "Fundamentals"),
      concept("solving-a-question", "Solving a Question with Dynamic Programming"),
      problem("counting-bits", "Counting Bits", "Easy"),
      problem("decode-ways", "Decode Ways", "Medium"),
      problem("unique-paths", "Unique Paths", "Medium"),
      problem("maximal-square", "Maximal Square", "Medium"),
      problem("longest-increasing-subsequence", "Longest Increasing Subsequence", "Medium"),
      problem("word-break", "Word Break", "Medium"),
      problem("max-profit-job-scheduling", "Maximum Profit in Job Scheduling", "Hard"),
      problem("paint-house", "Paint House", "Medium"),
      problem("paint-house-ii", "Paint House II", "Hard"),
      problem("minimum-window-subsequence", "Minimum Window Subsequence", "Hard"),
    ],
  },
  {
    slug: "greedy",
    title: "Greedy Algorithms",
    pages: [
      concept("overview", "Overview"),
      problem("best-time-to-buy-and-sell-stock", "Best Time to Buy and Sell Stock", "Easy"),
      problem("gas-station", "Gas Station", "Medium"),
      problem("jump-game", "Jump Game", "Medium"),
      problem("jump-game-ii", "Jump Game II", "Medium"),
      problem("partition-labels", "Partition Labels", "Medium"),
    ],
  },
  {
    slug: "trie",
    title: "Trie",
    pages: [
      concept("overview", "Overview"),
      problem("implement-trie", "Implement Trie Methods", "Medium"),
      problem("prefix-matching", "Prefix Matching", "Medium"),
    ],
  },
  {
    slug: "prefix-sum",
    title: "Prefix Sum",
    pages: [
      concept("overview", "Overview"),
      problem("count-vowels-in-substrings", "Count Vowels in Substrings", "Medium"),
      problem("subarray-sum-equals-k", "Subarray Sum Equals K", "Medium"),
    ],
  },
  {
    slug: "matrices",
    title: "Matrices",
    pages: [
      problem("spiral-matrix", "Spiral Matrix", "Medium"),
      problem("rotate-image", "Rotate Image", "Medium"),
      problem("set-matrix-zeroes", "Set Matrix Zeroes", "Medium"),
    ],
  },
];

export const flatPages: FlatPage[] = codeNavigation.flatMap((section) =>
  section.pages.map((page) => ({
    ...page,
    section,
    id: `${section.slug}/${page.slug}`,
    href: `${CODE_BASE}/${section.slug}/${page.slug}`,
  })),
);

export const pageIds = new Set(flatPages.map((page) => page.id));

export function findPage(sectionSlug: string, pageSlug: string): FlatPage | undefined {
  return flatPages.find((page) => page.section.slug === sectionSlug && page.slug === pageSlug);
}

export function getAdjacent(id: string) {
  const index = flatPages.findIndex((page) => page.id === id);
  return {
    prev: index > 0 ? flatPages[index - 1] : null,
    next: index >= 0 && index < flatPages.length - 1 ? flatPages[index + 1] : null,
  };
}

// Section URLs open the section's first page; URLs from the earlier
// one-page-per-pattern layout point to their new homes.
export const codeRedirects: { source: string; destination: string }[] = [
  { source: CODE_BASE, destination: `${CODE_BASE}/introduction/overview` },
  ...codeNavigation.map((section) => ({
    source: `${CODE_BASE}/${section.slug}`,
    destination: `${CODE_BASE}/${section.slug}/${section.pages[0].slug}`,
  })),
  { source: `${CODE_BASE}/big-o`, destination: `${CODE_BASE}/introduction/big-o` },
  { source: `${CODE_BASE}/fast-slow-pointers`, destination: `${CODE_BASE}/linked-list/overview` },
  { source: `${CODE_BASE}/trees`, destination: `${CODE_BASE}/depth-first-search/introduction` },
];
