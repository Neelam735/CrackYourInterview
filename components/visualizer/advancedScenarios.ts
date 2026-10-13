import type { CellState, Frame, GraphPanel, Scenario } from "./types";

// Scenarios for the tree, graph, interval, backtracking and DP lessons.
// Like the array scenarios, each one runs the real algorithm and records frames.

const listText = (items: unknown[]) => `[${items.join(", ")}]`;

function mergeIntervals(): Scenario {
  const intervals = [
    [1, 3],
    [2, 6],
    [8, 10],
    [9, 12],
    [15, 18],
  ];
  const items = intervals.map(([start, end]) => ({ start, end }));
  const min = 0;
  const max = 18;
  const merged: { start: number; end: number }[] = [];
  const frames: Frame[] = [];

  const inputPanel = (current: number) => {
    const states: Record<number, CellState> = {};
    for (let i = 0; i < current; i++) states[i] = "visited";
    if (current < items.length) states[current] = "active";
    return { label: "input (sorted by start)", items, min, max, states };
  };
  const mergedPanel = (changed?: number) => ({
    label: "merged",
    items: merged.map((m) => ({ ...m })),
    min,
    max,
    states: changed === undefined ? {} : { [changed]: "highlight" as CellState },
  });

  frames.push({
    intervals: [inputPanel(-1), mergedPanel()],
    message: "Sort the intervals by start time. Here they are already sorted, so overlapping intervals sit next to each other.",
  });

  items.forEach((item, i) => {
    const last = merged[merged.length - 1];
    if (!last || last.end < item.start) {
      merged.push({ ...item });
      frames.push({
        intervals: [inputPanel(i), mergedPanel(merged.length - 1)],
        message: last
          ? `[${item.start}, ${item.end}] starts after the last merged interval ends (${last.end}), so it starts a new group.`
          : `The first interval starts the merged list.`,
      });
    } else {
      const before = last.end;
      last.end = Math.max(last.end, item.end);
      frames.push({
        intervals: [inputPanel(i), mergedPanel(merged.length - 1)],
        message: `[${item.start}, ${item.end}] starts at ${item.start}, before the last merged interval ends (${before}). They overlap, so extend its end to max(${before}, ${item.end}) = ${last.end}.`,
      });
    }
  });

  frames.push({
    intervals: [inputPanel(items.length), mergedPanel()],
    message: `Done: ${merged.map((m) => `[${m.start}, ${m.end}]`).join(", ")}.`,
  });

  return { title: "Merge Intervals", input: `intervals = ${JSON.stringify(intervals)}`, frames };
}

function kthLargest(): Scenario {
  const nums = [3, 2, 1, 5, 6, 4];
  const k = 2;
  const heap: number[] = [];
  const frames: Frame[] = [];

  const snapshot = (i: number, states: Record<number, CellState>, message: string) =>
    frames.push({
      arrays: [{ label: "nums", values: nums, pointers: i < nums.length ? [{ name: "i", index: i, color: "blue" }] : [] }],
      tree: { label: `min-heap (keeps the ${k} largest)`, nodes: [...heap], states },
      variables: { k, size: heap.length },
      message,
    });

  const siftUp = (i: number, numIndex: number) => {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      snapshot(numIndex, { [parent]: "active", [i]: "window" }, `${heap[parent]} is smaller than its parent ${heap[i]}, so swap them up.`);
      i = parent;
    }
  };

  const siftDown = (numIndex: number) => {
    let i = 0;
    for (;;) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
      if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
      if (smallest === i) break;
      [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
      snapshot(numIndex, { [smallest]: "active", [i]: "window" }, `${heap[smallest]} is bigger than its child ${heap[i]}, so swap it down.`);
      i = smallest;
    }
  };

  snapshot(0, {}, `Keep a min-heap of the ${k} largest numbers seen so far. Its root is the smallest of them: the kth largest.`);

  nums.forEach((num, i) => {
    heap.push(num);
    snapshot(i, { [heap.length - 1]: "active" }, `Push ${num} onto the heap.`);
    siftUp(heap.length - 1, i);
    if (heap.length > k) {
      const removed = heap[0];
      heap[0] = heap[heap.length - 1];
      heap.pop();
      snapshot(i, { 0: "active" }, `The heap has ${k + 1} items, so pop the smallest (${removed}). It can't be among the ${k} largest. Move the last item to the root.`);
      siftDown(i);
    }
  });

  snapshot(nums.length, { 0: "highlight" }, `Done. The root, ${heap[0]}, is the ${k}nd largest number.`);

  return { title: "Kth Largest Element", input: `nums = ${listText(nums)}, k = ${k}`, frames };
}

