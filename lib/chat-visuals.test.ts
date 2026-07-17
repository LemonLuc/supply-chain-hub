import { describe, expect, it } from "vitest";

import { buildAppContext } from "./context";
import {
  asksForVisualization,
  createDemoSlideVisual,
  getDemoChatVisual,
  parseOperationalBarChart,
  resolveOperationalChart,
} from "./chat-visuals";

describe("asksForVisualization", () => {
  it("recognizes explicit chart and slide-image requests", () => {
    expect(asksForVisualization("Visualize this comparison.")).toBe(true);
    expect(asksForVisualization("Plot this as a graph.")).toBe(true);
    expect(asksForVisualization("Show the supplier heat map.")).toBe(true);
    expect(asksForVisualization("Open the supplier heatmap.")).toBe(true);
    expect(asksForVisualization("Create an image suitable for a slide.")).toBe(true);
    expect(asksForVisualization("What should I do first?")).toBe(false);
  });
});

describe("resolveOperationalChart", () => {
  it("derives alternate coverage only from the authorized delay context", () => {
    const context = buildAppContext(
      "delay",
      "procurement",
      ["sap", "quality", "excel", "capacity", "outlook"],
    );

    expect(resolveOperationalChart(context)).toEqual({
      kind: "operational-bar",
      id: "alternate-coverage",
      title: "Approved alternate coverage",
      description: "Affected builds compared with approved alternate coverage and the remaining gap.",
      unit: "builds",
      bars: [
        { id: "affected", label: "Affected builds", value: 14, displayValue: "14" },
        { id: "covered", label: "Covered by alternate", value: 8, displayValue: "8" },
        { id: "gap", label: "Coverage gap", value: 6, displayValue: "6" },
      ],
    });
  });

  it("derives shipment quantities from authorized result rows", () => {
    const context = buildAppContext("risks", "logistics", ["carriers"]);
    const chart = resolveOperationalChart(context);

    expect(chart).toMatchObject({
      kind: "operational-bar",
      id: "shipment-quantities",
      unit: "blanks",
      bars: [
        expect.objectContaining({ label: "DHL Freight", value: 480 }),
        expect.objectContaining({ label: "FedEx Priority", value: 60 }),
      ],
    });
  });

  it("does not create a chart when selected sources provide no compatible numeric comparison", () => {
    const context = buildAppContext("risks", "logistics", []);

    expect(resolveOperationalChart(context)).toBeUndefined();
  });
});

describe("visual output validation", () => {
  it("accepts a complete finite operational chart", () => {
    const chart = resolveOperationalChart(
      buildAppContext("delay", "procurement", ["sap", "quality", "excel", "capacity"]),
    );

    expect(parseOperationalBarChart(chart)).toEqual(chart);
  });

  it("rejects malformed, non-finite, and single-value chart output", () => {
    expect(parseOperationalBarChart({ kind: "operational-bar", bars: [] })).toBeUndefined();
    expect(parseOperationalBarChart({
      kind: "operational-bar",
      id: "bad",
      title: "Bad",
      description: "Bad",
      unit: "items",
      bars: [
        { id: "one", label: "One", value: 1, displayValue: "1" },
        { id: "two", label: "Two", value: Number.NaN, displayValue: "NaN" },
      ],
    })).toBeUndefined();
  });
});

describe("demo visual routing", () => {
  it("prefers the existing trusted supplier visualization", () => {
    const context = buildAppContext(
      "consolidate",
      "executive",
      ["sap", "contracts", "quality", "resilience", "policy"],
    );

    expect(getDemoChatVisual("Visualize this as a bubble chart.", context)).toMatchObject({
      toolName: "renderSupplierPortfolio",
      output: { view: "bubble" },
    });
    expect(getDemoChatVisual("Visualize this.", context)).toMatchObject({
      toolName: "renderSupplierPortfolio",
      output: { view: "bubble" },
    });
    expect(getDemoChatVisual("Create an image suitable for a slide.", context)).toMatchObject({
      toolName: "generateSlideVisual",
      output: { kind: "slide-image" },
    });
    expect(getDemoChatVisual("Compare supplier cost and resilience.", context)).toBeUndefined();
  });

  it("uses a trusted operational chart before a generated preview", () => {
    const context = buildAppContext(
      "delay",
      "procurement",
      ["sap", "quality", "excel", "capacity"],
    );

    expect(getDemoChatVisual("Chart this coverage plan.", context)).toMatchObject({
      toolName: "renderOperationalChart",
      output: { id: "alternate-coverage" },
    });
  });

  it("uses the generated-image path for a contextual Visualize this request", () => {
    const context = buildAppContext(
      "delay",
      "procurement",
      ["sap", "quality", "excel", "capacity"],
    );

    expect(getDemoChatVisual("Visualize this.", context)).toMatchObject({
      toolName: "generateSlideVisual",
      output: { kind: "slide-image" },
    });
  });

  it("creates a clearly identified deterministic slide preview when no chart is available", () => {
    const context = buildAppContext("risks", "logistics", []);
    const visual = createDemoSlideVisual(context);

    expect(visual).toMatchObject({
      kind: "slide-image",
      mediaType: "image/svg+xml",
      demo: true,
      filename: "supply-chain-risk-radar-demo.svg",
    });
    expect(visual.result.length).toBeGreaterThan(100);
    expect(Buffer.from(visual.result, "base64").toString("utf8")).toContain("Supply continuity");
    expect(getDemoChatVisual("Create a slide image about resilient logistics.", context)).toMatchObject({
      toolName: "generateSlideVisual",
      output: { demo: true },
    });
  });
});
