import { advancedScenarios } from "./advancedScenarios";
import type { Frame, Scenario } from "./types";

// Each scenario runs the real algorithm and records a frame at every decision,
// so the walkthrough always matches the code shown in the article.

function twoSumSorted(): Scenario {
  const nums = [1, 3, 4, 6, 8, 11];
  const target = 10;
  const frames: Frame[] = [];
  let left = 0;
  let right = nums.length - 1;

  frames.push({
    array: nums,
    pointers: [
      { name: "left", index: left, color: "blue" },
      { name: "right", index: right, color: "rose" },
    ],
    variables: { target },
    message: "Start with left at the smallest value and right at the largest.",
  });

  while (left < right) {
    const sum = nums[left] + nums[right];
    const pointers = [
      { name: "left", index: left, color: "blue" as const },
      { name: "right", index: right, color: "rose" as const },
    ];
    if (sum === target) {
      frames.push({
        array: nums,
        pointers,
        highlight: [left, right],
        variables: { target, sum },
        message: `${nums[left]} + ${nums[right]} = ${sum}, which equals the target. Return [${left}, ${right}].`,
      });
      break;
    }
    if (sum < target) {
      frames.push({
        array: nums,
        pointers,
        variables: { target, sum },
        message: `${nums[left]} + ${nums[right]} = ${sum} is too small. Every pair using ${nums[left]} is at most ${sum}, so move left forward.`,
      });
      left++;
    } else {
      frames.push({
        array: nums,
        pointers,
        variables: { target, sum },
        message: `${nums[left]} + ${nums[right]} = ${sum} is too big. Every pair using ${nums[right]} is at least ${sum}, so move right back.`,
      });
      right--;
    }
  }

  return { title: "Two Sum II (sorted input)", input: `nums = [${nums.join(", ")}], target = ${target}`, frames };
}

function containerWithMostWater(): Scenario {
  const height = [1, 8, 6, 2, 5, 4, 8, 3, 7];
  const frames: Frame[] = [];
  let left = 0;
  let right = height.length - 1;
  let best = 0;

  while (left < right) {
    const width = right - left;
    const area = Math.min(height[left], height[right]) * width;
    best = Math.max(best, area);
    const shorter = height[left] <= height[right] ? "left" : "right";
    frames.push({
      array: height,
      pointers: [
        { name: "left", index: left, color: "blue" },
        { name: "right", index: right, color: "rose" },
      ],
      window: [left, right],
      variables: { area: `min(${height[left]}, ${height[right]}) × ${width} = ${area}`, best },
      message:
        `Area is limited by the shorter line. Moving the taller line can only shrink the width without raising the height, ` +
        `so move the ${shorter} pointer.`,
    });
    if (shorter === "left") left++;
    else right--;
  }

  frames.push({
    array: height,
    variables: { best },
    message: `The pointers met. The largest area found is ${best}.`,
  });

  return { title: "Container With Most Water", input: `height = [${height.join(", ")}]`, frames };
}

function maxSumFixedWindow(): Scenario {
  const nums = [2, 1, 5, 1, 3, 2];
  const k = 3;
  const frames: Frame[] = [];
  let sum = nums.slice(0, k).reduce((a, b) => a + b, 0);
  let best = sum;

  frames.push({
    array: nums,
    window: [0, k - 1],
    variables: { k, sum, best },
    message: `Build the first window of size ${k}: ${nums.slice(0, k).join(" + ")} = ${sum}.`,
  });

  for (let end = k; end < nums.length; end++) {
    const removed = nums[end - k];
    sum += nums[end] - removed;
    best = Math.max(best, sum);
    frames.push({
      array: nums,
      window: [end - k + 1, end],
      pointers: [{ name: "end", index: end, color: "blue" }],
      variables: { k, sum, best },
      message: `Slide right: add ${nums[end]}, remove ${removed}. The window sum is now ${sum}, computed in O(1) instead of re-adding ${k} numbers.`,
    });
  }

  frames.push({ array: nums, variables: { best }, message: `Done. The maximum sum of any ${k} consecutive numbers is ${best}.` });

  return { title: "Maximum Sum Subarray of Size K", input: `nums = [${nums.join(", ")}], k = ${k}`, frames };
}

