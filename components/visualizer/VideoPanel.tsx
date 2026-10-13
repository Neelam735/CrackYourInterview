"use client";

import videos from "./videos.json";

type VideoInfo = { duration: number; bytes: number };
const manifest = videos as Record<string, VideoInfo>;

export function videoFor(id: string): VideoInfo | undefined {
  return manifest[id];
}

export function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Inline player for the pre-rendered, narrated MP4 of a visualization.
export function VideoPanel({ id, title, info }: { id: string; title: string; info: VideoInfo }) {
  const src = `/videos/${id}.mp4`;
  return (
    <div className="border-b border-slate-200 bg-slate-950 dark:border-slate-800">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- the narration is shown on screen as subtitles */}
      <video src={src} poster={`/videos/${id}.jpg`} controls autoPlay preload="metadata" className="aspect-video w-full" aria-label={`${title} narrated video`} />
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-5 py-2 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
        <span>
          Narrated walkthrough · {formatDuration(info.duration)} · MP4 {(info.bytes / 1_000_000).toFixed(1)} MB
        </span>
        <a
          href={src}
          download={`${id}.mp4`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
          </svg>
          Download MP4
        </a>
      </div>
    </div>
  );
}
