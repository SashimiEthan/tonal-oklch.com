"use client";

import { converter, parse } from "culori";
import { wcagLuminance, wcagContrast } from "tonal-oklch";

const toRgb = converter("rgb");

function contrastAgainstWhite(cssColor: string): number {
  const rgb = toRgb(parse(cssColor)!);
  const r = Math.round(Math.max(0, Math.min(1, rgb!.r)) * 255) / 255;
  const g = Math.round(Math.max(0, Math.min(1, rgb!.g)) * 255) / 255;
  const b = Math.round(Math.max(0, Math.min(1, rgb!.b)) * 255) / 255;
  return wcagContrast(wcagLuminance(r, g, b), 1);
}

function HueRampStrip({ lightness, chroma }: { lightness: number; chroma: number }) {
  const steps = Array.from({ length: 13 }, (_, i) => i * 30);

  return (
    <div style={{ display: "flex", width: "100%" }}>
      {steps.map((hue) => {
        const cssColor = `oklch(${lightness}% ${chroma} ${hue})`;
        const contrast = contrastAgainstWhite(cssColor);

        return (
          <div
            key={hue}
            style={{
              flex: 1,
              height: 80,
              background: cssColor,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 12,
              gap: 4,
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 12,
                lineHeight: 1,
                color: "white",
              }}
            >
              {`${hue}°`}
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 12,
                lineHeight: 1,
                color: "white",
              }}
            >
              {(Math.floor(contrast * 100) / 100).toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function OklchHueRamp() {
  return (
    <figure>
      <div style={{ borderRadius: 2, overflow: "hidden" }}>
        <HueRampStrip lightness={58.78} chroma={0.15} />
      </div>
      <figcaption>OKLCh hue ramp showing inconsistent contrast ratios against white (L=58.78, C=0.15, H=0–360, increment of 30)</figcaption>
    </figure>
  );
}

export function OklchHueRampL53() {
  return (
    <figure>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 2, overflow: "hidden" }}>
        <HueRampStrip lightness={58.78} chroma={0.15} />
        <HueRampStrip lightness={53} chroma={0.15} />
      </div>
      <figcaption>OKLCh hue ramp comparison at two lightness levels (Top: L=58.78, Bottom: L=53, C=0.15, H=0–360, increment of 30)</figcaption>
    </figure>
  );
}
