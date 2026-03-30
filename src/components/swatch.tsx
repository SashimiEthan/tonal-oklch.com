"use client";

import { useCallback, useEffect, useRef } from "react";

interface SwatchProps {
  hex: string;
  tone: number;
  hue: number;
  chroma: number;
  oklch: { l: number; c: number; h: number };
  rgb: { r: number; g: number; b: number };
  height?: number;
  boxShadow?: string;
  borderRadius?: string;
  children?: React.ReactNode;
}

export function Swatch({
  hex,
  tone,
  hue,
  chroma,
  oklch,
  rgb,
  height = 60,
  boxShadow,
  borderRadius,
  children,
}: SwatchProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = ref.current;
    if (!el) return;

    // Deselect any previously selected swatch
    document.querySelector(".swatch[data-selected]")?.removeAttribute("data-selected");

    // Select this one and copy
    el.setAttribute("data-selected", "");
    el.setAttribute("data-copied", "");
    navigator.clipboard.writeText(hex);
    setTimeout(() => el.removeAttribute("data-copied"), 1200);
  }, [hex]);

  // Click-away listener
  useEffect(() => {
    function handleClickAway(e: MouseEvent) {
      const el = ref.current;
      if (!el || !el.hasAttribute("data-selected")) return;
      if (!el.contains(e.target as Node)) {
        el.removeAttribute("data-selected");
      }
    }
    document.addEventListener("click", handleClickAway);
    return () => document.removeEventListener("click", handleClickAway);
  }, []);

  return (
    <div
      ref={ref}
      className="swatch"
      onClick={handleClick}
      style={{
        flex: 1,
        height,
        background: hex,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        ...(boxShadow ? { boxShadow } : {}),
        ...(borderRadius ? { borderRadius } : {}),
      }}
    >
      <div className="swatch-tooltip">
        <span className="swatch-tooltip-hex">{hex.toUpperCase()}</span>

        <div className="swatch-tooltip-section">
          <span className="swatch-tooltip-label">Input</span>
          <div className="swatch-tooltip-row"><span>Tone</span><span>{tone}</span></div>
          <div className="swatch-tooltip-row"><span>Hue</span><span>{hue}°</span></div>
          <div className="swatch-tooltip-row"><span>Chroma</span><span>{chroma.toFixed(4)}</span></div>
        </div>

        <div className="swatch-tooltip-section">
          <span className="swatch-tooltip-label">Output</span>
          <div className="swatch-tooltip-row"><span>OKLCh L</span><span>{oklch.l.toFixed(4)}</span></div>
          <div className="swatch-tooltip-row"><span>OKLCh C</span><span>{oklch.c.toFixed(4)}</span></div>
          <div className="swatch-tooltip-row"><span>OKLCh H</span><span>{oklch.h.toFixed(2)}</span></div>
          <div className="swatch-tooltip-row"><span>R</span><span>{rgb.r}</span></div>
          <div className="swatch-tooltip-row"><span>G</span><span>{rgb.g}</span></div>
          <div className="swatch-tooltip-row"><span>B</span><span>{rgb.b}</span></div>
        </div>
      </div>
      {children}
    </div>
  );
}
