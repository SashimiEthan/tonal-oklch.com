"use client";

import { useMemo } from "react";
import { chromaVsHue } from "@/lib/gamut";

const PADDING = { top: 5, right: 0, bottom: 4, left: 29 };
const MAX_CHROMA = 0.4;

function MaxChromaSvg({ lightness, chromaLine }: { lightness: number; chromaLine?: number }) {
  const data = useMemo(() => chromaVsHue(lightness), [lightness]);

  const chartW = 800;
  const chartH = 300;
  const plotW = chartW - PADDING.left - PADDING.right;
  const plotH = chartH - PADDING.top - PADDING.bottom;

  function x(h: number) {
    return PADDING.left + (h / 360) * plotW;
  }
  function y(c: number) {
    return PADDING.top + plotH - (c / MAX_CHROMA) * plotH;
  }

  const chromaLabels = [0, 0.1, 0.2, 0.3, 0.4];

  return (
    <div>
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          {data.slice(0, -1).map((p, i) => (
            <linearGradient key={`strip-${i}`} id={`strip-${lightness}-${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={`oklch(${lightness} ${p.c} ${p.h})`} />
              <stop offset="100%" stopColor={`oklch(${lightness} 0 ${p.h})`} />
            </linearGradient>
          ))}
        </defs>
        <g>
          {data.slice(0, -1).map((p, i) => {
            const next = data[i + 1];
            const x1Val = x(p.h);
            const x2Val = x(next.h);
            const topY = y(p.c);
            const botY = y(0);
            return (
              <rect
                key={i}
                x={x1Val}
                y={topY}
                width={x2Val - x1Val + 0.5}
                height={botY - topY}
                fill={`url(#strip-${lightness}-${i})`}
              />
            );
          })}
        </g>

        {/* Y-axis line */}
        <line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + plotH}
          stroke="#999"
          strokeWidth={1}
        />

        {/* Y-axis labels (chroma) */}
        {chromaLabels.map((c) => (
          <text
            key={`label-c-${c}`}
            x={PADDING.left - 8}
            y={y(c) + 4}
            textAnchor="end"
            style={{
              fontSize: 12,
              fontFamily: "var(--font-geist-mono)",
              fill: "var(--foreground-primary)",
            }}
          >
            {c.toFixed(1)}
          </text>
        ))}

        {/* Optional horizontal chroma reference line */}
        {chromaLine != null && (
          <line
            x1={PADDING.left}
            y1={y(chromaLine)}
            x2={chartW - PADDING.right}
            y2={y(chromaLine)}
            stroke="black"
            strokeOpacity={0.4}
            strokeWidth={1}
          />
        )}
      </svg>
      <figcaption>
        L&nbsp;=&nbsp;{(lightness * 100).toFixed(2)}
      </figcaption>
    </div>
  );
}

export function OklchMaxChroma({ lightness = 0.5878 }: { lightness?: number }) {
  return (
    <figure>
      <MaxChromaSvg lightness={lightness} />
    </figure>
  );
}

export function OklchMaxChromaCompare() {
  const chromaLine = 0.15;
  const plotH = 300 - PADDING.top - PADDING.bottom;
  const yPos = PADDING.top + plotH - (chromaLine / MAX_CHROMA) * plotH;
  // SVG aspect ratio is 800:300, so yPercent maps to the SVG portion only
  const yPercent = (yPos / 300) * 100;

  return (
    <figure>
      {/* SVG row with spanning line */}
      <div style={{ display: "flex", gap: 32, position: "relative" }}>
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <svg viewBox="0 0 800 300" style={{ width: "100%", height: "auto", display: "block" }}>
            <MaxChromaSvgInner lightness={0.5878} />
          </svg>
        </div>
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <svg viewBox="0 0 800 300" style={{ width: "100%", height: "auto", display: "block" }}>
            <MaxChromaSvgInner lightness={0.53} />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            top: `${yPercent}%`,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "black",
            opacity: 0.25,
            pointerEvents: "none",
          }}
        />
      </div>
      {/* Captions below, outside the line container */}
      <div style={{ display: "flex", gap: 16 }}>
        <figcaption style={{ flex: "1 1 0" }}>L&nbsp;=&nbsp;58.78</figcaption>
        <figcaption style={{ flex: "1 1 0" }}>L&nbsp;=&nbsp;53</figcaption>
      </div>
    </figure>
  );
}

/** SVG-only content (no wrapper div/figcaption) for use inside a shared SVG element */
function MaxChromaSvgInner({ lightness }: { lightness: number }) {
  const data = useMemo(() => chromaVsHue(lightness), [lightness]);

  const chartW = 800;
  const plotW = chartW - PADDING.left - PADDING.right;
  const plotH = 300 - PADDING.top - PADDING.bottom;

  function x(h: number) {
    return PADDING.left + (h / 360) * plotW;
  }
  function y(c: number) {
    return PADDING.top + plotH - (c / MAX_CHROMA) * plotH;
  }

  const chromaLabels = [0, 0.1, 0.2, 0.3, 0.4];

  return (
    <>
      <defs>
        {data.slice(0, -1).map((p, i) => (
          <linearGradient key={`strip-${i}`} id={`strip-${lightness}-${i}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={`oklch(${lightness} ${p.c} ${p.h})`} />
            <stop offset="100%" stopColor={`oklch(${lightness} 0 ${p.h})`} />
          </linearGradient>
        ))}
      </defs>
      <g>
        {data.slice(0, -1).map((p, i) => {
          const next = data[i + 1];
          const x1Val = x(p.h);
          const x2Val = x(next.h);
          const topY = y(p.c);
          const botY = y(0);
          return (
            <rect
              key={i}
              x={x1Val}
              y={topY}
              width={x2Val - x1Val + 0.5}
              height={botY - topY}
              fill={`url(#strip-${lightness}-${i})`}
            />
          );
        })}
      </g>
      <line
        x1={PADDING.left}
        y1={PADDING.top}
        x2={PADDING.left}
        y2={PADDING.top + plotH}
        stroke="#BFBFBF"
        strokeWidth={1}
      />
      {chromaLabels.map((c) => (
        <text
          key={`label-c-${c}`}
          x={PADDING.left - 8}
          y={y(c) + 4}
          textAnchor="end"
          style={{
            fontSize: 12,
            fontFamily: "var(--font-geist-mono)",
            fill: "var(--foreground-primary)",
          }}
        >
          {c.toFixed(1)}
        </text>
      ))}
    </>
  );
}
