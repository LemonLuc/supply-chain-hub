import { describe, expect, it } from "vitest";

import {
  canRenderBubble,
  deriveSupplierDecision,
  getDemoPortfolioView,
  getRelationshipBand,
  getSavingsBand,
  parseSupplierPortfolioVisualization,
  resolveSupplierPortfolioVisualization,
  type SupplierPortfolioItem,
} from "./supplier-portfolio";

const quantitativeItems: SupplierPortfolioItem[] = [
  {
    supplier: "MediSeal Jena",
    recommendation: "Keep as a strategic packaging source",
    annualCostUsd: 2_100_000,
    annualSavingsUsd: 120_000,
    relationshipScore: 93,
    relationshipDrivers: ["Validated packaging", "Reliable delivery"],
  },
];

describe("supplier portfolio visualization", () => {
  it("derives the four decision heat zones at their thresholds", () => {
    expect(
      deriveSupplierDecision({
        ...quantitativeItems[0],
        annualSavingsUsd: 349_999,
        relationshipScore: 65,
      }),
    ).toBe("Keep");
    expect(
      deriveSupplierDecision({
        ...quantitativeItems[0],
        annualSavingsUsd: 350_000,
        relationshipScore: 64,
      }),
    ).toBe("Consolidate");
    expect(
      deriveSupplierDecision({
        ...quantitativeItems[0],
        annualSavingsUsd: 350_000,
        relationshipScore: 65,
      }),
    ).toBe("Strategic trade-off");
    expect(
      deriveSupplierDecision({
        ...quantitativeItems[0],
        annualSavingsUsd: 349_999,
        relationshipScore: 64,
      }),
    ).toBe("Low priority");
  });

  it("uses a bubble chart only for complete finite portfolio measures", () => {
    expect(canRenderBubble(quantitativeItems)).toBe(true);
    expect(
      canRenderBubble([
        { ...quantitativeItems[0], relationshipScore: undefined } as unknown as SupplierPortfolioItem,
      ]),
    ).toBe(false);
    expect(canRenderBubble([{ ...quantitativeItems[0], relationshipScore: 101 }])).toBe(false);
    expect(canRenderBubble([{ ...quantitativeItems[0], annualSavingsUsd: Number.NaN }])).toBe(false);
    expect(canRenderBubble([{ ...quantitativeItems[0], annualCostUsd: -1 }])).toBe(false);
    expect(canRenderBubble([])).toBe(false);
  });

  it("falls back to the matrix when bubble data is incomplete", () => {
    expect(
      resolveSupplierPortfolioVisualization(
        [
          {
            ...quantitativeItems[0],
            relationshipScore: undefined,
          } as unknown as SupplierPortfolioItem,
        ],
        "bubble",
        "Compare annual savings and relationship strength.",
      ),
    ).toMatchObject({
      view: "matrix",
      requestedView: "bubble",
      fallbackApplied: true,
    });
  });

  it("preserves a valid bubble request and derives its decision", () => {
    expect(
      resolveSupplierPortfolioVisualization(
        quantitativeItems,
        "bubble",
        "Compare annual savings and relationship strength.",
      ),
    ).toMatchObject({
      view: "bubble",
      requestedView: "bubble",
      fallbackApplied: false,
      reason: "Compare annual savings and relationship strength.",
      suppliers: [{ decision: "Keep" }],
    });
  });

  it("maps savings and relationship measures into display bands", () => {
    expect(getSavingsBand(249_999)).toBe("Low");
    expect(getSavingsBand(250_000)).toBe("Medium");
    expect(getSavingsBand(599_999)).toBe("Medium");
    expect(getSavingsBand(600_000)).toBe("High");

    expect(getRelationshipBand(49)).toBe("Low");
    expect(getRelationshipBand(50)).toBe("Medium");
    expect(getRelationshipBand(74)).toBe("Medium");
    expect(getRelationshipBand(75)).toBe("High");
  });

  it("selects the demo view from explicit presentation intent", () => {
    expect(getDemoPortfolioView("Plot this as a quantitative bubble chart.")).toBe("bubble");
    expect(getDemoPortfolioView("Compare annual savings and relationship score.")).toBe("bubble");
    expect(getDemoPortfolioView("Show the supplier heat map.")).toBe("bubble");
  });

  it("accepts valid tool output and rejects malformed or inconsistent output", () => {
    const output = resolveSupplierPortfolioVisualization(
      quantitativeItems,
      "bubble",
      "Savings and relationship comparison",
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
        suppliers: [{ ...output.suppliers[0], decision: "Consolidate" }],
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
