import { describe, expect, it } from "vitest";

import { buildAppContext, normalizeWorkflowKey } from "./context";

describe("buildAppContext", () => {
  it("builds a complete context snapshot for the selected workflow", () => {
    const context = buildAppContext("risks");

    expect(context.workflow).toEqual({
      key: "risks",
      question: "What are the current top supply risks across all critical suppliers this week?",
      confidence: "Grounded · 6 sources",
    });
    expect(context.answer.headline).toBe("Three suppliers require action before the next planning cycle.");
    expect(context.suppliers).toHaveLength(8);
    expect(context.persona).toEqual({
      id: "logistics",
      canViewSupplierImpact: false,
    });
    expect(context.suppliers[0]).not.toHaveProperty("impact");
    expect(context.highlightedSuppliers).toEqual(["Supplier A", "Supplier G", "Supplier C"]);
    expect(context.metrics).toEqual({
      supplierCount: 8,
      openAlerts: 12,
      revenueAtRisk: "€4.8M",
    });
  });

  it("includes supplier impact data for procurement leads", () => {
    const context = buildAppContext("risks", "procurement");

    expect(context.persona).toEqual({
      id: "procurement",
      canViewSupplierImpact: true,
    });
    expect(context.suppliers[0]).toHaveProperty("impact", "€1.6M revenue at risk");
  });
});

describe("normalizeWorkflowKey", () => {
  it("falls back to risks for an unknown workflow", () => {
    expect(normalizeWorkflowKey("unknown")).toBe("risks");
  });
});