function longestSubstringNoRepeat(): Scenario {
  const s = "abcabcbb";
  const chars = s.split("");
  const frames: Frame[] = [];
  const seen = new Set<string>();
  let left = 0;
  let best = 0;

  for (let right = 0; right < chars.length; right++) {
    while (seen.has(chars[right])) {
      frames.push({
        array: chars,
        window: [left, right - 1],
        pointers: [
          { name: "left", index: left, color: "blue" },
          { name: "right", index: right, color: "rose" },
        ],
        variables: { window: `"${s.slice(left, right)}"`, best },
        message: `"${chars[right]}" is already in the window. Shrink from the left: drop "${chars[left]}".`,
      });
      seen.delete(chars[left]);
      left++;
    }
    seen.add(chars[right]);
    best = Math.max(best, right - left + 1);
    frames.push({
      array: chars,
      window: [left, right],
      pointers: [
        { name: "left", index: left, color: "blue" },
        { name: "right", index: right, color: "rose" },
      ],
      variables: { window: `"${s.slice(left, right + 1)}"`, best },
      message: `Add "${chars[right]}". The window has no repeats and length ${right - left + 1}.`,
    });
  }

  frames.push({ array: chars, variables: { best }, message: `Done. The longest substring without repeating characters has length ${best}.` });

  return { title: "Longest Substring Without Repeating Characters", input: `s = "${s}"`, frames };
}

function binarySearch(): Scenario {
  const nums = [1, 3, 5, 7, 9, 11, 13, 15, 17];
  const target = 15;
  const frames: Frame[] = [];
  let lo = 0;
  let hi = nums.length - 1;
  const dimmed: number[] = [];

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const pointers = [
      { name: "lo", index: lo, color: "blue" as const },
      { name: "mid", index: mid, color: "violet" as const },
      { name: "hi", index: hi, color: "rose" as const },
    ];
    if (nums[mid] === target) {
      frames.push({
        array: nums,
        pointers,
        dimmed: [...dimmed],
        highlight: [mid],
        variables: { target, "nums[mid]": nums[mid] },
        message: `nums[${mid}] = ${nums[mid]} equals the target. Return ${mid}.`,
      });
      break;
    }
    if (nums[mid] < target) {
      frames.push({
        array: nums,
        pointers,
        dimmed: [...dimmed],
        variables: { target, "nums[mid]": nums[mid] },
        message: `${nums[mid]} < ${target}, so the target can't be at mid or to its left. Discard that half: lo = mid + 1.`,
      });
      for (let i = lo; i <= mid; i++) dimmed.push(i);
      lo = mid + 1;
    } else {
      frames.push({
        array: nums,
        pointers,
        dimmed: [...dimmed],
        variables: { target, "nums[mid]": nums[mid] },
        message: `${nums[mid]} > ${target}, so the target can't be at mid or to its right. Discard that half: hi = mid - 1.`,
      });
      for (let i = mid; i <= hi; i++) dimmed.push(i);
      hi = mid - 1;
    }
  }

  return { title: "Binary Search", input: `nums = [${nums.join(", ")}], target = ${target}`, frames };
}

function validParentheses(): Scenario {
  const s = "{[()]()}";
  const chars = s.split("");
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const frames: Frame[] = [];
  const stack: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c in pairs) {
      const top = stack[stack.length - 1];
      stack.pop();
      frames.push({
        array: chars,
        pointers: [{ name: "i", index: i, color: "blue" }],
        stack: [...stack],
        stackLabel: "stack",
        message: `"${c}" is a closer. The top of the stack is "${top}", which matches, so pop it.`,
      });
    } else {
      stack.push(c);
      frames.push({
        array: chars,
        pointers: [{ name: "i", index: i, color: "blue" }],
        stack: [...stack],
        stackLabel: "stack",
        message: `"${c}" is an opener. Push it and wait for its matching closer.`,
      });
    }
  }

  frames.push({
    array: chars,
    stack: [],
    stackLabel: "stack",
    highlight: chars.map((_, i) => i),
    message: "The stack is empty at the end: every opener was closed in the right order. The string is valid.",
  });

  return { title: "Valid Parentheses", input: `s = "${s}"`, frames };
}

