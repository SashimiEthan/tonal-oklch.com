"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Module-level ref so selecting one swatch can deselect the previous
let deselectPrevious: (() => void) | null = null;

interface SwatchProps {
  hex: string;
  tone: number;
  hue: number;
  chroma: number;
  oklch: { l: number; c: number; h: number };
  rgb: { r: number; g: number; b: number };
  height?: number;
  minWidth?: number;
  boxShadow?: string;
  borderRadius?: string;
  tooltipBelow?: boolean;
  children?: React.ReactNode;
}

function TooltipContent({ hex, tone, hue, chroma, oklch, rgb }: {
  hex: string; tone: number; hue: number; chroma: number;
  oklch: { l: number; c: number; h: number };
  rgb: { r: number; g: number; b: number };
}) {
  return (
    <>
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
    </>
  );
}

export function Swatch({
  hex,
  tone,
  hue,
  chroma,
  oklch,
  rgb,
  height = 60,
  minWidth,
  boxShadow,
  borderRadius,
  tooltipBelow,
  children,
}: SwatchProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(false);

  const deselect = useCallback(() => {
    ref.current?.removeAttribute("data-selected");
    setSelected(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = ref.current;
    if (!el) return;

    // Deselect the previously selected swatch (if any)
    if (deselectPrevious && deselectPrevious !== deselect) {
      deselectPrevious();
    }

    el.setAttribute("data-selected", "");
    el.setAttribute("data-copied", "");
    setSelected(true);
    deselectPrevious = deselect;
    navigator.clipboard?.writeText(hex).catch(() => {});
    setTimeout(() => el.removeAttribute("data-copied"), 1200);
  }, [hex, deselect]);

  // Dismiss on click/tap outside
  useEffect(() => {
    if (!selected) return;
    function dismiss(e: Event) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        deselect();
        if (deselectPrevious === deselect) deselectPrevious = null;
      }
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [selected, deselect]);

  const tooltipData = { hex, tone, hue, chroma, oklch, rgb };

  return (
    <div
      ref={ref}
      className="swatch"
      onClick={handleClick}
      {...(tooltipBelow ? { "data-tooltip-below": "" } : {})}
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
        ...(minWidth != null ? { minWidth } : {}),
        ...(boxShadow ? { boxShadow } : {}),
        ...(borderRadius ? { borderRadius } : {}),
      }}
    >
      {/* Inline tooltip — shown on desktop hover via SwatchTooltipWarmup */}
      <div className="swatch-tooltip">
        <TooltipContent {...tooltipData} />
      </div>
      {children}
      {/* Portal tooltip — shown on click/tap, escapes overflow:clip containers */}
      {selected && createPortal(
        <PortalTooltip swatchRef={ref} tooltipBelow={tooltipBelow} {...tooltipData} />,
        document.body,
      )}
    </div>
  );
}

function PortalTooltip({
  swatchRef,
  tooltipBelow,
  ...tooltipData
}: {
  swatchRef: React.RefObject<HTMLDivElement | null>;
  tooltipBelow?: boolean;
  hex: string; tone: number; hue: number; chroma: number;
  oklch: { l: number; c: number; h: number };
  rgb: { r: number; g: number; b: number };
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    function update() {
      const rect = swatchRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({
        top: tooltipBelow ? rect.bottom + 8 : rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [swatchRef, tooltipBelow]);

  if (!pos) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        transform: tooltipBelow ? "translateX(-50%)" : "translate(-50%, -100%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div className="swatch-tooltip" style={{ opacity: 1, visibility: "visible", position: "relative" }}>
        <TooltipContent {...tooltipData} />
      </div>
    </div>
  );
}
