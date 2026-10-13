import type {
  ArrayPanel,
  CellState,
  CollectionPanel,
  GraphPanel,
  GridPanel,
  IntervalPanel,
  Pointer,
  PointerColor,
  TreePanel,
} from "./types";

const pointerColors: Record<PointerColor, string> = {
  blue: "bg-brand-600 text-white",
  green: "bg-emerald-600 text-white",
  rose: "bg-rose-600 text-white",
  amber: "bg-amber-500 text-slate-950",
  violet: "bg-violet-600 text-white",
};

const svgPointerColors: Record<PointerColor, string> = {
  blue: "fill-brand-600",
  green: "fill-emerald-600",
  rose: "fill-rose-600",
  amber: "fill-amber-500",
  violet: "fill-violet-600",
};

const cellStyles: Record<CellState | "default", string> = {
  default: "border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
  window: "border-brand-400 bg-brand-100 text-brand-950 dark:border-brand-600 dark:bg-brand-900/60 dark:text-white",
  active: "border-brand-600 bg-brand-600 text-white dark:border-brand-500 dark:bg-brand-600",
  highlight: "border-emerald-500 bg-emerald-100 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-900/60 dark:text-white",
  visited: "border-slate-300 bg-slate-200 text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200",
  dimmed: "border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600",
};

const nodeStyles: Record<CellState | "default", { shape: string; text: string }> = {
  default: {
    shape: "fill-white stroke-slate-300 dark:fill-slate-950 dark:stroke-slate-600",
    text: "fill-slate-900 dark:fill-slate-100",
  },
  window: {
    shape: "fill-brand-100 stroke-brand-400 dark:fill-brand-900 dark:stroke-brand-500",
    text: "fill-brand-950 dark:fill-white",
  },
  active: { shape: "fill-brand-600 stroke-brand-600", text: "fill-white" },
  highlight: {
    shape: "fill-emerald-100 stroke-emerald-500 dark:fill-emerald-900",
    text: "fill-emerald-950 dark:fill-white",
  },
  visited: {
    shape: "fill-slate-200 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500",
    text: "fill-slate-700 dark:fill-slate-200",
  },
  dimmed: {
    shape: "fill-slate-50 stroke-slate-200 dark:fill-slate-900 dark:stroke-slate-800",
    text: "fill-slate-300 dark:fill-slate-600",
  },
};

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {children}
    </div>
  );
}

