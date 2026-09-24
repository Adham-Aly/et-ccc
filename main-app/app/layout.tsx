import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Placeholder layout so `next build` passes and a first Vercel deploy can work (plan §12 P4
// step 2). The design lead replaces the markup/presentation; the data wiring here stays.
export const metadata: Metadata = {
  title: "et-ccc",
  description: "A free reading course from zero to CCC Senior, in Python 3.8.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body>{children}</body>
    </html>
  );
}
