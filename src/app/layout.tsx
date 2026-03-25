import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Retune } from "retune";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Retune />
      </body>
    </html>
  );
}
