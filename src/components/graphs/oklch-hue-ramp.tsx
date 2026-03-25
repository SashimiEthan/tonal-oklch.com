"use client";

export function OklchHueRamp() {
  const steps = Array.from({ length: 13 }, (_, i) => i * 30); // 0 to 360 in increments of 30

  return (
    <figure>
      <div style={{ display: "flex", width: "100%", borderRadius: 2, overflow: "hidden" }}>
        {steps.map((hue) => (
          <div
            key={hue}
            style={{
              flex: 1,
              height: 80,
              background: `oklch(50% 0.15 ${hue})`,
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
              {hue}
            </span>
          </div>
        ))}
      </div>
      <figcaption>OKLCh hue ramp (L: 50, C: 0.15, H: 0–360, increment of 30)</figcaption>
    </figure>
  );
}
