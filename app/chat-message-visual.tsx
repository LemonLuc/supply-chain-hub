"use client";

import type { UIMessage } from "ai";
import { Download } from "lucide-react";

import {
  parseDemoSlideVisual,
  parseOperationalBarChart,
  type DemoSlideVisual,
  type OperationalBarChart,
} from "@/lib/chat-visuals";
import {
  parseSupplierPortfolioVisualization,
  type SupplierPortfolioVisualization,
} from "@/lib/supplier-portfolio";

import { OperationalBarChartView } from "./operational-bar-chart";
import { SupplierPortfolioVisualizationView } from "./supplier-portfolio-visualization";

type ImageVisual = {
  kind: "image";
  result: string;
  mediaType: "image/webp" | "image/svg+xml";
  alt: string;
  filename: string;
  demo: boolean;
};

export type MessageVisual =
  | { kind: "portfolio"; visualization: SupplierPortfolioVisualization }
  | { kind: "operational"; chart: OperationalBarChart }
  | ImageVisual
  | { kind: "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isBase64(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 32 &&
    value.length % 4 === 0 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(value)
  );
}

function parseImageVisual(value: unknown): ImageVisual | undefined {
  const demo = parseDemoSlideVisual(value);
  if (demo) {
    return {
      kind: "image",
      result: demo.result,
      mediaType: demo.mediaType,
      alt: demo.alt,
      filename: demo.filename,
      demo: true,
    };
  }

  if (!isRecord(value) || !isBase64(value.result)) return undefined;
  return {
    kind: "image",
    result: value.result,
    mediaType: "image/webp",
    alt: "Generated supply-chain slide visual",
    filename: "supply-chain-slide-visual.webp",
    demo: false,
  };
}

function getToolName(part: Record<string, unknown>): string | undefined {
  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
    return part.type.slice("tool-".length);
  }
  return part.type === "dynamic-tool" && typeof part.toolName === "string"
    ? part.toolName
    : undefined;
}

export function getMessageVisual(message: UIMessage): MessageVisual | undefined {
  for (const rawPart of [...message.parts].reverse()) {
    if (!isRecord(rawPart)) continue;
    const part = rawPart as Record<string, unknown>;
    const toolName = getToolName(part);
    if (!toolName || ![
      "renderSupplierPortfolio",
      "renderOperationalChart",
      "generateSlideVisual",
    ].includes(toolName)) {
      continue;
    }

    if (part.state === "output-error") return { kind: "error" };
    if (part.state !== "output-available") continue;

    if (toolName === "renderSupplierPortfolio") {
      const visualization = parseSupplierPortfolioVisualization(part.output);
      if (visualization) return { kind: "portfolio", visualization };
    }

    if (toolName === "renderOperationalChart") {
      const chart = parseOperationalBarChart(part.output);
      if (chart) return { kind: "operational", chart };
    }

    if (toolName === "generateSlideVisual") {
      const image = parseImageVisual(part.output);
      if (image) return image;
    }
  }

  return undefined;
}

function ImageMessageVisual({ visual }: { visual: ImageVisual }) {
  const source = `data:${visual.mediaType};base64,${visual.result}`;
  return (
    <figure className="chat-image-visual">
      <div className="chat-visual-heading">
        <div>
          <p className="eyebrow">Presentation visual</p>
          <h3>Slide-ready illustration</h3>
        </div>
        {visual.demo && <span className="chat-visual-demo-label">Demo preview</span>}
      </div>
      <img src={source} alt={visual.alt} />
      <figcaption>
        <span>{visual.demo ? "Deterministic preview" : "Generated for this response"}</span>
        <a href={source} download={visual.filename} aria-label="Download image">
          <Download aria-hidden="true" />
          Download
        </a>
      </figcaption>
    </figure>
  );
}

export function ChatMessageVisual({ visual }: { visual: MessageVisual | undefined }) {
  if (!visual) return null;
  if (visual.kind === "error") {
    return <p className="chat-visual-error" role="status">Visual unavailable. Try asking again.</p>;
  }
  if (visual.kind === "portfolio") {
    return (
      <div className="chat-message-visual">
        <SupplierPortfolioVisualizationView visualization={visual.visualization} />
      </div>
    );
  }
  if (visual.kind === "operational") {
    return (
      <div className="chat-message-visual">
        <OperationalBarChartView chart={visual.chart} />
      </div>
    );
  }
  return (
    <div className="chat-message-visual">
      <ImageMessageVisual visual={visual} />
    </div>
  );
}
