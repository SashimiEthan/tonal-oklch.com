"use client";

export function OklchGrayscaleRamp() {
  const steps = Array.from({ length: 26 }, (_, i) => i * 2); // 0 to 50 in increments of 2

  return (
    <figure>
      <div style={{ display: "flex", width: "100%", borderRadius: 2, overflow: "hidden" }}>
        {steps.map((lightness) => (
          <div
            key={lightness}
            style={{
              flex: 1,
              aspectRatio: undefined,
              height: 80,
              background: `oklch(${lightness}% 0 0)`,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                fontFamily: "var(--font-geist-mono)",
                fontSize: 12,
                lineHeight: 1,
                color: "white",
              }}
            >
              {lightness}
            </span>
          </div>
        ))}
      </div>
      <figcaption>OKLCh grayscale ramp showing compressed dark end (L: 0–50, increment of 2)</figcaption>
    </figure>
  );
}
