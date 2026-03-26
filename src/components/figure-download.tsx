"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FigureDownload({
  children,
  filename = "graph.png",
}: {
  children: React.ReactNode;
  filename?: string;
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
      const swatch = figure?.children[0] as HTMLElement | undefined;
      if (!wrapper || !swatch) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const swatchRect = swatch.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const marginRight = viewportWidth - swatchRect.right;

      setPos({
        left: swatchRect.right + marginRight / 2 - wrapperRect.left,
        top: swatchRect.top - wrapperRect.top + swatchRect.height / 2,
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [showDownload]);

  const handleDownload = useCallback(async () => {
    const figure = wrapperRef.current?.querySelector("figure");
    const swatch = figure?.children[0] as HTMLElement | undefined;
    if (!swatch) return;

    const dataUrl = await toPng(swatch, { pixelRatio: 2 });

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
