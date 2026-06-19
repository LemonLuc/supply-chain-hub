import { describe, expect, it } from "vitest";

import { suppliers, workflows } from "./demo-data";

describe("workflow transformation data", () => {
  it("captures the manual weekly risk process and integrated replacement", () => {
    expect(workflows.risks.before).toContain("SAP");
    expect(workflows.risks.beforeSystems).toEqual(
      expect.arrayContaining(["SAP S/4HANA", "Supplier portals", "Excel scorecards"]),
    );
    expect(workflows.risks.withHub).toContain("authorized");
    expect(workflows.risks.hubSteps).toHaveLength(3);
    expect(workflows.risks.suggestedPrompts).toHaveLength(3);
  });

  it("models the 14-day delay and procurement guardrails", () => {
    expect(workflows.delay.question).toContain("14 days");
    expect(workflows.delay.withHub).toContain("BOM");
    expect(workflows.consolidate.withHub.toLowerCase()).toContain("guardrails");
  });

  it("removes presentation talk tracks and uses optics-relevant EUR data", () => {
    expect(workflows.risks).not.toHaveProperty("talk");
    expect(suppliers.map((supplier) => supplier.category)).toContain("Optical glass blanks");
    expect(suppliers[0].impact).toContain("€");
  });
});
