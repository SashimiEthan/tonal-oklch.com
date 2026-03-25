import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Retune } from "retune";
import { tonalOklchToResult } from "tonal-oklch";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tonal OKLCh",
  description: "HCT's approach applied to OKLCh for perceptually uniform, contrast-consistent color palettes.",
};

const foregroundPrimary = tonalOklchToResult({ tone: 14, chroma: 0.02, hue: 260 }).hex;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, geistMono.variable)}
      style={{ "--foreground-primary": foregroundPrimary } as React.CSSProperties}
    >
      <body>
        {children}
        <Retune />
      </body>
    </html>
  );
}