const sampleTree = [3, 9, 20, null, null, 15, 7];

function levelOrder(): Scenario {
  const nodes = sampleTree;
  const frames: Frame[] = [];
  const states: Record<number, CellState> = {};
  const levels: number[][] = [];
  let queue = [0];

  const push = (message: string, active?: number) =>
    frames.push({
      tree: { nodes, states: active === undefined ? { ...states } : { ...states, [active]: "active" } },
      collections: [{ label: "queue", items: queue.map((i) => nodes[i] as number), note: "front is on the left" }],
      variables: { result: JSON.stringify(levels) },
      message,
    });

  push("Start with the root in the queue. A queue processes nodes in the order they were discovered: level by level.");

  while (queue.length > 0) {
    const size = queue.length;
    const level: number[] = [];
    levels.push(level);
    for (let n = 0; n < size; n++) {
      const i = queue.shift()!;
      level.push(nodes[i] as number);
      const children = [2 * i + 1, 2 * i + 2].filter((c) => c < nodes.length && nodes[c] !== null);
      queue = [...queue, ...children];
      push(
        children.length
          ? `Dequeue ${nodes[i]} and add it to this level. Enqueue its children: ${children.map((c) => nodes[c]).join(", ")}.`
          : `Dequeue ${nodes[i]} and add it to this level. It has no children.`,
        i,
      );
      states[i] = "visited";
    }
    push(`Level done: ${listText(level)}. The queue now holds exactly the next level.`);
  }

  return { title: "Binary Tree Level Order Traversal", input: "root = [3, 9, 20, null, null, 15, 7]", frames };
}

function maxDepth(): Scenario {
  const nodes = sampleTree;
  const frames: Frame[] = [];
  const states: Record<number, CellState> = {};
  const callStack: number[] = [];
  const results: Record<number, number> = {};

  const push = (message: string, active: number) =>
    frames.push({
      tree: { nodes, states: { ...states, [active]: "active" } },
      collections: [{ label: "call stack", items: callStack.map((i) => `depth(${nodes[i]})`), note: "← top" }],
      variables: Object.fromEntries(Object.entries(results).map(([i, d]) => [`depth(${nodes[Number(i)]})`, d])),
      message,
    });

  const exists = (i: number) => i < nodes.length && nodes[i] !== null;

  function depth(i: number): number {
    callStack.push(i);
    push(`Call depth(${nodes[i]}). First find the depth of each subtree.`, i);
    const left = exists(2 * i + 1) ? depth(2 * i + 1) : 0;
    const right = exists(2 * i + 2) ? depth(2 * i + 2) : 0;
    const result = 1 + Math.max(left, right);
    results[i] = result;
    push(
      left === 0 && right === 0
        ? `${nodes[i]} is a leaf: both children are empty (depth 0), so it returns 1.`
        : `Both subtrees are done: left = ${left}, right = ${right}. Return 1 + max(${left}, ${right}) = ${result}.`,
      i,
    );
    states[i] = "visited";
    callStack.pop();
    return result;
  }

  const answer = depth(0);
  frames.push({
    tree: { nodes, states: { ...states, 0: "highlight" } },
    collections: [{ label: "call stack", items: [] }],
    variables: { answer },
    message: `The root returns ${answer}: the maximum depth of the tree.`,
  });

  return { title: "Maximum Depth of Binary Tree", input: "root = [3, 9, 20, null, null, 15, 7]", frames };
}

function numberOfIslands(): Scenario {
  const grid = [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"],
  ];
  const rows = grid.length;
  const cols = grid[0].length;
  const frames: Frame[] = [];
  const states: Record<string, CellState> = {};
  let islands = 0;

  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === "0") states[`${r},${c}`] = "dimmed";

  const push = (message: string, active?: string, queue: [number, number][] = []) =>
    frames.push({
      grid: { cells: grid, states: active ? { ...states, [active]: "active" } : { ...states } },
      collections: [{ label: "bfs queue", items: queue.map(([r, c]) => `(${r},${c})`), note: "front is on the left" }],
      variables: { islands },
      message,
    });

  push("Scan the grid cell by cell. Water (0) is dimmed. Each unvisited land cell (1) we reach starts a new island.");

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1" || states[`${r},${c}`]) continue;
      islands++;
      const queue: [number, number][] = [[r, c]];
      states[`${r},${c}`] = "visited";
      push(`(${r},${c}) is unvisited land: island #${islands}. Flood-fill it with BFS so we never count it again.`, `${r},${c}`, queue);
      while (queue.length) {
        const [cr, cc] = queue.shift()!;
        const added: string[] = [];
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (grid[nr][nc] !== "1" || states[`${nr},${nc}`]) continue;
          states[`${nr},${nc}`] = "visited";
          queue.push([nr, nc]);
          added.push(`(${nr},${nc})`);
        }
        push(
          added.length
            ? `Visit (${cr},${cc}). Mark its land neighbors ${added.join(", ")} as visited and enqueue them.`
            : `Visit (${cr},${cc}). No unvisited land around it.`,
          `${cr},${cc}`,
          queue,
        );
      }
    }
  }

  push(`Scan complete. Every land cell was visited exactly once, and we found ${islands} islands.`);

  return { title: "Number of Islands", input: "4 × 5 grid", frames };
}

