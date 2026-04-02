import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Retune } from "retune";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import "./globals.css";
import "./theme.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tonal-OKLCh",
  description: "HCT's approach applied to OKLCh for lightness-uniform, contrast-consistent color palettes.",
  verification: {
    google: "bnQWieKWhPNzjBQy4CSGCs0C9TtFt4pqGs-W_HpocXs",
  },
  openGraph: {
    title: "Tonal-OKLCh",
    description: "HCT's approach applied to OKLCh for lightness-uniform, contrast-consistent color palettes.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tonal-OKLCh",
    description: "HCT's approach applied to OKLCh for lightness-uniform, contrast-consistent color palettes.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense>
            <TopNav />
          </Suspense>
          {children}
          <Footer />
          <Analytics />
          <Retune />
        </ThemeProvider>
      </body>
    </html>
  );
}
