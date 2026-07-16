import { describe, expect, it } from "vitest";

import {
  canRenderBubble,
  deriveSupplierAction,
  getDemoPortfolioView,
  parseSupplierPortfolioVisualization,
  resolveSupplierPortfolioVisualization,
  type SupplierPortfolioItem,
} from "./supplier-portfolio";

const quantitativeItems: SupplierPortfolioItem[] = [
  {
    supplier: "MediSeal Jena",
    cost: "Medium",
    resilience: "High",
    action: "Retain",
    recommendation: "Retain as strategic source",
    costScore: 48,
    resilienceScore: 86,
    annualSpendMillions: 1.9,
  },
];

describe("supplier portfolio visualization", () => {
  it("uses a bubble chart only for complete finite normalized scores", () => {
    expect(canRenderBubble(quantitativeItems)).toBe(true);
    expect(canRenderBubble([{ ...quantitativeItems[0], resilienceScore: undefined }])).toBe(false);
    expect(canRenderBubble([{ ...quantitativeItems[0], costScore: 101 }])).toBe(false);
    expect(canRenderBubble([{ ...quantitativeItems[0], costScore: Number.NaN }])).toBe(false);
    expect(canRenderBubble([])).toBe(false);
  });

  it("falls back to the matrix when bubble data is incomplete", () => {
    expect(
      resolveSupplierPortfolioVisualization(
        [{ ...quantitativeItems[0], costScore: undefined }],
        "bubble",
        "Compare the quantitative measures.",
      ),
    ).toMatchObject({
      view: "matrix",
      requestedView: "bubble",
      fallbackApplied: true,
    });
  });

  it("preserves a valid bubble request", () => {
    expect(
      resolveSupplierPortfolioVisualization(
        quantitativeItems,
        "bubble",
        "Compare the quantitative measures.",
      ),
    ).toMatchObject({
      view: "bubble",
      requestedView: "bubble",
      fallbackApplied: false,
      reason: "Compare the quantitative measures.",
    });
  });

  it("derives a stable action for legacy items", () => {
    expect(deriveSupplierAction({ ...quantitativeItems[0], action: undefined })).toBe("Retain");
    expect(
      deriveSupplierAction({
        ...quantitativeItems[0],
        action: undefined,
        recommendation: "Protect and qualify backup capacity",
      }),
    ).toBe("Protect");
    expect(
      deriveSupplierAction({
        ...quantitativeItems[0],
        action: undefined,
        recommendation: "Renegotiate or consolidate bracket volume",
      }),
    ).toBe("Consolidate");
  });

  it("selects the demo view from explicit presentation intent", () => {
    expect(getDemoPortfolioView("Plot this as a quantitative bubble chart.")).toBe("bubble");
    expect(getDemoPortfolioView("Compare the cost score and resilience score.")).toBe("bubble");
    expect(getDemoPortfolioView("Show the supplier heat map.")).toBe("matrix");
  });

  it("accepts valid tool output and rejects malformed output", () => {
    const output = resolveSupplierPortfolioVisualization(
      quantitativeItems,
      "bubble",
      "Quantitative comparison",
    );

    expect(parseSupplierPortfolioVisualization(output)).toEqual(output);
    expect(
      parseSupplierPortfolioVisualization({
        ...output,
        suppliers: [{ supplier: "Invented" }],
      }),
    ).toBeUndefined();
    expect(
      parseSupplierPortfolioVisualization({
        ...output,
        view: "radar",
      }),
    ).toBeUndefined();
  });
});
