"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Root, Element, RootContent } from "hast";
import { OklchGrayscaleRamp } from "./graphs/oklch-grayscale-ramp";
import { OklchHueRamp } from "./graphs/oklch-hue-ramp";
import { HctBluePalette } from "./graphs/hct-blue-palette";
import { OklchMaxChroma, OklchMaxChromaCompare } from "./graphs/oklch-max-chroma";
import { FigureDownload } from "./figure-download";

const graphComponents: Record<string, React.ComponentType> = {
  "oklch-grayscale-ramp": OklchGrayscaleRamp,
  "oklch-hue-ramp": OklchHueRamp,
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

function subsectionize(children: RootContent[]): RootContent[] {
  const result: RootContent[] = [];
  let currentSub: RootContent[] = [];
  let preH3Content: RootContent[] = [];

  for (const node of children) {
    const isH3 =
      node.type === "element" && (node as Element).tagName === "h3";

    if (isH3) {
      if (preH3Content.length > 0) {
        result.push(...groupContent(preH3Content));
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
    result.push(...groupContent(preH3Content));
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
      result.push({
        type: "element",
        tagName: "div",
        properties: { className: ["content"] },
        children: contentGroup,
      });
    } else if (contentGroup.length === 1) {
      result.push(contentGroup[0]);
    }
    contentGroup = [];
  };

  for (const node of filtered) {
    if (isTagName(node, "p", "figure", "ol", "ul") || isGraph(node)) {
      if (contentGroup.length === 0 && (isTagName(node, "figure") || isGraph(node))) {
        result.push(node);
      } else {
        contentGroup.push(node);
        if (isTagName(node, "figure") || isGraph(node)) {
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