function PointerTags({ pointers }: { pointers: Pointer[] }) {
  return (
    <>
      {pointers.map((pointer) => (
        <span
          key={pointer.name}
          className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none ${
            pointerColors[pointer.color ?? "blue"]
          }`}
        >
          {pointer.name}
        </span>
      ))}
    </>
  );
}

export function ArrayRow({
  panel,
  kind = "array",
  cycleTo,
}: {
  panel: ArrayPanel;
  kind?: "array" | "list";
  cycleTo?: number;
}) {
  const isList = kind === "list";
  const hasPointers = (panel.pointers?.length ?? 0) > 0;

  return (
    <div>
      {panel.label && <PanelLabel>{panel.label}</PanelLabel>}
      <div className="overflow-x-auto pb-1">
        <div className="flex w-max items-start">
          {panel.values.map((value, index) => {
            const state = panel.states?.[index] ?? "default";
            const pointers = panel.pointers?.filter((p) => p.index === index) ?? [];
            return (
              <div key={index} className="flex items-start">
                <div className="flex w-12 flex-col items-center">
                  <div
                    className={`grid h-12 w-12 place-items-center border-2 font-mono text-base font-semibold transition-colors duration-300 ${
                      isList ? "rounded-full" : "rounded-lg"
                    } ${cellStyles[state]}`}
                  >
                    {value ?? ""}
                  </div>
                  <span className="mt-1 font-mono text-[11px] text-slate-400">{index}</span>
                  {hasPointers && (
                    <div className="mt-1 flex min-h-[2.25rem] flex-col items-center gap-1">
                      <PointerTags pointers={pointers} />
                    </div>
                  )}
                </div>
                {index < panel.values.length - 1 &&
                  (isList ? (
                    <span className="mt-3 w-6 text-center text-slate-400" aria-hidden>
                      →
                    </span>
                  ) : (
                    <span className="w-1.5" />
                  ))}
              </div>
            );
          })}
          {isList && (
            <span className="ml-1 mt-3 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400">
              {cycleTo === undefined ? "→ null" : `↺ back to index ${cycleTo}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const NODE_RADIUS = 18;
const LEVEL_HEIGHT = 64;
const SLOT_WIDTH = 46;

export function TreeView({ panel }: { panel: TreePanel }) {
  const lastIndex = panel.nodes.reduce<number>((last, node, i) => (node === null ? last : i), -1);
  if (lastIndex < 0) {
    return (
      <div>
        {panel.label && <PanelLabel>{panel.label}</PanelLabel>}
        <p className="text-sm italic text-slate-400">empty</p>
      </div>
    );
  }

  const depth = Math.floor(Math.log2(lastIndex + 1));
  const width = Math.max(2 ** depth * SLOT_WIDTH, 240);
  const height = (depth + 1) * LEVEL_HEIGHT + 20;

  const position = (i: number) => {
    const d = Math.floor(Math.log2(i + 1));
    const p = i - (2 ** d - 1);
    return { x: ((p + 0.5) * width) / 2 ** d, y: d * LEVEL_HEIGHT + NODE_RADIUS + 4 };
  };

  const present = panel.nodes
    .map((value, i) => ({ value, i }))
    .filter((n): n is { value: number | string; i: number } => n.value !== null && n.value !== undefined);

  return (
    <div>
      {panel.label && <PanelLabel>{panel.label}</PanelLabel>}
      <div className="overflow-x-auto">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto block">
          {present.map(({ i }) => {
            if (i === 0) return null;
            const parent = Math.floor((i - 1) / 2);
            if (panel.nodes[parent] === null || panel.nodes[parent] === undefined) return null;
            const a = position(parent);
            const b = position(i);
            return (
              <line
                key={`e${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className="stroke-slate-300 dark:stroke-slate-600"
                strokeWidth={2}
              />
            );
          })}
          {present.map(({ value, i }) => {
            const { x, y } = position(i);
            const style = nodeStyles[panel.states?.[i] ?? "default"];
            const pointers = panel.pointers?.filter((p) => p.index === i) ?? [];
            return (
              <g key={`n${i}`}>
                <circle cx={x} cy={y} r={NODE_RADIUS} strokeWidth={2} className={`transition-colors duration-300 ${style.shape}`} />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`font-mono text-sm font-semibold ${style.text}`}
                >
                  {value}
                </text>
                {pointers.map((pointer, k) => (
                  <g key={pointer.name}>
                    <rect
                      x={x - pointer.name.length * 3.6 - 4}
                      y={y + NODE_RADIUS + 4 + k * 16}
                      width={pointer.name.length * 7.2 + 8}
                      height={14}
                      rx={3}
                      className={svgPointerColors[pointer.color ?? "blue"]}
                    />
                    <text
                      x={x}
                      y={y + NODE_RADIUS + 11 + k * 16}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-white font-mono text-[11px] font-semibold"
                    >
                      {pointer.name}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function GridView({ panel }: { panel: GridPanel }) {
  return (
    <div>
      {panel.label && <PanelLabel>{panel.label}</PanelLabel>}
      <div className="overflow-x-auto pb-1">
        <table className="border-separate border-spacing-1">
          {panel.colHeaders && (
            <thead>
              <tr>
                {panel.rowHeaders && <th />}
                {panel.colHeaders.map((header, c) => (
                  <th key={c} className="h-6 w-10 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {panel.cells.map((row, r) => (
              <tr key={r}>
                {panel.rowHeaders && (
                  <th className="w-8 pr-1 text-right font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {panel.rowHeaders[r]}
                  </th>
                )}
                {row.map((value, c) => (
                  <td
                    key={c}
                    className={`h-10 w-10 rounded-md border-2 text-center font-mono text-sm font-semibold transition-colors duration-300 ${
                      cellStyles[panel.states?.[`${r},${c}`] ?? "default"]
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GraphView({ panel }: { panel: GraphPanel }) {
  const r = 20;
  const pad = 32;
  const xs = panel.nodes.map((n) => n.x);
  const ys = panel.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad - 4;
  const width = Math.max(...xs) - minX + pad + 24; // room for badges
  const height = Math.max(...ys) - minY + pad;
  const byId = new Map(panel.nodes.map((n) => [n.id, n]));

  return (
    <div>
      {panel.label && <PanelLabel>{panel.label}</PanelLabel>}
      <div className="overflow-x-auto">
        <svg width={width} height={height} viewBox={`${minX} ${minY} ${width} ${height}`} className="mx-auto block">
          {panel.edges.map((edge) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) return null;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const x1 = a.x + ux * r;
            const y1 = a.y + uy * r;
            const x2 = b.x - ux * (r + 2);
            const y2 = b.y - uy * (r + 2);
            const state = panel.edgeStates?.[`${edge.from}->${edge.to}`];
            const color =
              state === "active"
                ? "stroke-brand-600 fill-brand-600"
                : state === "dimmed"
                  ? "stroke-slate-200 fill-slate-200 dark:stroke-slate-800 dark:fill-slate-800"
                  : "stroke-slate-400 fill-slate-400 dark:stroke-slate-500 dark:fill-slate-500";
            // Arrowhead: a small triangle at the end of the edge.
            const size = 8;
            const head = [
              [x2, y2],
              [x2 - ux * size - uy * size * 0.6, y2 - uy * size + ux * size * 0.6],
              [x2 - ux * size + uy * size * 0.6, y2 - uy * size - ux * size * 0.6],
            ]
              .map((p) => p.join(","))
              .join(" ");
            return (
              <g key={`${edge.from}->${edge.to}`} className={`transition-colors duration-300 ${color}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} />
                {panel.directed && <polygon points={head} strokeWidth={0} />}
              </g>
            );
          })}
          {panel.nodes.map((node) => {
            const style = nodeStyles[panel.states?.[node.id] ?? "default"];
            const badge = panel.badges?.[node.id];
            return (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r={r} strokeWidth={2} className={`transition-colors duration-300 ${style.shape}`} />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`font-mono text-sm font-semibold ${style.text}`}
                >
                  {node.label ?? node.id}
                </text>
                {badge !== undefined && (
                  <text
                    x={node.x + r + 2}
                    y={node.y - r + 2}
                    className="fill-slate-500 font-mono text-[11px] font-semibold dark:fill-slate-400"
                  >
                    {badge}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function IntervalsView({ panel }: { panel: IntervalPanel }) {
  const span = panel.max - panel.min || 1;
  const pct = (v: number) => `${((v - panel.min) / span) * 100}%`;
  const ticks = span <= 24 ? Array.from({ length: span + 1 }, (_, i) => panel.min + i) : [panel.min, panel.max];

  return (
    <div>
      {panel.label && <PanelLabel>{panel.label}</PanelLabel>}
      <div className="px-3">
        <div className="space-y-1.5">
          {panel.items.length === 0 && <p className="text-sm italic text-slate-400">empty</p>}
          {panel.items.map((item, i) => {
            const nearRightEdge = (item.end - panel.min) / span > 0.75;
            return (
              <div key={i} className="relative h-7">
                <div
                  className={`absolute top-0 h-7 min-w-2 rounded-md border-2 transition-colors duration-300 ${
                    cellStyles[panel.states?.[i] ?? "default"]
                  }`}
                  style={{ left: pct(item.start), width: `${((item.end - item.start) / span) * 100}%` }}
                />
                <span
                  className="absolute top-1 whitespace-nowrap font-mono text-xs font-semibold text-slate-600 dark:text-slate-300"
                  style={
                    nearRightEdge
                      ? { right: `calc(${100 - ((item.start - panel.min) / span) * 100}% + 6px)` }
                      : { left: `calc(${pct(item.end)} + 6px)` }
                  }
                >
                  [{item.start}, {item.end}]
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative mt-2 h-5 border-t border-slate-300 dark:border-slate-700">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute top-1 -translate-x-1/2 font-mono text-[10px] text-slate-400"
              style={{ left: pct(t) }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CollectionView({ panel, highlightLast = true }: { panel: CollectionPanel; highlightLast?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {panel.label}
      </span>
      <div className="flex min-h-9 min-w-24 flex-wrap items-center gap-1 rounded-lg border-2 border-dashed border-slate-300 px-1.5 py-1 dark:border-slate-700">
        {panel.items.length === 0 ? (
          <span className="px-1 text-xs italic text-slate-400">empty</span>
        ) : (
          panel.items.map((item, i) => (
            <span
              key={i}
              className={`rounded-md px-2 py-1 font-mono text-xs font-semibold ${
                highlightLast && i === panel.items.length - 1
                  ? "bg-violet-600 text-white"
                  : "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100"
              }`}
            >
              {item}
            </span>
          ))
        )}
      </div>
      {panel.note && <span className="text-xs text-slate-400">{panel.note}</span>}
    </div>
  );
}
