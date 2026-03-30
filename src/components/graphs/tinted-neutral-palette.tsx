"use client";

import { tonalOklchToResult } from "tonal-oklch";
import { Swatch } from "@/components/swatch";

const tones = Array.from({ length: 21 }, (_, i) => 100 - i * 5); // 100 to 0, step -5
const hues = Array.from({ length: 13 }, (_, i) => i * 30); // 0 to 360, step 30

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  fontSize: 10,
  color: "var(--foreground-secondary)",
};

const hueColWidth = 24;
const hueGap = 20;

export function TintedNeutralPalette() {
  return (
    <figure>
      {/* L header row */}
      <div style={{ display: "flex", gap: hueGap, width: "100%" }}>
        <div style={{ width: hueColWidth, flexShrink: 0 }} />
        <div style={{ display: "flex", flex: 1 }}>
          {tones.map((tone) => (
            <div key={tone} style={{ flex: 1, textAlign: "center", ...labelStyle }}>{tone}</div>
          ))}
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
                const result = tonalOklchToResult({
                  tone,
                  chroma: 0.01,
                  hue,
                });

                return (
                  <Swatch
                    key={tone}
                    hex={result.hex}
                    tone={tone}
                    hue={hue}
                    chroma={0.01}
                    oklch={result.oklch}
                    rgb={result.rgb8}
                    boxShadow={tone === 100 ? [
                      "inset 0.5px 0 0 0 var(--border)",
                      ...(hueIdx === 0 ? ["inset 0 0.5px 0 0 var(--border)"] : []),
                      ...(hueIdx === hues.length - 1 ? ["inset 0 -0.5px 0 0 var(--border)"] : []),
                    ].join(", ") : undefined}
                    borderRadius={tone === 100 ? (
                      hueIdx === 0 ? "2px 0 0 0" :
                      hueIdx === hues.length - 1 ? "0 0 0 2px" : undefined
                    ) : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