function courseSchedule(): Scenario {
  const numCourses = 6;
  const prerequisites = [
    [2, 0],
    [2, 1],
    [3, 1],
    [4, 2],
    [4, 3],
    [5, 4],
  ]; // [course, prerequisite]: prerequisite → course
  const positions: Record<string, [number, number]> = {
    "0": [0, 0],
    "1": [0, 120],
    "2": [140, 0],
    "3": [140, 120],
    "4": [280, 60],
    "5": [420, 60],
  };
  const graph: Record<number, number[]> = {};
  const indegree = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {
    (graph[pre] ??= []).push(course);
    indegree[course]++;
  }

  const frames: Frame[] = [];
  const states: Record<string, CellState> = {};
  const edgeStates: Record<string, CellState> = {};
  const order: number[] = [];
  const queue: number[] = [];

  const panel = (activeNode?: number): GraphPanel => ({
    directed: true,
    nodes: Object.entries(positions).map(([id, [x, y]]) => ({ id, x, y })),
    edges: prerequisites.map(([course, pre]) => ({ from: String(pre), to: String(course) })),
    states: activeNode === undefined ? { ...states } : { ...states, [activeNode]: "active" },
    edgeStates: { ...edgeStates },
    badges: Object.fromEntries(indegree.map((d, i) => [String(i), `in:${d}`])),
  });
  const push = (message: string, activeNode?: number) =>
    frames.push({
      graph: panel(activeNode),
      collections: [
        { label: "queue", items: [...queue], note: "front is on the left" },
        { label: "order", items: [...order] },
      ],
      message,
    });

  push("An arrow a → b means a must be taken before b. The in: badge counts each course's unmet prerequisites.");

  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) queue.push(i);
  queue.forEach((i) => (states[i] = "window"));
  push(`Courses with no prerequisites can be taken right away: ${queue.join(", ")}. Put them in the queue.`);

  while (queue.length) {
    const course = queue.shift()!;
    order.push(course);
    const unlocked: number[] = [];
    for (const next of graph[course] ?? []) {
      indegree[next]--;
      edgeStates[`${course}->${next}`] = "active";
      if (indegree[next] === 0) {
        queue.push(next);
        states[next] = "window";
        unlocked.push(next);
      }
    }
    push(
      `Take course ${course}. Each course it unlocks loses one prerequisite.` +
        (unlocked.length ? ` ${unlocked.join(", ")} now ${unlocked.length === 1 ? "has" : "have"} none left: enqueue.` : ""),
      course,
    );
    states[course] = "visited";
    for (const next of graph[course] ?? []) edgeStates[`${course}->${next}`] = "dimmed";
  }

  push(
    order.length === numCourses
      ? `All ${numCourses} courses were taken, so there's no cycle. A valid order is ${order.join(" → ")}.`
      : "Some courses were never unlocked: there's a cycle.",
  );

  return { title: "Course Schedule (Topological Sort)", input: `numCourses = ${numCourses}, prerequisites = ${JSON.stringify(prerequisites)}`, frames };
}

function subsets(): Scenario {
  const nums = [1, 2, 3];
  const frames: Frame[] = [];
  const result: number[][] = [];
  const path: number[] = [];
  const chosen: number[] = [];

  const push = (message: string, i?: number) =>
    frames.push({
      array: nums,
      highlight: [...chosen],
      pointers: i === undefined ? [] : [{ name: "i", index: i, color: "blue" }],
      collections: [{ label: "path", items: [...path], note: "← last choice" }],
      variables: { found: result.length, subsets: result.map((s) => listText(s)).join(" ") || "none" },
      message,
    });

  function backtrack(start: number) {
    result.push([...path]);
    push(`Record ${listText(path)} as a subset. Then try adding each number from index ${start} on.`);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      chosen.push(i);
      push(`Choose ${nums[i]}: path is now ${listText(path)}.`, i);
      backtrack(i + 1);
      path.pop();
      chosen.pop();
      push(`Undo: remove ${nums[i]} so the next choice starts from ${listText(path)}.`, i);
    }
  }

  backtrack(0);
  push(`Done. All 2³ = ${result.length} subsets found.`);

  return { title: "Subsets", input: `nums = ${listText(nums)}`, frames };
}

