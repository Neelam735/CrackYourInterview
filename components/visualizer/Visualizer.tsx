"use client";

import { useEffect, useMemo, useState } from "react";
import { scenarios } from "./scenarios";
import type { Frame, PointerColor, Scenario } from "./types";

const pointerColors: Record<PointerColor, string> = {
  blue: "bg-brand-600 text-white",
  green: "bg-emerald-600 text-white",
  rose: "bg-rose-600 text-white",
  amber: "bg-amber-500 text-slate-950",
  violet: "bg-violet-600 text-white",
};

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
        <Cells frame={frame} kind={scenario.kind ?? "array"} cycleTo={scenario.cycleTo} />

        {(frame.variables || frame.stack) && (
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
            {frame.stack && <StackView items={frame.stack} label={frame.stackLabel ?? "stack"} />}
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

function Cells({ frame, kind, cycleTo }: { frame: Frame; kind: "array" | "list"; cycleTo?: number }) {
  const isList = kind === "list";

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex w-max items-start">
        {frame.array.map((value, index) => {
          const inWindow = frame.window && index >= frame.window[0] && index <= frame.window[1];
          const highlighted = frame.highlight?.includes(index);
          const dimmed = frame.dimmed?.includes(index);
          const pointers = frame.pointers?.filter((p) => p.index === index) ?? [];

          let cellClass =
            "border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
          if (inWindow) cellClass = "border-brand-400 bg-brand-100 text-brand-950 dark:border-brand-600 dark:bg-brand-900/60 dark:text-white";
          if (highlighted) cellClass = "border-emerald-500 bg-emerald-100 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-900/60 dark:text-white";
          if (dimmed) cellClass = "border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600";

          return (
            <div key={index} className="flex items-start">
              <div className="flex w-12 flex-col items-center">
                <div
                  className={`grid h-12 w-12 place-items-center border-2 font-mono text-base font-semibold transition-colors duration-300 ${
                    isList ? "rounded-full" : "rounded-lg"
                  } ${cellClass}`}
                >
                  {value}
                </div>
                <span className="mt-1 font-mono text-[11px] text-slate-400">{index}</span>
                <div className="mt-1 flex min-h-[2.25rem] flex-col items-center gap-1">
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
                </div>
              </div>
              {isList && index < frame.array.length - 1 && (
                <span className="mt-3 w-6 text-center text-slate-400" aria-hidden>
                  →
                </span>
              )}
              {!isList && index < frame.array.length - 1 && <span className="w-1.5" />}
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
  );
}

function StackView({ items, label }: { items: (number | string)[]; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex min-h-9 min-w-24 items-center gap-1 rounded-lg border-2 border-dashed border-slate-300 px-1.5 py-1 dark:border-slate-700">
        {items.length === 0 ? (
          <span className="px-1 text-xs italic text-slate-400">empty</span>
        ) : (
          items.map((item, i) => (
            <span
              key={i}
              className={`rounded-md px-2 py-1 font-mono text-xs font-semibold ${
                i === items.length - 1
                  ? "bg-violet-600 text-white"
                  : "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100"
              }`}
            >
              {item}
            </span>
          ))
        )}
      </div>
      <span className="text-xs text-slate-400">← top</span>
    </div>
  );
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
