import type { Metadata } from "next";
import { VideoFrame } from "@/components/visualizer/VideoFrame";
import { scenarios } from "@/components/visualizer/scenarios";

// Renders a visualization as 1280×720 video frames for scripts/video.
// Not linked from the site and excluded from search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(scenarios).map((id) => ({ id }));
}

export default async function RenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VideoFrame id={id} />;
}
