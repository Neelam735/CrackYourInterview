import type { Metadata } from "next";
import { authEnabled } from "@/auth";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CrackYourInterview — Coding interview patterns, explained visually",
    template: "%s | CrackYourInterview",
  },
  description:
    "Learn the patterns behind coding interview questions with step-by-step visual walkthroughs.",
};

// Applied before paint so the page doesn't flash the wrong theme.
const themeScript = `
try {
  var t = localStorage.getItem("theme");
  if (t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <Providers authEnabled={authEnabled}>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
