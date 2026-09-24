import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { ui } from "@/components/ui/ui-strings";
import "./globals.css";

// Fonts: committed WOFF2 from the official upstream (work/04-app/fonts.md, brief A12).
const atkinsonNext = localFont({
  src: "./fonts/AtkinsonHyperlegibleNext-Variable.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-atkinson-next",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: true,
});

// Italic: a separate face so it is not preloaded (italic is rare in lessons; roman and mono are).
const atkinsonNextItalic = localFont({
  src: "./fonts/AtkinsonHyperlegibleNext-Italic-Variable.woff2",
  weight: "200 800",
  style: "italic",
  variable: "--font-atkinson-next-italic",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: false,
});

const atkinsonMono = localFont({
  src: "./fonts/AtkinsonHyperlegibleMono-Variable.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-atkinson-mono",
  display: "swap",
  adjustFontFallback: false,
  preload: true,
});

const site = ui();

export const metadata: Metadata = {
  title: { default: site.siteName, template: `%s · ${site.siteName}` },
  description: "A free reading course from zero programming to CCC Senior, in Python 3.8.",
};

// Light mode only (plan §4.9): emits <meta name="color-scheme" content="light">.
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbfdfd",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-CA"
      className={`${atkinsonNext.variable} ${atkinsonNextItalic.variable} ${atkinsonMono.variable}`}
    >
      <body className="min-h-dvh bg-board font-sans text-ink">
        <a
          href="#content"
          className="sr-only-focusable fixed top-2 left-2 z-50 rounded-control bg-ink px-4 py-2 font-semibold text-paper"
        >
          {site.skipLink}
        </a>
        {children}
      </body>
    </html>
  );
}
