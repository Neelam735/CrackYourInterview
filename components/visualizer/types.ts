export type PointerColor = "blue" | "green" | "rose" | "amber" | "violet";

export type Pointer = {
  name: string;
  index: number;
  color?: PointerColor;
};

/** How a cell, node or interval is drawn. */
export type CellState = "active" | "window" | "highlight" | "visited" | "dimmed";

/** A row of values, e.g. a dp table. */
export type ArrayPanel = {
  label?: string;
  values: (number | string | null)[];
  pointers?: Pointer[];
  states?: Record<number, CellState>;
};

/** A binary tree in positional level order: children of i are 2i+1 and 2i+2. */
export type TreePanel = {
  label?: string;
  nodes: (number | string | null)[];
  pointers?: Pointer[];
  states?: Record<number, CellState>;
};

export type GridPanel = {
  label?: string;
  cells: (number | string)[][];
  rowHeaders?: string[];
  colHeaders?: string[];
  /** Keyed by "row,col". */
  states?: Record<string, CellState>;
};

export type GraphPanel = {
  label?: string;
  /** Coordinates are in SVG units; the panel scales to fit. */
  nodes: { id: string; label?: string; x: number; y: number }[];
  edges: { from: string; to: string }[];
  directed?: boolean;
  states?: Record<string, CellState>;
  /** Keyed by "from->to". */
  edgeStates?: Record<string, CellState>;
  /** Small text shown next to a node, e.g. its in-degree. */
  badges?: Record<string, string | number>;
};

export type IntervalPanel = {
  label?: string;
  items: { start: number; end: number }[];
  min: number;
  max: number;
  states?: Record<number, CellState>;
};

/** A stack, queue or path, drawn as a row of chips. */
export type CollectionPanel = {
  label: string;
  items: (number | string)[];
  /** Hint drawn after the chips, e.g. "← top". */
  note?: string;
};

// One snapshot of the algorithm's state. The visualizer steps through these.
export type Frame = {
  array?: (number | string)[];
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
  arrays?: ArrayPanel[];
  tree?: TreePanel;
  grid?: GridPanel;
  graph?: GraphPanel;
  intervals?: IntervalPanel[];
  collections?: CollectionPanel[];
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
