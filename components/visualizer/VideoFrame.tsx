"use client";

import { useEffect, useMemo, useState } from "react";
import { FrameView } from "./FrameView";
import { toSpeech } from "./narration";
import { scenarios } from "./scenarios";

export type VideoScript = {
  id: string;
  title: string;
  /** One entry per slide: intro, every step, outro. */
  narration: string[];
};

declare global {
  interface Window {
    __video?: VideoScript & { show: (slide: number) => Promise<void> };
  }
}

const OUTRO = "That's the whole walkthrough. Find more step-by-step lessons at Crack Your Interview.";

// A fixed 1280×720 stage. Slide 0 is the title card, slides 1..n are the
// steps, and the last slide is the outro. scripts/video drives it through
// window.__video.show(slide) and screenshots each slide.
export function VideoFrame({ id }: { id: string }) {
  const scenario = useMemo(() => scenarios[id](), [id]);
  const steps = scenario.frames.length;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    window.__video = {
      id,
      title: scenario.title,
      narration: [
        `${toSpeech(scenario.title)}. Let's walk through it step by step.`,
        ...scenario.frames.map((frame) => toSpeech(frame.message)),
        OUTRO,
      ],
      show: (n: number) =>
        new Promise<void>((resolve) => {
          setSlide(n);
          // Wait for React to commit and the browser to paint.
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    };
    document.documentElement.classList.remove("dark");
    document.body.dataset.videoReady = "true";
  }, [id, scenario]);

  const frame = slide >= 1 && slide <= steps ? scenario.frames[slide - 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start bg-slate-200">
      <div
        id="video-stage"
        className="relative flex h-[720px] w-[1280px] flex-col overflow-hidden bg-white text-slate-900 [&_*]:!transition-none"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-12 py-5">
          <div className="flex items-center gap-3 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm text-white">CY</span>
            CrackYourInterview
          </div>
          <div className="text-base font-medium text-slate-500">{scenario.title}</div>
        </header>

        {slide === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--color-brand-100),transparent_65%)] px-16 text-center">
            <p className="mb-4 rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-700">
              Step-by-step walkthrough
            </p>
            <h1 className="text-6xl font-extrabold tracking-tight">{scenario.title}</h1>
            <code className="mt-8 rounded-xl bg-slate-100 px-6 py-3 font-mono text-xl text-slate-700">{scenario.input}</code>
          </div>
        )}

        {frame && (
          <>
            <div className="flex flex-1 items-center justify-center overflow-hidden px-12">
              {/* Interval bars size to their container, so give them a fixed width. */}
              <div className="space-y-5" style={{ zoom: 1.4, width: frame.intervals ? 820 : undefined }}>
                <FrameView scenario={scenario} frame={frame} />
              </div>
            </div>
            <footer className="border-t border-slate-200 bg-slate-50 px-12 pb-6 pt-5">
              <p className="min-h-[96px] text-[26px] font-medium leading-snug text-slate-900">{frame.message}</p>
              <div className="mt-4 flex items-center gap-4">
                <span className="font-mono text-sm text-slate-500">
                  Step {slide} of {steps}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${(slide / steps) * 100}%` }} />
                </div>
              </div>
            </footer>
          </>
        )}

        {slide === steps + 1 && (
          <div className="flex flex-1 flex-col items-center justify-center px-16 text-center">
            <h2 className="text-5xl font-extrabold tracking-tight">That&apos;s the whole walkthrough</h2>
            <p className="mt-6 text-2xl text-slate-600">
              More step-by-step lessons at <span className="font-semibold text-brand-600">CrackYourInterview</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
