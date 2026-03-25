"use client";

import { Hct, hexFromArgb } from "@material/material-color-utilities";

export function HctBluePalette() {
  const steps = Array.from({ length: 19 }, (_, i) => (i + 1) * 5); // 5 to 95 in increments of 5

  return (
    <figure>
      <div style={{ display: "flex", width: "100%", borderRadius: 2, overflow: "hidden" }}>
        {steps.map((tone) => {
          const hct = Hct.from(260, 50, tone);
          const hex = hexFromArgb(hct.toInt());

          return (
            <div
              key={tone}
              style={{
                flex: 1,
                height: 80,
                background: hex,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: 12,
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: 12,
                  lineHeight: 1,
                  color: tone > 50 ? "black" : "white",
                }}
              >
                {tone}
              </span>
            </div>
          );
        })}
      </div>
      <figcaption>HCT blue palette showing hue shift (H: 260, C: 50, T: 5–95, increment of 5)</figcaption>
    </figure>
  );
}
