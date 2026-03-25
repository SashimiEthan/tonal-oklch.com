# Tonal OKLCh

## Preface

I’m no color scientist - if color science is an iceberg, I probably only know the tip of it. But I’m always eager to learn more. That said, if anything below is inaccurate, please let me know and I’d love to learn from it.

## What is Tonal OKLCh?

Tonal OKLCh is HCT but with OKLCh. Material's HCT combines CAM 16’s hue and chroma with CIE L*, which has better lightness uniformity than OKLCh. But CAM 16 still has the blue-purple hue shift issue similar to Lab, which OKLCh set out to solve. So I thought, what about piecing together the hue & chroma from OKLCh and CIE L* to achieve a better result? From there, tonal OKLCh was born.

## Why not just OKLCh?

When I was designing the color system for our team, I noticed OKLCh’s non-uniform lightness issue, which had two main consequences:

- Compressed dark end
- Varying contrast ratio (more prominent for middle of the ramp colors)

### Compressed dark end

As you can see from the graph below, in increments of 2, the dark end of the ramp is barely distinguishable till the lightness value is above 18.

<oklch-grayscale-ramp />

The practical implication is, in light mode, if I set the page background color to L=100 and the layer color to L=98, I couldn’t maintain the same distance in dark mode by choosing L=10 and L=12, because those two colors would be too close together.

(I had compensated for this problem with a conversion table between OKLCh L and LCh L, where for example when I say grey 10, it’s actually LCh 10, and it converts to 22 in OKLCh. <- And this is the actual L value I’m using to generate the color. I always thought it was less elegant and it didn’t resolve the issue below, so I wanted to find a better solution.)

### Inconsistent contrast ratio

For the same reason, setting L to the same value doesn't always give you the same contrast ratio (under both the current and future standards), which diminishes the purpose of using a perceptually uniform color space.

<oklch-hue-ramp />

Why don’t you just decrease the L until all colors meet contrast? Good question. As lightness decreases, max chroma also decreases—and chroma controls how vibrant a color looks. At L=53, all colors finally pass contrast, but as you can see from the graph below, at C=0.15, there are less colors that can achieve this vibrancy.

<oklch-max-chroma-compare />

In practice, the colors in this stop appear darker and less vibrant.

<oklch-hue-ramp />


## Why not just HCT?

Given the issues above, I turned to ChatGPT and found the HCT color space created by Google’s Material Design team. It resolved the non-uniformity issue without a problem. But in that process, I observed the hue shift issue similar to that of Lab/LCh. Notice the hue of the palette below shifts towards purple at the end.

<hct-blue-palette />

(I was able to build in a hue shift for my blue. It was easy to correct but then I also noticed HCT yields a less vibrant palette compared to OKLCh, possibly due to CAM 16’s inferior hue & chroma uniformity to OKLCh.)

## My process of creating Tonal-OKLCh

With the limitations above, I got to work. Below is my process of creating the library. Needless to say, this library is all vibe coded.

1. I asked Claude to do a deep research on how exactly HCT was created and asked it to come up with an implementation plan to apply the same approach on OKLCh
2. Prior to that, through Claude, I also found there was a library called Chromator that used this exact same approach, but in my testing, it didn’t generate a consistent contrast palette. So in the same session, I asked Claude to also search why Chromator didn’t work as well.
3. I fed the planning doc to Claude in GitHub CLI and asked it to implement it. The results in the first iteration were already pretty good (it went from a 0.67 contrast ratio spread (4.38–5.05) down to a 0.04 spread (4.46–4.50), which can also be observed in HCT). Regardless, it was still not perfect, so I asked Claude if it could be improved.
4. Claude successfully diagnosed the issue. It explained that “the solver hits the target luminance to floating-point precision. The ~0.04 contrast spread is purely from 8-bit hex rounding, and HCT has the same issue for the same reason. You can't eliminate it entirely because hex colors are discrete — but you can get it down to ~0.01 with a post-quantization nudge (after converting to hex, measure the actual Y of the quantized color. If it drifted from the target, nudge the channel with the most luminance weight (green usually) by ±1 to get closer.) It did just that, which gave the final result you see below. As you can see the spread is now under 0.01."
5. Through testing, I noticed that the nudge is causing neutral colors to no longer be true neutrals (#F2F4F2 instead of #F2F2F2), so I asked Claude to not apply nudge to neutral colors (when c=0).

## Method

Below are the steps the library takes (produced by Claude)

1. CIE L* ("tone") replaces OKLCh's L as the lightness axis. Because CIE L* maps directly to WCAG relative luminance, same tone = same contrast ratio, regardless of hue or chroma.
2. Given a target tone, hue, and chroma, the library binary-searches OKLCh's L channel to find the exact L that produces the target CIE Y (luminance).
3. When chroma exceeds the sRGB gamut, a second binary search reduces it — re-solving L for the target Y at every step so luminance never drifts during gamut mapping.
4. After conversion, 8-bit hex rounding can shift luminance slightly per hue. For chromatic colors, a post-quantization nudge tests ±1 per RGB channel (27 combinations) and picks the closest to the target Y, tightening contrast spread to ~0.02. Achromatic colors skip the nudge to keep R=G=B exact.

## Alternatives that I’ve tested

In a prior deep research report, Claude suggested that I try the following:

1. OKLCh with Ottosson's toe function constants implemented as color.js’ OKLrCh library
2. OKLCh with facelessuser's constants
3. Chromator, which used this exact same approach

These 3 approaches still yield different contrasts. From there, I had the peace of mind to finally implement my own.

## Postface

Tonal OKLCh is a bit long, especially as a function name, and I thought about naming it OKTCh, but ultimately, it didn’t feel like I created a new color space. The real hard work was done by the people who created OKLCh and HCT, so I wanted to pay tribute to them by preserving the two color spaces’ names that make up Tonal OKLCh.

If you have any feedback or requests, please don’t hesitate to let me know in this project’s GitHub repo.
