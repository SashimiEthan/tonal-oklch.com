import { NeutralPalette } from "@/components/graphs/neutral-palette";
import { TintedNeutralPalette } from "@/components/graphs/tinted-neutral-palette";
import { VibrantPalette } from "@/components/graphs/vibrant-palette";
import { FigureDownload } from "@/components/figure-download";
import { SwatchTooltipWarmup } from "@/components/swatch-tooltip-warmup";

export default function Home() {
  return (
    <div className="home">
      <SwatchTooltipWarmup />
      <h1>Neutral (C=0)</h1>
      <FigureDownload captureWholeFigure filename="neutral-palette.png">
        <NeutralPalette />
      </FigureDownload>

      <h1>Tinted neutrals (C=0.01)</h1>
      <FigureDownload captureWholeFigure filename="tinted-neutral-palette.png">
        <TintedNeutralPalette />
      </FigureDownload>

      <FigureDownload captureWholeFigure filename="vibrant-palette.png">
        <VibrantPalette />
      </FigureDownload>
    </div>
  );
}
