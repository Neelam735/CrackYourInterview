"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Spoken narration for visualizations, using the browser's built-in speech
// engine (Web Speech API). No server or API key is needed; voice quality
// depends on the voices the reader's browser and OS provide.

export type NarrationSettings = {
  enabled: boolean;
  voiceURI: string | null;
  rate: number;
};

const STORAGE_KEY = "narration";
const DEFAULT_SETTINGS: NarrationSettings = { enabled: true, voiceURI: null, rate: 1 };
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSettings = DEFAULT_SETTINGS;

function readSettings(): NarrationSettings {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {}
  // useSyncExternalStore needs a stable object while the stored value is unchanged.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSettings = { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
    } catch {
      cachedSettings = DEFAULT_SETTINGS;
    }
  }
  return cachedSettings;
}

export function updateNarrationSettings(patch: Partial<NarrationSettings>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSettings(), ...patch }));
  } catch {}
  listeners.forEach((listener) => listener());
}

export function useNarrationSettings(): NarrationSettings {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    readSettings,
    () => DEFAULT_SETTINGS,
  );
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

// Voices load asynchronously in most browsers.
export function useEnglishVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!speechSupported()) return;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en")));
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return voices;
}

// Prefer the natural-sounding neural voices that Edge, Chrome and macOS ship.
const PREFERRED = /natural|neural|online|google|samantha|aria|jenny|guy|daniel|karen/i;

export function sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const score = (v: SpeechSynthesisVoice) =>
    (PREFERRED.test(v.name) ? 0 : 2) + (v.lang.toLowerCase() === "en-us" ? 0 : 1);
  return [...voices].sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
}

function pickVoice(voiceURI: string | null): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  return voices.find((v) => v.voiceURI === voiceURI) ?? sortVoices(voices)[0];
}

// Visualization messages use symbols that speech engines read badly.
export function toSpeech(text: string): string {
  return text
    .replace(/(\w+)\[([^\]]+)\]\[([^\]]+)\]/g, "$1 of $2, $3")   // dp[i][j]
    .replace(/(\w+)\[([^\]]+)\]/g, "$1 of $2")                  // nums[mid]
    .replace(/O\(([^)]+)\)/g, "O of $1")
    .replace(/\[\]/g, "an empty list")
    .replace(/\[([-\d\s,]+)\]/g, "$1")                         // number lists: [1, 2, 3]
    .replace(/#(\d+)/g, "number $1")
    .replace(/→/g, " to ")
    .replace(/←/g, " back to ")
    .replace(/↺/g, " loops back to ")
    .replace(/≠/g, " is not equal to ")
    .replace(/≤|<=/g, " is at most ")
    .replace(/≥|>=/g, " is at least ")
    .replace(/ < /g, " is less than ")
    .replace(/ > /g, " is greater than ")
    .replace(/ = /g, " equals ")
    .replace(/ \+ /g, " plus ")
    .replace(/ - /g, " minus ")
    .replace(/ × /g, " times ")
    .replace(/²/g, " squared")
    .replace(/³/g, " cubed")
    .replace(/°/g, " degrees")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Speaks `text` and calls `onDone` once when it finishes, is interrupted, or
 * takes far longer than expected (some engines never fire `end`).
 * Returns a function that detaches `onDone` without stopping the speech.
 */
export function speak(text: string, settings: NarrationSettings, onDone: () => void): () => void {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(settings.voiceURI);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "en-US";
  utterance.rate = settings.rate;

  let finished = false;
  const words = text.split(/\s+/).length;
  const fallback = setTimeout(() => finish(), (words / (2.6 * settings.rate)) * 1000 + 2500);
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    onDone();
  }
  utterance.onend = finish;
  utterance.onerror = finish;
  synth.speak(utterance);
  return () => {
    finished = true;
    clearTimeout(fallback);
  };
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

// Only one visualization narrates at a time: starting one pauses the others.
const pauseHandlers = new Map<symbol, () => void>();

export function registerNarrator(id: symbol, pause: () => void) {
  pauseHandlers.set(id, pause);
  return () => {
    pauseHandlers.delete(id);
  };
}

export function claimNarration(id: symbol) {
  pauseHandlers.forEach((pause, other) => {
    if (other !== id) pause();
  });
}
