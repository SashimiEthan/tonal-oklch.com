"use client";

import { useMemo, useState } from "react";
import { tonalOklchToResult, wcagLuminance, wcagContrast } from "tonal-oklch";
import { Swatch } from "@/components/swatch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tones = Array.from({ length: 21 }, (_, i) => {
  const t = 100 - i * 5;
  return t === 50 ? 49.84 : t;
});
const hues = Array.from({ length: 13 }, (_, i) => i * 30); // 0 to 360, step 30

const hueLabels: Record<number, string> = {
  0: "Red", 30: "Orange", 60: "Yellow", 90: "Lime",
  120: "Green", 150: "Teal", 180: "Cyan", 210: "Sky",
  240: "Blue", 270: "Indigo", 300: "Purple", 330: "Pink",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  fontSize: 10,
  color: "var(--foreground-secondary)",
};

const hueColWidth = 24;
const hueGap = 20;

export function VibrantPalette() {
  const [refHue, setRefHue] = useState<string>("240");

  const chromaByTone = useMemo(() => {
    const hue = Number(refHue);
    return Object.fromEntries(
      tones.map((tone) => {
        const { oklch } = tonalOklchToResult({ tone, chroma: 0.5, hue });
        return [tone, oklch.c];
      })
    );
  }, [refHue]);

  const contrastSpread = useMemo(() => {
    return Object.fromEntries(
      tones.map((tone) => {
        const contrasts = hues.map((hue) => {
          const chroma = chromaByTone[tone];
          const { rgb8 } = tonalOklchToResult({ tone, chroma, hue });
          const raw = wcagContrast(
            wcagLuminance(rgb8.r / 255, rgb8.g / 255, rgb8.b / 255),
            1,
          );
          // Use the floored value (matching what's displayed on swatches)
          return Math.floor(raw * 100) / 100;
        });
        const min = Math.min(...contrasts);
        const max = Math.max(...contrasts);
        const delta = max - min;
        return [tone, { min, max, delta }];
      })
    );
  }, [chromaByTone]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-content)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Vibrant</h1>
        <span style={{ marginLeft: "auto", fontSize: 14, color: "var(--foreground-primary)" }}>
          Set each stop's chroma using hue
        </span>
        <Select value={refHue} onValueChange={(val) => setRefHue(val ?? "240")}>
          <SelectTrigger size="sm" style={{ width: 80, height: 36 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hues.slice(0, -1).map((h) => (
              <SelectItem key={h} value={String(h)}>
                {h}°
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span style={{ fontSize: 14, color: "var(--foreground-primary)" }}>
          's max chroma
        </span>
      </div>
      <figure>
      {/* L header row */}
      <div style={{ display: "flex", gap: hueGap, width: "100%" }}>
        <div style={{ width: hueColWidth, flexShrink: 0, ...labelStyle, textAlign: "right" }}>L</div>
        <div style={{ display: "flex", flex: 1 }}>
          {tones.map((tone) => (
            <div key={tone} style={{ flex: 1, textAlign: "center", ...labelStyle }}>{tone}</div>
          ))}
        </div>
      </div>
      {/* C (chroma) header row */}
      <div style={{ display: "flex", gap: hueGap, width: "100%" }}>
        <div style={{ width: hueColWidth, flexShrink: 0, ...labelStyle, textAlign: "right" }}>C</div>
        <div style={{ display: "flex", flex: 1 }}>
          {tones.map((tone) => {
            const c = chromaByTone[tone];
            return (
              <div key={tone} style={{ flex: 1, textAlign: "center", ...labelStyle }}>
                {c.toFixed(4)}
              </div>
            );
          })}
        </div>
      </div>
      {/* Contrast spread row */}
      <div style={{ display: "flex", gap: hueGap, width: "100%" }}>
        <div style={{ width: hueColWidth, flexShrink: 0, ...labelStyle, textAlign: "right" }}>ΔCr</div>
        <div style={{ display: "flex", flex: 1 }}>
          {tones.map((tone) => {
            const { delta } = contrastSpread[tone];
            return (
              <div key={tone} style={{ flex: 1, textAlign: "center", ...labelStyle }}>
                {(Math.round(delta * 100) / 100).toFixed(2)}
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          borderRadius: 2,
        }}
      >
        {hues.map((hue, hueIdx) => (
          <div key={hue} style={{ display: "flex", gap: hueGap, width: "100%" }}>
            {/* H label */}
            <div
              style={{
                width: hueColWidth,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                ...labelStyle,
              }}
            >
              {hue}°
            </div>
            <div style={{ display: "flex", flex: 1 }}>
            {tones.map((tone) => {
              const chroma = chromaByTone[tone];
              const result = tonalOklchToResult({
                tone,
                chroma,
                hue,
              });
              const { hex, rgb8 } = result;
              const contrast = wcagContrast(
                wcagLuminance(rgb8.r / 255, rgb8.g / 255, rgb8.b / 255),
                1,
              );

              return (
                <Swatch
                  key={tone}
                  hex={hex}
                  tone={tone}
                  hue={hue}
                  chroma={chroma}
                  oklch={result.oklch}
                  rgb={rgb8}
                  boxShadow={tone === 100 ? [
                    "inset 0.5px 0 0 0 var(--border)",
                    ...(hueIdx === 0 ? ["inset 0 0.5px 0 0 var(--border)"] : []),
                    ...(hueIdx === hues.length - 1 ? ["inset 0 -0.5px 0 0 var(--border)"] : []),
                  ].join(", ") : undefined}
                  borderRadius={tone === 100 ? (
                    hueIdx === 0 ? "2px 0 0 0" :
                    hueIdx === hues.length - 1 ? "0 0 0 2px" : undefined
                  ) : undefined}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: 10,
                      lineHeight: 1,
                      color: tone > 50 ? "black" : "white",
                    }}
                  >
                    {(Math.floor(contrast * 100) / 100).toFixed(2)}
                  </span>
                </Swatch>
              );
            })}
            </div>
          </div>
        ))}
      </div>
    </figure>
    </div>
  );
}
