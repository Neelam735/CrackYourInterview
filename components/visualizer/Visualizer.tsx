"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrayRow, CollectionView, GraphView, GridView, IntervalsView, TreeView } from "./panels";
import { scenarios } from "./scenarios";
import type { ArrayPanel, CellState, CollectionPanel, Frame, Scenario } from "./types";

const PLAY_INTERVAL_MS = 1400;

export function Visualizer({ id }: { id: string }) {
  const scenario = useMemo<Scenario | null>(() => scenarios[id]?.() ?? null, [id]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const total = scenario?.frames.length ?? 0;
  const atEnd = step >= total - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), PLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [playing, atEnd, step]);

  if (!scenario) {
    return <p className="text-rose-600">Unknown visualization: {id}</p>;
  }

  const frame = scenario.frames[step];

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setStep((s) => Math.min(s + 1, total - 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setStep((s) => Math.max(s - 1, 0));
    }
  }

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label={`${scenario.title} visualization`}
      className="not-prose my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <h4 className="font-semibold">{scenario.title}</h4>
        <code className="font-mono text-xs text-slate-500 dark:text-slate-400">{scenario.input}</code>
      </header>

      <div className="space-y-5 px-5 py-6">
        {frame.array && (
          <ArrayRow panel={mainArray(frame)} kind={scenario.kind ?? "array"} cycleTo={scenario.cycleTo} />
        )}
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

        <p
          aria-live="polite"
          className="min-h-[3.5rem] rounded-lg bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-950 dark:bg-brand-950/50 dark:text-brand-100"
        >
          {frame.message}
        </p>
      </div>

      <footer className="flex items-center gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
        <ControlButton label="Restart" onClick={() => { setPlaying(false); setStep(0); }} disabled={step === 0}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
        </ControlButton>
        <ControlButton label="Previous step" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
          <path d="M15 18l-6-6 6-6" />
        </ControlButton>
        <button
          type="button"
          onClick={() => {
            if (atEnd) setStep(0);
            setPlaying((p) => !p || atEnd);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {playing ? "Pause" : atEnd ? "Replay" : "Play"}
        </button>
        <ControlButton label="Next step" onClick={() => setStep((s) => Math.min(s + 1, total - 1))} disabled={atEnd}>
          <path d="M9 18l6-6-6-6" />
        </ControlButton>
        <input
          type="range"
          min={0}
          max={total - 1}
          value={step}
          onChange={(e) => {
            setPlaying(false);
            setStep(Number(e.target.value));
          }}
          aria-label="Step"
          className="ml-2 hidden flex-1 accent-brand-600 sm:block"
        />
        <span className="ml-auto font-mono text-xs text-slate-500 sm:ml-2 dark:text-slate-400">
          {step + 1} / {total}
        </span>
      </footer>
    </section>
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

function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
