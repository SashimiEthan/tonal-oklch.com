"use client";

import { useState } from "react";
import { VibrantPalette, hues } from "@/components/graphs/vibrant-palette";
import { FigureDownload } from "@/components/figure-download";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function VibrantSection() {
  const [refHue, setRefHue] = useState<string>("240");

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Vibrant</h1>
        <div className="vibrant-settings" style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "var(--foreground-primary)" }}>
            Set each stop's chroma using hue
          </span>
          <Select value={refHue} onValueChange={(val) => setRefHue(val ?? "240")}>
            <SelectTrigger size="sm" style={{ width: 80, height: 36 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hues.slice(0, -1).map((h) => (
                <SelectItem key={h} value={String(h)}>
                  {h}°
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span style={{ fontSize: 14, color: "var(--foreground-primary)" }}>
            's
          </span>
          <span style={{ fontSize: 14, color: "var(--foreground-primary)" }}>
            max chroma
          </span>
        </div>
      </div>
      <FigureDownload captureWholeFigure filename="vibrant-palette.png">
        <VibrantPalette refHue={refHue} />
      </FigureDownload>
    </>
  );
}
