# Max Chroma Graph — Implementation Plan

## Goal

Build static max chroma boundary graphs for OKLCH on a Next.js website using **culori**. The graphs should produce the **exact same max chroma values as oklch.com** for any given hue and lightness.

---

## How oklch.com determines max chroma

The oklch-picker repo ([evilmartians/oklch-picker](https://github.com/evilmartians/oklch-picker)) does **not** compute a max chroma curve. It paints every pixel on an HTML5 Canvas, converts each pixel's OKLCH coordinates to sRGB via culori, and checks whether all RGB channels fall within bounds. Out-of-gamut pixels are rendered transparent — the visible boundary is just where colored pixels stop.

The per-pixel gamut test lives in `lib/colors.ts` in a function called `generateGetPixel()`. It does:

1. Convert OKLCH → sRGB via culori's `rgb()` converter
2. Check if `r`, `g`, `b` are all within `[-0.0001, 1.0001]` (a tolerance for floating-point precision — see [culori issue #249](https://github.com/Evercoder/culori/issues/249))
3. Return the gamut membership (sRGB, P3, Rec2020, or out-of-gamut)

**To match oklch.com's max chroma**, we need to use the same logic: culori's OKLCH → sRGB conversion + the same tolerance-based range check. No analytical shortcuts.

---

## Algorithm: Binary search with culori

For a given `(L, H)` pair, find the highest chroma `C` where `oklch(L, C, H)` converts to a valid sRGB color.

```
maxChroma(L, H):
  if L <= 0 or L >= 1: return 0
  lo = 0, hi = 0.4
  repeat ~13 times (until hi - lo < 0.00005):
    mid = (lo + hi) / 2
    rgb = culori.convert({ mode: 'oklch', l: L, c: mid, h: H }, 'rgb')
    if rgb.r ∈ [-0.0001, 1.0001] AND rgb.g ∈ [-0.0001, 1.0001] AND rgb.b ∈ [-0.0001, 1.0001]:
      lo = mid   // still in gamut, push chroma higher
    else:
      hi = mid   // out of gamut, pull chroma lower
  return lo
```

This is the same math oklch.com runs per pixel — just inverted into a search. The `±0.0001` tolerance matches oklch.com's `inRGB()` function exactly.

### Why not culori's built-in `clampChroma()`?

`clampChroma()` does the same binary search but uses a strict `[0, 1]` range check (no tolerance). This means it may return a slightly different max chroma than what oklch.com shows. Using a custom binary search with the `[-0.0001, 1.0001]` tolerance guarantees identical results.

---

## Graph types to build

oklch.com renders three chart types. Pick whichever you need:

| Chart | X-axis | Y-axis | Fixed value | Description |
|-------|--------|--------|-------------|-------------|
| **H chart** | Lightness (0–1) | Chroma (0–0.4) | Hue | Shows gamut shape for one hue. The "mountain" shape. |
| **L chart** | Hue (0–360) | Chroma (0–0.4) | Lightness | Shows how max chroma varies across hues at one lightness. |
| **C chart** | Hue (0–360) | Lightness (0–1) | Chroma | Shows which L/H combos are in gamut at one chroma level. |

For a static "max chroma" boundary graph, the **H chart** (fixed hue, L vs C) is the most useful — it directly answers "at this hue, what's the max chroma at each lightness?"

---

## Dependencies

```bash
npm install culori
npm install -D @types/culori
```

That's it. No other color libraries needed.

---

## File structure

```
src/
├── lib/
│   └── gamut.ts              # maxChroma() + data generation functions
├── components/
│   └── MaxChromaGraph.tsx    # Static SVG graph component
└── app/
    └── oklch/
        └── page.tsx          # Page that renders the graph(s)
```

---

## Implementation steps

### Step 1 — `lib/gamut.ts`

Core module. Three exports:

**`maxChroma(L, H)`** — Binary search returning the highest in-gamut chroma for a given lightness and hue. Uses culori's functional API (`culori/fn`) with `converter('rgb')` for the OKLCH → sRGB conversion. Tolerance: `[-0.0001, 1.0001]` per channel to match oklch.com.

**`chromaVsLightness(H, steps?)`** — Generates an array of `{ l, c }` points for the boundary curve at a fixed hue. Default 200 lightness steps (0 to 1). Calls `maxChroma()` at each step. Returns the data needed to draw an H-chart boundary.

**`chromaVsHue(L, steps?)`** — Generates an array of `{ h, c }` points for the boundary curve at a fixed lightness. Default 360 hue steps. Calls `maxChroma()` at each step. Returns the data needed to draw an L-chart boundary.

Implementation notes:
- Import from `culori/fn` (tree-shakeable) and register only `modeOklch` and `modeRgb` via `useMode()`
- `maxChroma()` should return `0` for `L <= 0` or `L >= 1` (black and white have no chroma)
- The binary search epsilon should be `0.00005` (~13 iterations), matching culori's `clampChroma` precision for OKLCH's `[0, 0.4]` range
- These functions run at build time or on first render — no need for memoization beyond React's `useMemo`

### Step 2 — `components/MaxChromaGraph.tsx`

A React component that renders the max chroma boundary as a **static SVG**.

Props:
- `hue: number` — fixed hue for an H-chart (L vs C)
- `lightness?: number` — fixed lightness for an L-chart (H vs C)
- `width?: number` (default 600)
- `height?: number` (default 400)
- `showP3?: boolean` — optionally render a second boundary for Display P3

Rendering approach:
- Call `chromaVsLightness(hue)` (or `chromaVsHue(lightness)`) in a `useMemo` keyed on the prop
- Map the returned points to SVG coordinates
- Draw a `<path>` element with `d` attribute built from the points
- Y-axis: Chroma 0–0.4 (bottom to top)
- X-axis: Lightness 0–1 (H-chart) or Hue 0–360 (L-chart)
- Add light grid lines, axis labels, and optionally the cusp point marker

Since these are static, the component renders once and doesn't need interactivity, sliders, or debouncing. If `hue` or `lightness` props change (e.g., showing multiple graphs for different hues), each graph computes independently.

SVG is preferred over Canvas here because:
- Static content, no pixel-level rendering needed
- Crisp at any zoom level
- Easier to style with CSS
- Works with Next.js SSR (no `useEffect` needed for a `<canvas>`)

### Step 3 — Assemble the page

In `app/oklch/page.tsx`, render one or more `<MaxChromaGraph>` components with the desired fixed values. For example:

- A single H-chart at hue 150 (green) showing the classic "mountain" shape
- A row of H-charts at hues 0, 60, 120, 180, 240, 300 showing how the gamut shape varies
- An L-chart at lightness 0.7 showing the chroma ceiling across all hues

Since the graphs are static and the data computation is fast (200 points × 13 iterations = ~2,600 culori conversions per graph, sub-millisecond), they can render client-side with no performance concerns.

### Step 4 — Validate against oklch.com

For a handful of `(L, H)` test cases, compare your `maxChroma()` output against oklch.com's visual boundary. To do this:

1. Go to oklch.com and set a specific hue
2. On the L-vs-C chart, hover near the boundary edge and note the chroma value where color disappears
3. Compare against `maxChroma(L, H)` output

Expected precision: values should agree within ±0.001 (the visual resolution of oklch.com's canvas).

Edge cases to verify:
- `L = 0` and `L = 1` → should return `C = 0`
- `H = 0` (red) at `L = 0.5` → high max chroma (~0.25+)
- `H = 250` (blue) at `L = 0.5` → lower max chroma than red
- `L = 0.99` at any hue → very low max chroma (near white)

---

## Optional: Display P3 boundary

To also show the P3 gamut boundary, use culori's `inGamut('p3')` or convert to P3 and range-check. The binary search is identical — just swap the gamut check:

```
maxChromaP3(L, H):
  same binary search, but convert to 'p3' instead of 'rgb'
  and check p3.r, p3.g, p3.b ∈ [0, 1]
```

oklch.com's `generateGetPixel()` does exactly this when `showP3` is enabled, using culori's `inGamut('p3')`. Render the P3 boundary as a second `<path>` in a different color (e.g., dashed line) on the same SVG.

---

## Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| Library | culori only | Matches oklch.com's math exactly |
| Algorithm | Binary search with ±0.0001 tolerance | Same gamut check as oklch.com's `inRGB()` |
| Rendering | Static SVG `<path>` | No interactivity needed, crisp, SSR-friendly |
| Performance | Not a concern | ~2,600 conversions per graph, sub-ms |
| Analytical cusp method | Dropped | Triangle approximation doesn't match oklch.com's pixel-exact values |
| Web Workers | Dropped | Only needed for real-time pixel painting |
| @texel/color | Dropped | Speed advantage irrelevant for static graphs |