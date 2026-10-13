import { ArrayRow, CollectionView, GraphView, GridView, IntervalsView, TreeView } from "./panels";
import type { ArrayPanel, CellState, CollectionPanel, Frame, Scenario } from "./types";

// Draws one frame's panels (arrays, tree, graph, grid, intervals, variables,
// stacks). Shared by the interactive visualizer and the video renderer.
export function FrameView({ scenario, frame }: { scenario: Scenario; frame: Frame }) {
  return (
    <>
      {frame.array && <ArrayRow panel={mainArray(frame)} kind={scenario.kind ?? "array"} cycleTo={scenario.cycleTo} />}
      {frame.tree && <TreeView panel={frame.tree} />}
      {frame.graph && <GraphView panel={frame.graph} />}
      {frame.grid && <GridView panel={frame.grid} />}
      {frame.intervals?.map((panel, i) => <IntervalsView key={i} panel={panel} />)}
      {frame.arrays?.map((panel, i) => <ArrayRow key={i} panel={panel} />)}

      {(frame.variables || collections(frame).length > 0) && (
        <div className="flex flex-wrap items-start gap-4">
          {frame.variables && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(frame.variables).map(([name, value]) => (
                <span
                  key={name}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <span className="text-slate-500 dark:text-slate-400">{name} = </span>
                  {String(value)}
                </span>
              ))}
            </div>
          )}
          {collections(frame).map((panel) => (
            <CollectionView key={panel.label} panel={panel} />
          ))}
        </div>
      )}
    </>
  );
}

// The original array fields (window/highlight/dimmed) map onto cell states.
function mainArray(frame: Frame): ArrayPanel {
  const states: Record<number, CellState> = {};
  if (frame.window) for (let i = frame.window[0]; i <= frame.window[1]; i++) states[i] = "window";
  frame.highlight?.forEach((i) => (states[i] = "highlight"));
  frame.dimmed?.forEach((i) => (states[i] = "dimmed"));
  return { values: frame.array ?? [], pointers: frame.pointers, states };
}

function collections(frame: Frame): CollectionPanel[] {
  const panels = frame.collections ?? [];
  if (!frame.stack) return panels;
  return [{ label: frame.stackLabel ?? "stack", items: frame.stack, note: "← top" }, ...panels];
}
