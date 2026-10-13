import type { Metadata } from "next";
import { scenarios } from "@/components/visualizer/scenarios";

// Lists the visualization ids for scripts/video/capture.mjs.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RenderIndex() {
  return <pre id="video-ids">{JSON.stringify(Object.keys(scenarios))}</pre>;
}
