"use client";

import { useMemo } from "react";
import Color from "colorjs.io";
import { Chromator } from "chromator";
import { converter, clampChroma, parse } from "culori";
import { wcagLuminance, wcagContrast } from "tonal-oklch";

const toRgb = converter("rgb");

function contrastFromRgb(r: number, g: number, b: number): number {
  return wcagContrast(wcagLuminance(r / 255, g / 255, b / 255), 1);
}

function contrastFromCss(cssColor: string): number {
  const rgb = toRgb(parse(cssColor)!);
  const r = Math.round(Math.max(0, Math.min(1, rgb!.r)) * 255);
  const g = Math.round(Math.max(0, Math.min(1, rgb!.g)) * 255);
  const b = Math.round(Math.max(0, Math.min(1, rgb!.b)) * 255);
  return contrastFromRgb(r, g, b);
}

// Facelessuser's toe constants (K1=0.173, K2=0.004)
const FK1 = 0.173;
const FK2 = 0.004;
const FK3 = (1 + FK1) / (1 + FK2);

function facelessuserToeInv(Lr: number): number {
  return (Lr * Lr + FK1 * Lr) / (FK3 * (Lr + FK2));
}

interface StripData {
  hue: number;
  hex: string;
  contrast: number;
}

function computeOklrch(Lr: number, chroma: number): StripData[] {
  const steps = Array.from({ length: 13 }, (_, i) => i * 30);
  return steps.map((hue) => {
    const c = new Color("oklrch", [Lr, chroma, hue])
      .toGamut({ space: "srgb", method: "oklch.c" })
      .to("srgb");
    const [r, g, b] = c.coords.map((v: number | null) =>
      Math.round(Math.max(0, Math.min(1, v ?? 0)) * 255)
    );
    const hex = `#${[r, g, b].map((v: number) => v.toString(16).padStart(2, "0")).join("")}`;
    return { hue, hex, contrast: contrastFromRgb(r, g, b) };
  });
}

function computeFacelessuser(Lr: number, chroma: number): StripData[] {
  const L = facelessuserToeInv(Lr);
  const steps = Array.from({ length: 13 }, (_, i) => i * 30);
  return steps.map((hue) => {
    const clamped = clampChroma({ mode: "oklch", l: L, c: chroma, h: hue }, "oklch");
    const rgb = toRgb(clamped);
    const r = Math.round(Math.max(0, Math.min(1, rgb!.r)) * 255);
    const g = Math.round(Math.max(0, Math.min(1, rgb!.g)) * 255);
    const b = Math.round(Math.max(0, Math.min(1, rgb!.b)) * 255);
    const hex = `#${[r, g, b].map((v: number) => v.toString(16).padStart(2, "0")).join("")}`;
    return { hue, hex, contrast: contrastFromRgb(r, g, b) };
  });
}

function computeChromator(l: number, chroma: number): StripData[] {
  const steps = Array.from({ length: 13 }, (_, i) => i * 30);
  return steps.map((hue) => {
    const ch = new Chromator({ l, chroma, hue });
    const hex = ch.getHexCode();
    const rgb = toRgb(parse(hex)!);
    const r = Math.round(Math.max(0, Math.min(1, rgb!.r)) * 255);
    const g = Math.round(Math.max(0, Math.min(1, rgb!.g)) * 255);
    const b = Math.round(Math.max(0, Math.min(1, rgb!.b)) * 255);
    return { hue, hex, contrast: contrastFromRgb(r, g, b) };
  });
}

function Strip({ data }: { data: StripData[] }) {
  return (
    <div style={{ display: "flex", width: "100%" }}>
      {data.map(({ hue, hex, contrast }) => (
        <div
          key={hue}
          style={{
            flex: 1,
            height: 80,
            background: hex,
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
      ))}
    </div>
  );
}

export function AlternativeHueRamps() {
  const oklrchData = useMemo(() => computeOklrch(0.524, 0.15), []);
  const facelessData = useMemo(() => computeFacelessuser(0.521, 0.15), []);
  const chromatorData = useMemo(() => computeChromator(0.5878, 0.15), []);

  return (
    <figure>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 2, overflow: "hidden" }}>
        <Strip data={oklrchData} />
        <Strip data={facelessData} />
        <Strip data={chromatorData} />
      </div>
      <figcaption>
        Inconsistent contrast ratios in alternative hue ramps
        <br />(Top: OKLrCh Lr=52.4%. Middle: facelessuser&apos;s constants Lr=52.1%. Bottom: Chromator L=58.78%. C=0.15 (simple gamut clampping), H=0–360, increment of 30)
      </figcaption>
    </figure>
  );
}
