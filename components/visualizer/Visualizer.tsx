"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  claimNarration,
  registerNarrator,
  sortVoices,
  speak,
  speechSupported,
  stopSpeaking,
  toSpeech,
  updateNarrationSettings,
  useEnglishVoices,
  useNarrationSettings,
} from "./narration";
import { FrameView } from "./FrameView";
import { formatDuration, VideoPanel, videoFor } from "./VideoPanel";
import { scenarios } from "./scenarios";
import type { Scenario } from "./types";

const PLAY_INTERVAL_MS = 1400;
const PAUSE_AFTER_SPEECH_MS = 450;

export function Visualizer({ id }: { id: string }) {
  const scenario = useMemo<Scenario | null>(() => scenarios[id]?.() ?? null, [id]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const video = videoFor(id);
  const settings = useNarrationSettings();
  const voices = useEnglishVoices();

  const total = scenario?.frames.length ?? 0;
  const atEnd = step >= total - 1;
  const narrating = supported && settings.enabled;

  // Refs let speech callbacks see the latest state without re-subscribing.
  const narratorId = useRef(Symbol("narrator"));
  const playingRef = useRef(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const pendingRef = useRef<{ detach?: () => void; timer?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => setSupported(speechSupported()), []);

  function clearPending() {
    pendingRef.current.detach?.();
    clearTimeout(pendingRef.current.timer);
    pendingRef.current = {};
  }

  function stop() {
    playingRef.current = false;
    setPlaying(false);
    clearPending();
    setSpeaking(false);
  }

  // Read step `i` aloud. While playing, move to the next step once it's spoken.
  function narrate(i: number) {
    if (!scenario) return;
    clearPending();
    claimNarration(narratorId.current);
    setSpeaking(true);
    pendingRef.current.detach = speak(toSpeech(scenario.frames[i].message), settingsRef.current, () => {
      setSpeaking(false);
      if (!playingRef.current) return;
      if (i >= scenario.frames.length - 1) {
        stop();
        return;
      }
      pendingRef.current.timer = setTimeout(() => {
        if (!playingRef.current) return;
        setStep(i + 1);
        narrate(i + 1);
      }, PAUSE_AFTER_SPEECH_MS);
    });
  }

  // Another visualization started talking: pause this one.
  useEffect(
    () =>
      registerNarrator(narratorId.current, () => {
        playingRef.current = false;
        setPlaying(false);
        clearPending();
        setSpeaking(false);
      }),
    [],
  );

  // Stop talking when the visualization leaves the page.
  useEffect(
    () => () => {
      if (pendingRef.current.detach) stopSpeaking();
      clearPending();
    },
    [],
  );

  // Without narration, playback advances on a fixed timer.
  useEffect(() => {
    if (!playing || narrating) return;
    if (atEnd) {
      stop();
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), PLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [playing, narrating, atEnd, step]);

  if (!scenario) {
    return <p className="text-rose-600">Unknown visualization: {id}</p>;
  }

  const frame = scenario.frames[step];

  // Manual navigation pauses playback and, with narration on, reads the new step.
  function goTo(i: number) {
    const next = Math.max(0, Math.min(i, total - 1));
    playingRef.current = false;
    setPlaying(false);
    setStep(next);
    if (narrating) narrate(next);
    else clearPending();
  }

  function togglePlay() {
    if (playing) {
      stop();
      if (narrating) stopSpeaking();
      return;
    }
    const start = atEnd ? 0 : step;
    setStep(start);
    playingRef.current = true;
    setPlaying(true);
    if (narrating) narrate(start);
  }

  function toggleNarration() {
    const enabled = !settings.enabled;
    updateNarrationSettings({ enabled });
    if (!enabled) {
      stopSpeaking();
      clearPending();
      setSpeaking(false);
    } else if (playing) {
      narrate(step); // switch the running playback over to narration
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const tag = (event.target as HTMLElement).tagName;
    if (tag === "SELECT" || tag === "INPUT") return; // let form controls handle their own keys
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(step + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(step - 1);
    }
  }

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label={`${scenario.title} visualization`}
      className="not-prose my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <h4 className="font-semibold">{scenario.title}</h4>
        <div className="flex flex-wrap items-center gap-3">
          <code className="font-mono text-xs text-slate-500 dark:text-slate-400">{scenario.input}</code>
          {video && (
            <button
              type="button"
              onClick={() => {
                if (!showVideo) stop(); // don't talk over the video
                if (!showVideo && narrating) stopSpeaking();
                setShowVideo((v) => !v);
              }}
              aria-expanded={showVideo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-brand-300"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                {showVideo ? <path d="M6 6h12v12H6z" /> : <path d="M8 5v14l11-7z" />}
              </svg>
              {showVideo ? "Close video" : `Video ${formatDuration(video.duration)}`}
            </button>
          )}
        </div>
      </header>

      {showVideo && video && <VideoPanel id={id} title={scenario.title} info={video} />}

      <div className="space-y-5 px-5 py-6">
        <FrameView scenario={scenario} frame={frame} />

        <p
          aria-live={narrating ? "off" : "polite"}
          className="flex min-h-[3.5rem] items-start gap-3 rounded-lg bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-950 dark:bg-brand-950/50 dark:text-brand-100"
        >
          {speaking && <SpeakingIndicator />}
          <span>{frame.message}</span>
        </p>
      </div>

      <footer className="flex items-center gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
        <ControlButton label="Restart" onClick={() => goTo(0)} disabled={step === 0}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
        </ControlButton>
        <ControlButton label="Previous step" onClick={() => goTo(step - 1)} disabled={step === 0}>
          <path d="M15 18l-6-6 6-6" />
        </ControlButton>
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {playing ? "Pause" : atEnd ? "Replay" : "Play"}
        </button>
        <ControlButton label="Next step" onClick={() => goTo(step + 1)} disabled={atEnd}>
          <path d="M9 18l6-6-6-6" />
        </ControlButton>
        <input
          type="range"
          min={0}
          max={total - 1}
          value={step}
          onChange={(e) => goTo(Number(e.target.value))}
          aria-label="Step"
          className="ml-2 hidden flex-1 accent-brand-600 sm:block"
        />
        <span className="ml-auto font-mono text-xs text-slate-500 sm:ml-2 dark:text-slate-400">
          {step + 1} / {total}
        </span>
        {supported && (
          <button
            type="button"
            onClick={toggleNarration}
            aria-pressed={settings.enabled}
            aria-label={settings.enabled ? "Turn narration off" : "Turn narration on"}
            title={settings.enabled ? "Narration on" : "Narration off"}
            className={`rounded-lg p-1.5 ${
              settings.enabled
                ? "text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/50"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              {settings.enabled ? (
                <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
              ) : (
                <path d="M22 9l-6 6M16 9l6 6" />
              )}
            </svg>
          </button>
        )}
      </footer>

      {narrating && voices.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 bg-slate-50 px-5 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          <label className="flex min-w-0 items-center gap-2">
            Voice
            <select
              value={settings.voiceURI ?? sortVoices(voices)[0]?.voiceURI ?? ""}
              onChange={(e) => updateNarrationSettings({ voiceURI: e.target.value })}
              className="min-w-0 max-w-56 truncate rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950"
            >
              {sortVoices(voices).map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Speed
            <select
              value={settings.rate}
              onChange={(e) => updateNarrationSettings({ rate: Number(e.target.value) })}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950"
            >
              {[0.75, 0.9, 1, 1.15, 1.3, 1.5].map((r) => (
                <option key={r} value={r}>
                  {r}×
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </section>
  );
}

function SpeakingIndicator() {
  return (
    <span className="mt-1.5 flex h-3 shrink-0 items-end gap-0.5" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-0.5 animate-pulse rounded-full bg-brand-500"
          style={{ height: delay === 150 ? "100%" : "60%", animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
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