function houseRobber(): Scenario {
  const nums = [2, 7, 9, 3, 1];
  const dp: (number | null)[] = nums.map(() => null);
  const frames: Frame[] = [];

  const push = (i: number, message: string, deps: number[] = []) =>
    frames.push({
      array: nums,
      pointers: [{ name: "i", index: i, color: "blue" }],
      arrays: [
        {
          label: "dp[i] = best loot from houses 0..i",
          values: [...dp],
          states: { ...Object.fromEntries(deps.map((d) => [d, "window" as CellState])), [i]: "highlight" },
        },
      ],
      message,
    });

  dp[0] = nums[0];
  push(0, `With one house, rob it: dp[0] = ${nums[0]}.`);
  dp[1] = Math.max(nums[0], nums[1]);
  push(1, `With two houses, rob the richer one: dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}.`, [0]);

  for (let i = 2; i < nums.length; i++) {
    const skip = dp[i - 1]!;
    const rob = dp[i - 2]! + nums[i];
    dp[i] = Math.max(skip, rob);
    push(
      i,
      `Skip house ${i} (keep dp[${i - 1}] = ${skip}) or rob it (dp[${i - 2}] + ${nums[i]} = ${rob}). dp[${i}] = ${dp[i]}.`,
      [i - 1, i - 2],
    );
  }

  frames.push({
    array: nums,
    arrays: [{ label: "dp", values: [...dp], states: { [nums.length - 1]: "highlight" } }],
    message: `The answer is the last entry: ${dp[nums.length - 1]}.`,
  });

  return { title: "House Robber", input: `nums = ${listText(nums)}`, frames };
}

function longestCommonSubsequence(): Scenario {
  const a = "abcde";
  const b = "ace";
  const m = a.length;
  const n = b.length;
  const dp: (number | string)[][] = Array.from({ length: m + 1 }, (_, r) =>
    Array.from({ length: n + 1 }, (_, c) => (r === 0 || c === 0 ? 0 : "")),
  );
  const frames: Frame[] = [];
  const headers = {
    rowHeaders: ["", ...a.split("")],
    colHeaders: ["", ...b.split("")],
  };

  frames.push({
    grid: { cells: dp.map((row) => [...row]), ...headers },
    message: `dp[i][j] is the LCS length of the first i letters of "${a}" and the first j letters of "${b}". Row and column 0 are empty strings: 0.`,
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const states: Record<string, CellState> = { [`${i},${j}`]: "active" };
      let message: string;
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = (dp[i - 1][j - 1] as number) + 1;
        states[`${i - 1},${j - 1}`] = "window";
        message = `"${a[i - 1]}" = "${b[j - 1]}": extend the diagonal. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j] as number, dp[i][j - 1] as number);
        states[`${i - 1},${j}`] = "window";
        states[`${i},${j - 1}`] = "window";
        message = `"${a[i - 1]}" ≠ "${b[j - 1]}": drop one letter. dp[${i}][${j}] = max(up ${dp[i - 1][j]}, left ${dp[i][j - 1]}) = ${dp[i][j]}.`;
      }
      frames.push({ grid: { cells: dp.map((row) => [...row]), states, ...headers }, message });
    }
  }

  frames.push({
    grid: { cells: dp.map((row) => [...row]), states: { [`${m},${n}`]: "highlight" }, ...headers },
    message: `The bottom-right cell holds the answer: ${dp[m][n]} ("ace").`,
  });

  return { title: "Longest Common Subsequence", input: `text1 = "${a}", text2 = "${b}"`, frames };
}

export const advancedScenarios: Record<string, () => Scenario> = {
  "merge-intervals": mergeIntervals,
  "kth-largest": kthLargest,
  "level-order": levelOrder,
  "max-depth": maxDepth,
  "number-of-islands": numberOfIslands,
  "course-schedule": courseSchedule,
  subsets,
  "house-robber": houseRobber,
  "longest-common-subsequence": longestCommonSubsequence,
};
