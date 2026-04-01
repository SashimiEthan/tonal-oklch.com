"use client";

import { tonalOklchToResult, wcagLuminance, wcagContrast } from "tonal-oklch";

export function TonalOklchHueRamp() {
  const tone = 49.84;
  const chroma = 0.15;
  const steps = Array.from({ length: 13 }, (_, i) => i * 30);

  const data = steps.map((hue) => {
    const result = tonalOklchToResult({ tone, chroma, hue });
    const { r, g, b } = result.rgb8;
    const contrast = wcagContrast(wcagLuminance(r / 255, g / 255, b / 255), 1);
    return { hue, hex: result.hex, contrast };
  });

  return (
    <figure>
      <div style={{ borderRadius: 2, overflow: "hidden" }}>
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
      </div>
      <figcaption>
        Consistent contrast ratios in Tonal-OKLCh hue ramp (Tone=49.84%, C=0.15, H=0–360, increment of 30)
      </figcaption>
    </figure>
  );
}
