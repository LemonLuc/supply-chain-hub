import { describe, expect, it } from "vitest";

import { buildAppContext, normalizeWorkflowKey } from "./context";

describe("buildAppContext", () => {
  it("builds a complete context snapshot for the selected workflow", () => {
    const context = buildAppContext("risks");

    expect(context.workflow).toEqual({
      key: "risks",
      question: "What are the current top supply chain risks across all suppliers this week?",
      confidence: "High confidence",
    });
    expect(context.answer.headline).toBe("Three suppliers need attention this week.");
    expect(context.suppliers).toHaveLength(8);
    expect(context.highlightedSuppliers).toEqual(["Supplier A", "Supplier G", "Supplier C"]);
    expect(context.metrics).toEqual({
      supplierCount: 8,
      openAlerts: 12,
      revenueAtRisk: "$4.8M",
    });
  });
});

describe("normalizeWorkflowKey", () => {
  it("falls back to risks for an unknown workflow", () => {
    expect(normalizeWorkflowKey("unknown")).toBe("risks");
  });
});
