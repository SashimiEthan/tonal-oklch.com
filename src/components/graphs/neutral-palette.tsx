"use client";

import { tonalOklchToResult } from "tonal-oklch";
import { Swatch } from "@/components/swatch";

const tones = Array.from({ length: 51 }, (_, i) => 100 - i * 2); // 100 to 0, step -2

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  fontSize: 10,
  textAlign: "center",
  color: "var(--foreground-secondary)",
};

const hueColWidth = 24;
const hueGap = 20;

export function NeutralPalette() {
  return (
    <figure>
      {/* L header */}
      <div style={{ display: "flex", gap: hueGap, width: "100%" }}>
        <div style={{ width: hueColWidth, flexShrink: 0 }} />
        <div style={{ display: "flex", flex: 1 }}>
          {tones.map((tone) => (
            <div key={tone} style={{ flex: 1, ...labelStyle }}>{tone}</div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: hueGap, width: "100%" }}>
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
          0°
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            borderRadius: 2,
          }}
        >
          {tones.map((tone) => {
            const result = tonalOklchToResult({ tone, chroma: 0, hue: 0 });

            return (
              <Swatch
                key={tone}
                hex={result.hex}
                tone={tone}
                hue={0}
                chroma={0}
                oklch={result.oklch}
                rgb={result.rgb8}
                tooltipBelow
                boxShadow={tone === 100 ? "inset 0.5px 0 0 0 var(--border), inset 0 0.5px 0 0 var(--border), inset 0 -0.5px 0 0 var(--border)" : undefined}
                borderRadius={tone === 100 ? "2px 0 0 2px" : undefined}
              />
            );
          })}
        </div>
      </div>
    </figure>
  );
}
