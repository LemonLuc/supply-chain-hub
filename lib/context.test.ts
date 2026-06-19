import { describe, expect, it } from "vitest";

import { buildAppContext, normalizeWorkflowKey } from "./context";

describe("buildAppContext", () => {
  it("builds a least-privilege operational context for logistics", () => {
    const context = buildAppContext("risks");

    expect(context.workflow).toEqual({
      key: "risks",
      question: "Is there any delivery risk this week for N-FK5 optical glass blanks used in the Axioscan 7 objective module?",
      accessAllowed: true,
    });
    expect(context.answer.headline).toBe("Delivery exception found");
    expect(context.answer).not.toHaveProperty("financialMetrics");
    expect(context.rows[0]).not.toHaveProperty("financial");
    expect(context.persona).toEqual({
      id: "logistics",
      canViewFinancials: false,
      allowedWorkflows: ["risks"],
    });
  });

  it("includes financial fields for procurement leads", () => {
    const context = buildAppContext("risks", "procurement");

    expect(context.persona.canViewFinancials).toBe(true);
    expect(context.answer.financialMetrics).toEqual([
      ["Expedite option", "€8,400"],
      ["Avoided downtime", "€185,000"],
    ]);
    expect(context.rows[0]).toHaveProperty("financial", "€185K downtime exposure");
  });

  it("falls back to the risk radar when logistics requests a restricted workflow", () => {
    const context = buildAppContext("delay", "logistics");

    expect(context.workflow.key).toBe("risks");
    expect(context.workflow.accessAllowed).toBe(false);
    expect(context.answer.headline).toBe("Delivery exception found");
  });
});

describe("normalizeWorkflowKey", () => {
  it("falls back to risks for an unknown workflow", () => {
    expect(normalizeWorkflowKey("unknown")).toBe("risks");
  });
});
