import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { Retune } from "retune";
import "./globals.css";

const soehne = localFont({
  src: "../fonts/soehne-buch.woff2",
  weight: "400",
  variable: "--font-soehne",
});

const soehneBreit = localFont({
  src: [
    { path: "../fonts/soehne-breit-halbfett.woff2", weight: "600" },
    { path: "../fonts/soehne-breit-dreiviertelfett.woff2", weight: "700" },
  ],
  variable: "--font-soehne-breit",
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
    <html lang="en" className={`${soehne.variable} ${soehneBreit.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Retune />
      </body>
    </html>
  );
}
