import type { AppContext } from "./context";
import {
  getDemoPortfolioView,
  resolveSupplierPortfolioVisualization,
  type SupplierPortfolioVisualization,
} from "./supplier-portfolio";

export type OperationalBar = {
  id: string;
  label: string;
  value: number;
  displayValue: string;
};

export type OperationalBarChart = {
  kind: "operational-bar";
  id: string;
  title: string;
  description: string;
  unit: string;
  bars: OperationalBar[];
};

export type DemoSlideVisual = {
  kind: "slide-image";
  result: string;
  mediaType: "image/svg+xml";
  alt: string;
  filename: string;
  demo: true;
};

export type DemoChatVisual = {
  toolName: "renderSupplierPortfolio" | "renderOperationalChart" | "generateSlideVisual";
  input: Record<string, unknown>;
  output: SupplierPortfolioVisualization | OperationalBarChart | DemoSlideVisual;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function firstNonNegativeNumber(value: string | undefined): number | undefined {
  const match = value?.replaceAll(",", "").match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function metricValue(context: AppContext, label: string): number | undefined {
  const metric = context.answer.metrics.find(([metricLabel]) => metricLabel === label);
  return firstNonNegativeNumber(metric?.[1]);
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function asksForVisualization(question: string): boolean {
  return /\b(visuali[sz]e|chart|graph|plot|diagram|illustrat(?:e|ion)|image|slide visual)\b/i.test(question);
}

export function parseOperationalBarChart(value: unknown): OperationalBarChart | undefined {
  if (!isRecord(value) || value.kind !== "operational-bar") return undefined;
  if (
    !nonEmptyString(value.id) ||
    !nonEmptyString(value.title) ||
    !nonEmptyString(value.description) ||
    !nonEmptyString(value.unit) ||
    !Array.isArray(value.bars) ||
    value.bars.length < 2 ||
    value.bars.length > 12
  ) {
    return undefined;
  }

  const bars: OperationalBar[] = [];
  for (const bar of value.bars) {
    if (
      !isRecord(bar) ||
      !nonEmptyString(bar.id) ||
      !nonEmptyString(bar.label) ||
      !nonEmptyString(bar.displayValue) ||
      typeof bar.value !== "number" ||
      !Number.isFinite(bar.value) ||
      bar.value < 0
    ) {
      return undefined;
    }
    bars.push({
      id: bar.id,
      label: bar.label,
      value: bar.value,
      displayValue: bar.displayValue,
    });
  }

  if (new Set(bars.map((bar) => bar.id)).size !== bars.length) return undefined;

  return {
    kind: "operational-bar",
    id: value.id,
    title: value.title,
    description: value.description,
    unit: value.unit,
    bars,
  };
}

export function resolveOperationalChart(context: AppContext): OperationalBarChart | undefined {
  if (context.workflow.key === "delay") {
    const affected = metricValue(context, "Affected builds");
    const covered = metricValue(context, "Alternate units");
    const gap = metricValue(context, "Coverage gap");
    if (affected === undefined || covered === undefined || gap === undefined) return undefined;

    return {
      kind: "operational-bar",
      id: "alternate-coverage",
      title: "Approved alternate coverage",
      description: "Affected builds compared with approved alternate coverage and the remaining gap.",
      unit: "builds",
      bars: [
        { id: "affected", label: "Affected builds", value: affected, displayValue: String(affected) },
        { id: "covered", label: "Covered by alternate", value: covered, displayValue: String(covered) },
        { id: "gap", label: "Coverage gap", value: gap, displayValue: String(gap) },
      ],
    };
  }

  if (context.workflow.key === "risks") {
    const bars = context.rows.flatMap((row) => {
      const value = firstNonNegativeNumber(row.affectedMaterial);
      if (value === undefined) return [];
      const label = row.subject.split("·").at(-1)?.trim() || row.subject;
      return [{ id: slug(row.subject), label, value, displayValue: value.toLocaleString("en-US") }];
    });
    if (bars.length < 2) return undefined;

    return {
      kind: "operational-bar",
      id: "shipment-quantities",
      title: "Shipment quantities in scope",
      description: "Material quantities on the authorized shipments returned for the current delivery-risk review.",
      unit: "blanks",
      bars,
    };
  }

  return undefined;
}

export function parseDemoSlideVisual(value: unknown): DemoSlideVisual | undefined {
  if (
    !isRecord(value) ||
    value.kind !== "slide-image" ||
    value.mediaType !== "image/svg+xml" ||
    value.demo !== true ||
    !nonEmptyString(value.result) ||
    !nonEmptyString(value.alt) ||
    !nonEmptyString(value.filename)
  ) {
    return undefined;
  }

  return {
    kind: "slide-image",
    mediaType: "image/svg+xml",
    result: value.result,
    alt: value.alt,
    filename: value.filename,
    demo: true,
  };
}

export function createDemoSlideVisual(context: AppContext): DemoSlideVisual {
  const themes = {
    risks: {
      title: "Supply continuity",
      subtitle: "See exceptions early. Protect the production plan.",
      filename: "supply-chain-risk-radar-demo.svg",
    },
    delay: {
      title: "Alternate supply",
      subtitle: "Connect approved capacity to the builds that need it.",
      filename: "supply-chain-alternate-supply-demo.svg",
    },
    consolidate: {
      title: "Resilient portfolio",
      subtitle: "Capture savings while protecting strategic relationships.",
      filename: "supply-chain-portfolio-demo.svg",
    },
  } as const;
  const theme = themes[context.workflow.key];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" role="img" aria-label="${theme.title}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#142a63"/>
      <stop offset="1" stop-color="#087f9d"/>
    </linearGradient>
    <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#8eacff"/>
      <stop offset="1" stop-color="#70d6b2"/>
    </linearGradient>
  </defs>
  <rect width="1536" height="1024" fill="url(#background)"/>
  <circle cx="1280" cy="170" r="280" fill="#ffffff" opacity="0.06"/>
  <circle cx="140" cy="940" r="330" fill="#ffffff" opacity="0.05"/>
  <text x="112" y="165" fill="#b9caff" font-family="Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="5">SUPPLY CHAIN HUB</text>
  <text x="112" y="290" fill="#ffffff" font-family="Arial, sans-serif" font-size="86" font-weight="700">${theme.title}</text>
  <text x="112" y="365" fill="#dce7ff" font-family="Arial, sans-serif" font-size="34">${theme.subtitle}</text>
  <path d="M230 670 C430 520 560 760 760 610 S1090 500 1305 650" fill="none" stroke="url(#flow)" stroke-width="22" stroke-linecap="round"/>
  <g fill="#ffffff" stroke="#8eacff" stroke-width="10">
    <circle cx="230" cy="670" r="58"/><circle cx="760" cy="610" r="58"/><circle cx="1305" cy="650" r="58"/>
  </g>
  <g fill="#142a63" font-family="Arial, sans-serif" font-size="28" font-weight="700" text-anchor="middle">
    <text x="230" y="680">SOURCE</text><text x="760" y="620">PLAN</text><text x="1305" y="660">DELIVER</text>
  </g>
  <text x="112" y="930" fill="#dce7ff" font-family="Arial, sans-serif" font-size="25">DEMO PREVIEW · Generated from non-sensitive workflow themes</text>
</svg>`;

  return {
    kind: "slide-image",
    result: Buffer.from(svg, "utf8").toString("base64"),
    mediaType: "image/svg+xml",
    alt: `${theme.title}: ${theme.subtitle}`,
    filename: theme.filename,
    demo: true,
  };
}

export function getDemoChatVisual(question: string, context: AppContext): DemoChatVisual | undefined {
  const suppliers = context.decisionSupport?.heatMap;
  if (suppliers?.length) {
    const preferredView = getDemoPortfolioView(question);
    const reason = preferredView === "bubble"
      ? "The authorized savings, relationship, and cost measures support a quantitative comparison."
      : "Decision bands support a compact authorized portfolio matrix.";
    return {
      toolName: "renderSupplierPortfolio",
      input: { preferredView, reason },
      output: resolveSupplierPortfolioVisualization(suppliers, preferredView, reason),
    };
  }

  if (!asksForVisualization(question)) return undefined;
  const chart = resolveOperationalChart(context);
  if (chart) {
    return {
      toolName: "renderOperationalChart",
      input: { visualId: chart.id, reason: chart.description },
      output: chart,
    };
  }

  return {
    toolName: "generateSlideVisual",
    input: {},
    output: createDemoSlideVisual(context),
  };
}
