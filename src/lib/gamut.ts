import { useMode, modeOklch, modeRgb, converter } from "culori/fn";

useMode(modeOklch);
useMode(modeRgb);

const toRgb = converter("rgb");

function inSrgb(r: number, g: number, b: number): boolean {
  return r >= -0.0001 && r <= 1.0001
      && g >= -0.0001 && g <= 1.0001
      && b >= -0.0001 && b <= 1.0001;
}

/** Binary search for the highest in-gamut sRGB chroma at a given OKLCh lightness and hue. */
export function maxChroma(l: number, h: number): number {
  if (l <= 0 || l >= 1) return 0;
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 13; i++) {
    const mid = (lo + hi) / 2;
    const rgb = toRgb({ mode: "oklch", l, c: mid, h });
    if (rgb && inSrgb(rgb.r, rgb.g, rgb.b)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/** Max chroma boundary across all hues at a fixed lightness. */
export function chromaVsHue(l: number, steps = 360): { h: number; c: number }[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const h = (i / steps) * 360;
    return { h, c: maxChroma(l, h) };
  });
}
