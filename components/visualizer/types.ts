export type PointerColor = "blue" | "green" | "rose" | "amber" | "violet";

export type Pointer = {
  name: string;
  index: number;
  color?: PointerColor;
};

// One snapshot of the algorithm's state. The visualizer steps through these.
export type Frame = {
  array: (number | string)[];
  pointers?: Pointer[];
  /** Inclusive [start, end] range drawn as the current window. */
  window?: [number, number];
  /** Cells to emphasise, e.g. the answer. */
  highlight?: number[];
  /** Cells ruled out, e.g. the discarded half in binary search. */
  dimmed?: number[];
  /** Contents of an auxiliary stack, bottom first. */
  stack?: (number | string)[];
  stackLabel?: string;
  variables?: Record<string, string | number | boolean>;
  message: string;
};

export type Scenario = {
  title: string;
  input: string;
  /** "list" draws arrows between cells like a linked list. */
  kind?: "array" | "list";
  /** For kind "list": index the tail node points back to. */
  cycleTo?: number;
  frames: Frame[];
};
