"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FigureDownload({
  children,
  filename = "graph.png",
  captureWholeFigure = false,
}: {
  children: React.ReactNode;
  filename?: string;
  captureWholeFigure?: boolean;
}) {
  const searchParams = useSearchParams();
  const showDownload = searchParams.get("dl") === "1";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!showDownload) return;

    function measure() {
      const wrapper = wrapperRef.current;
      const figure = wrapper?.querySelector("figure");
      if (!wrapper || !figure) return;

      // Find bounds of the actual swatch area
      const swatches = figure.querySelectorAll(".swatch");
      if (swatches.length === 0) return;

      const firstRect = swatches[0].getBoundingClientRect();
      const lastRect = swatches[swatches.length - 1].getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;

      const paletteTop = firstRect.top;
      const paletteBottom = lastRect.bottom;
      const paletteRight = Math.max(firstRect.right, lastRect.right);
      const marginRight = viewportWidth - paletteRight;

      setPos({
        left: paletteRight + marginRight / 2 - wrapperRect.left,
        top: paletteTop + (paletteBottom - paletteTop) / 2 - wrapperRect.top,
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [showDownload]);

  const handleDownload = useCallback(async () => {
    const figure = wrapperRef.current?.querySelector("figure");
    if (!figure) return;

    const target = captureWholeFigure ? figure : (figure.children[0] as HTMLElement | undefined);
    if (!target) return;

    const dataUrl = await toPng(target as HTMLElement, { pixelRatio: 2 });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }, [filename]);

  return (
    <div
      ref={wrapperRef}
      className="group"
      style={{ position: "relative" }}
    >
      {children}
      {showDownload && pos && (
        <div
          style={{
            position: "absolute",
            left: pos.left,
            top: pos.top,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDownload}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label={`Download ${filename}`}
          >
            <Download />
          </Button>
        </div>
      )}
    </div>
  );
}
