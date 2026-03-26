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

// Finds raw HTML nodes like <oklch-grayscale-ramp /> and converts them
// to proper HAST elements before sectionize runs
function rehypeGraphs() {
  return (tree: Root) => {
    const pattern = /^<([a-z][a-z0-9-]*)\s*\/?>(?:<\/\1>)?$/;
    tree.children = tree.children.flatMap((node): RootContent[] => {
      // Check raw nodes (from remarkRehype's allowDangerousHtml)
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
      // Also check paragraph nodes that contain only a raw HTML graph tag
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

function rehypeSectionize() {
  return (tree: Root) => {
    const newChildren: RootContent[] = [];
    let currentSection: RootContent[] = [];

    for (const node of tree.children) {
      const isH2 =
        node.type === "element" && (node as Element).tagName === "h2";

      if (isH2) {
        if (currentSection.length > 0) {
          newChildren.push({
            type: "element",
            tagName: "section",
            properties: {},
            children: subsectionize(currentSection),
          });
        }
        currentSection = [node];
      } else if (currentSection.length > 0) {
        currentSection.push(node);
      } else {
        newChildren.push(node);
      }
    }

    if (currentSection.length > 0) {
      newChildren.push({
        type: "element",
        tagName: "section",
        properties: {},
        children: subsectionize(currentSection),
      });
    }

    tree.children = newChildren;
  };
}

// Wraps h2 + all content before first h3 in .content
// Splits when a p follows a figure/graph (p after figure stays outside)
function wrapH2Content(children: RootContent[]): RootContent[] {
  const filtered = children.filter((n) => !isWhitespace(n));
  const wrapped: RootContent[] = [];
  const remainder: RootContent[] = [];
  let afterFigure = false;
  let done = false;

  for (const node of filtered) {
    if (done) {
      remainder.push(node);
    } else if (afterFigure && isTagName(node, "p")) {
      done = true;
      remainder.push(node);
    } else {
      afterFigure = isTagName(node, "figure") || isGraph(node);
      wrapped.push(node);
    }
  }

  // Nest p + list pairs inside .content-list
  const nested: RootContent[] = [];
  for (let i = 0; i < wrapped.length; i++) {
    if (isTagName(wrapped[i], "p") && i + 1 < wrapped.length && isTagName(wrapped[i + 1], "ol", "ul")) {
      nested.push({
        type: "element",
        tagName: "div",
        properties: { className: ["content-list"] },
        children: [wrapped[i], wrapped[i + 1]],
      });
      i++;
    } else {
      nested.push(wrapped[i]);
    }
  }

  const result: RootContent[] = [{
    type: "element",
    tagName: "div",
    properties: { className: ["content"] },
    children: nested,
  }];

  for (const n of remainder) {
    result.push(n);
  }

  return result;
}

function subsectionize(children: RootContent[]): RootContent[] {
  const result: RootContent[] = [];
  let currentSub: RootContent[] = [];
  let preH3Content: RootContent[] = [];

  for (const node of children) {
    const isH3 =
      node.type === "element" && (node as Element).tagName === "h3";

    if (isH3) {
      if (preH3Content.length > 0) {
        result.push(...wrapH2Content(preH3Content));
        preH3Content = [];
      }
      if (currentSub.length > 0) {
        result.push({
          type: "element",
          tagName: "div",
          properties: { className: ["subsection"] },
          children: groupContent(currentSub),
        });
      }
      currentSub = [node];
    } else if (currentSub.length > 0) {
      currentSub.push(node);
    } else {
      preH3Content.push(node);
    }
  }

  if (preH3Content.length > 0) {
    result.push(...wrapH2Content(preH3Content));
  }

  if (currentSub.length > 0) {
    result.push({
      type: "element",
      tagName: "div",
      properties: { className: ["subsection"] },
      children: groupContent(currentSub),
    });
  }

  return result;
}

function isWhitespace(node: RootContent): boolean {
  return node.type === "text" && !(node as unknown as { value: string }).value.trim();
}

function isTagName(node: RootContent, ...tags: string[]): boolean {
  return node.type === "element" && tags.includes((node as Element).tagName);
}

function isGraph(node: RootContent): boolean {
  return (
    node.type === "element" &&
    (node as Element).tagName in graphComponents
  );
}

function groupContent(children: RootContent[]): RootContent[] {
  // Filter out whitespace-only text nodes that break grouping
  const filtered = children.filter((n) => !isWhitespace(n));
  const result: RootContent[] = [];
  let contentGroup: RootContent[] = [];

  const flushGroup = () => {
    if (contentGroup.length > 1) {
      const hasParagraph = contentGroup.some((n) => isTagName(n, "p"));
      const hasHeading = contentGroup.some((n) => isTagName(n, "h3"));
      const endsFigure = isTagName(contentGroup[contentGroup.length - 1], "figure") || isGraph(contentGroup[contentGroup.length - 1]);
      const endsList = isTagName(contentGroup[contentGroup.length - 1], "ol", "ul");
      if (endsFigure && (hasParagraph || hasHeading)) {
        result.push({
          type: "element",
          tagName: "div",
          properties: { className: ["content"] },
          children: contentGroup,
        });
      } else if (endsList && hasParagraph) {
        result.push({
          type: "element",
          tagName: "div",
          properties: { className: ["content-list"] },
          children: contentGroup,
        });
      } else {
        for (const n of contentGroup) {
          result.push(n);
        }
      }
    } else if (contentGroup.length === 1) {
      result.push(contentGroup[0]);
    }
    contentGroup = [];
  };

  for (const node of filtered) {
    if (isTagName(node, "p", "figure", "ol", "ul", "h3") || isGraph(node)) {
      if (contentGroup.length === 0 && (isTagName(node, "figure") || isGraph(node))) {
        result.push(node);
      } else {
        contentGroup.push(node);
        if (isTagName(node, "figure") || isGraph(node) || isTagName(node, "ol", "ul")) {
          flushGroup();
        }
      }
    } else {
      flushGroup();
      result.push(node);
    }
  }

  flushGroup();
  return result;
}

export function BlogPost({ content }: { content: string }) {
  return (
    <article>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        rehypePlugins={[rehypeGraphs, rehypeSectionize]}
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
