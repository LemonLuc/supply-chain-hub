import { describe, expect, it } from "vitest";

import {
  asksForCostResilienceVisualization,
  getCostResiliencePortfolioView,
  resolveCostResilienceVisualization,
  supplierCostResilienceSnapshot,
} from "./supplier-cost-resilience";

describe("historical supplier cost and resilience visualization", () => {
  it("restores the exact five-supplier quantitative snapshot", () => {
    expect(supplierCostResilienceSnapshot).toEqual([
      expect.objectContaining({
        supplier: "Steripack Hohenlohe",
        action: "Consolidate",
        costScore: 84,
        resilienceScore: 82,
        annualSpendMillions: 2.6,
      }),
      expect.objectContaining({
        supplier: "MediSeal Jena",
        action: "Retain",
        costScore: 48,
        resilienceScore: 88,
        annualSpendMillions: 2.2,
      }),
      expect.objectContaining({
        supplier: "PräziForm Aalen",
        action: "Consolidate",
        costScore: 78,
        resilienceScore: 58,
        annualSpendMillions: 1.7,
      }),
      expect.objectContaining({
        supplier: "Glaswerke Mainz",
        action: "Protect",
        costScore: 88,
        resilienceScore: 28,
        annualSpendMillions: 3.1,
      }),
      expect.objectContaining({
        supplier: "OptiQuartz Suhl",
        action: "Retain",
        costScore: 55,
        resilienceScore: 34,
        annualSpendMillions: 2.4,
      }),
    ]);
  });

  it("routes historical cost/resilience requests without taking over the newer savings view", () => {
    expect(
      asksForCostResilienceVisualization(
        "Show the old supplier heat map with bubbles for cost and resilience.",
      ),
    ).toBe(true);
    expect(
      asksForCostResilienceVisualization(
        "Plot the supplier cost score and resilience score as a bubble chart.",
      ),
    ).toBe(true);
    expect(
      asksForCostResilienceVisualization(
        "Plot annual consolidation savings and strategic relationship score as a bubble chart.",
      ),
    ).toBe(false);
  });

  it("uses the original view resolver and complete historical records", () => {
    expect(getCostResiliencePortfolioView("Show the supplier heat map.")).toBe("matrix");
    expect(getCostResiliencePortfolioView("Show the supplier heat map with bubbles.")).toBe(
      "bubble",
    );
    expect(
      resolveCostResilienceVisualization(
        supplierCostResilienceSnapshot,
        "bubble",
        "Quantitative comparison",
      ),
    ).toMatchObject({
      view: "bubble",
      requestedView: "bubble",
      fallbackApplied: false,
      reason: "Quantitative comparison",
      suppliers: expect.arrayContaining([
        expect.objectContaining({ supplier: "Glaswerke Mainz", action: "Protect" }),
      ]),
    });
  });
});
