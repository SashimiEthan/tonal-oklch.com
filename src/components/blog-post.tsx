"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Root, Element, RootContent } from "hast";
import { OklchGrayscaleRamp } from "./graphs/oklch-grayscale-ramp";
import { OklchHueRamp, OklchHueRampL53 } from "./graphs/oklch-hue-ramp";
import { AlternativeHueRamps } from "./graphs/alternative-hue-ramps";
import { HctBluePalette } from "./graphs/hct-blue-palette";
import { OklchMaxChroma, OklchMaxChromaCompare } from "./graphs/oklch-max-chroma";
import { FigureDownload } from "./figure-download";

const graphComponents: Record<string, React.ComponentType> = {
  "oklch-grayscale-ramp": OklchGrayscaleRamp,
  "oklch-hue-ramp": OklchHueRamp,
  "oklch-hue-ramp-l53": OklchHueRampL53,
  "alternative-hue-ramps": AlternativeHueRamps,
  "hct-blue-palette": HctBluePalette,
  "oklch-max-chroma": OklchMaxChroma,
  "oklch-max-chroma-compare": OklchMaxChromaCompare,
};

// Converts raw HTML nodes like <oklch-grayscale-ramp /> to proper HAST elements
function rehypeGraphs() {
  return (tree: Root) => {
    const pattern = /^<([a-z][a-z0-9-]*)\s*\/?>(?:<\/\1>)?$/;
    tree.children = tree.children.flatMap((node): RootContent[] => {
      if (node.type === "raw") {
        const match = (node as unknown as { value: string }).value.trim().match(pattern);
        if (match && match[1] in graphComponents) {
          return [{
            type: "element",
            tagName: match[1],
            properties: {},
            children: [],
          }];
        }
      }
      if (node.type === "element" && (node as Element).tagName === "p") {
        const el = node as Element;
        const rawChild = el.children.find(c => c.type === "raw") as unknown as { value: string } | undefined;
        if (el.children.length === 1 && rawChild) {
          const match = rawChild.value.trim().match(pattern);
          if (match && match[1] in graphComponents) {
            return [{
              type: "element",
              tagName: match[1],
              properties: {},
              children: [],
            }];
          }
        }
      }
      return [node];
    });
  };
}

export function BlogPost({ content }: { content: string }) {
  return (
    <article>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        rehypePlugins={[rehypeGraphs]}
        components={Object.fromEntries(
          Object.entries(graphComponents).map(([tag, Component]) => [
            tag,
            () => (
              <FigureDownload filename={`${tag}.png`}>
                <Component />
              </FigureDownload>
            ),
          ])
        )}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