function dailyTemperatures(): Scenario {
  const temps = [73, 74, 75, 71, 69, 72, 76, 73];
  const answer = new Array(temps.length).fill(0);
  const stack: number[] = [];
  const frames: Frame[] = [];
  const stackView = () => stack.map((i) => `${temps[i]} (i=${i})`);

  for (let i = 0; i < temps.length; i++) {
    while (stack.length > 0 && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop()!;
      answer[j] = i - j;
      frames.push({
        array: temps,
        pointers: [
          { name: "i", index: i, color: "blue" },
          { name: "popped", index: j, color: "green" },
        ],
        stack: stackView(),
        stackLabel: "stack (decreasing)",
        variables: { answer: `[${answer.join(", ")}]` },
        message: `${temps[i]} is warmer than ${temps[j]} on day ${j}. Pop day ${j}: it waited ${i} - ${j} = ${i - j} day(s).`,
      });
    }
    stack.push(i);
    frames.push({
      array: temps,
      pointers: [{ name: "i", index: i, color: "blue" }],
      stack: stackView(),
      stackLabel: "stack (decreasing)",
      variables: { answer: `[${answer.join(", ")}]` },
      message: `Push day ${i} (${temps[i]}°). It waits on the stack until a warmer day shows up.`,
    });
  }

  frames.push({
    array: temps,
    stack: stackView(),
    stackLabel: "stack (decreasing)",
    variables: { answer: `[${answer.join(", ")}]` },
    message: "Days still on the stack never see a warmer day, so their answer stays 0.",
  });

  return { title: "Daily Temperatures", input: `temperatures = [${temps.join(", ")}]`, frames };
}

function linkedListCycle(): Scenario {
  const values = [3, 2, 0, -4];
  const cycleTo = 1;
  const next = (i: number) => (i < values.length - 1 ? i + 1 : cycleTo);
  const frames: Frame[] = [];
  let slow = 0;
  let fast = 0;
  const pointers = () => [
    { name: "slow", index: slow, color: "green" as const },
    { name: "fast", index: fast, color: "amber" as const },
  ];

  frames.push({
    array: values,
    pointers: pointers(),
    message: "Both pointers start at the head. slow moves 1 step at a time, fast moves 2.",
  });

  for (;;) {
    slow = next(slow);
    fast = next(next(fast));
    if (slow === fast) {
      frames.push({
        array: values,
        pointers: pointers(),
        highlight: [slow],
        message: `slow and fast meet at index ${slow} (value ${values[slow]}). fast could only catch up by going around a loop, so the list has a cycle.`,
      });
      break;
    }
    frames.push({
      array: values,
      pointers: pointers(),
      message: `slow → index ${slow} (value ${values[slow]}), fast → index ${fast} (value ${values[fast]}). Inside a cycle, fast closes the gap by 1 node each step.`,
    });
  }

  return { title: "Linked List Cycle", input: `head = [${values.join(", ")}], tail connects to index ${cycleTo}`, kind: "list", cycleTo, frames };
}

function middleOfList(): Scenario {
  const values = [1, 2, 3, 4, 5];
  const frames: Frame[] = [];
  let slow = 0;
  let fast = 0;
  const pointers = () => [
    { name: "slow", index: slow, color: "green" as const },
    { name: "fast", index: fast, color: "amber" as const },
  ];

  frames.push({ array: values, pointers: pointers(), message: "Both pointers start at the head." });

  while (fast + 1 < values.length) {
    slow += 1;
    fast += 2;
    frames.push({
      array: values,
      pointers: pointers(),
      message: `slow moves 1 step to ${values[slow]}, fast moves 2 steps to ${values[fast]}.`,
    });
  }

  frames.push({
    array: values,
    pointers: pointers(),
    highlight: [slow],
    message: `fast is on the last node and can't move 2 more steps. slow covered half the distance, so it's on the middle node: ${values[slow]}.`,
  });

  return { title: "Middle of the Linked List", input: `head = [${values.join(", ")}]`, kind: "list", frames };
}

export const scenarios: Record<string, () => Scenario> = {
  "two-sum-sorted": twoSumSorted,
  "container-with-most-water": containerWithMostWater,
  "max-sum-fixed-window": maxSumFixedWindow,
  "longest-substring-no-repeat": longestSubstringNoRepeat,
  "binary-search": binarySearch,
  "valid-parentheses": validParentheses,
  "daily-temperatures": dailyTemperatures,
  "linked-list-cycle": linkedListCycle,
  "middle-of-list": middleOfList,
  ...advancedScenarios,
};
