"use client";

import { useCallback, useRef } from "react";
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
  const targetRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!targetRef.current) return;
    const dataUrl = await toPng(targetRef.current, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }, [filename]);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div ref={targetRef}>
        {children}
      </div>
      <div
        className="group"
        style={{
          position: "absolute",
          right: -44,
          top: 0,
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
    </div>
  );
}
