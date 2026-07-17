import { describe, expect, it } from "vitest";

import { workflows } from "./demo-data";

describe("operational workflow data", () => {
  it("models a CW 30 delivery radar with current carrier evidence and actions", () => {
    expect(workflows.risks.question).toContain("N-FK5");
    expect(workflows.risks.sources.map((source) => source.name)).toEqual(
      expect.arrayContaining([
        "SAP S/4HANA",
        "Shipping providers",
        "Microsoft Outlook",
      ]),
    );
    expect(workflows.risks.sources).toContainEqual(
      expect.objectContaining({ id: "outlook", name: "Microsoft Outlook" }),
    );
    expect(workflows.risks.question).toContain("CW 30");
    expect(workflows.risks.summary).toContain("23 July");
    expect(workflows.risks.sourceStatus).toBe("6 available tools · live demo data");
    expect(workflows.risks.actions.map((action) => action.label)).toEqual(
      expect.arrayContaining([
        "Request DHL recovery routing",
        "Create Microsoft Outlook recovery task",
        "Write Dana Narid for review",
        "Log DHL exception on PO 4500872319",
      ]),
    );
    expect(JSON.stringify(workflows)).not.toMatch(/June|2026-06|24\.06\.21/);
  });

  it("models role-restricted alternatives and executive decision actions", () => {
    expect(workflows.delay.minimumPersona).toBe("procurement");
    expect(workflows.delay.question).toContain("objective turret");
    expect(workflows.delay.suggestedPrompts.join(" ")).not.toContain("Lukas");
    expect(workflows.delay.actions.map((action) => action.label)).not.toContain("Share risk register with Lukas");
    expect(workflows.delay.actions.map((action) => action.label)).toContain("Assign recovery check to logistics");
    expect(workflows.consolidate.minimumPersona).toBe("executive");
    expect(workflows.consolidate.approval).toBeUndefined();
    expect(workflows.consolidate.actions.map((action) => action.label)).toContain("Draft contract termination letter");
  });

  it("stores auditable activity rather than hidden model reasoning", () => {
    expect(workflows.risks.activity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tool: "SAP S/4HANA MCP" }),
        expect.objectContaining({ tool: "Shipping providers MCP" }),
      ]),
    );
    expect(workflows.risks.analysisTrace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Understand request" }),
        expect.objectContaining({ label: "Check access" }),
        expect.objectContaining({ label: "Validate evidence" }),
      ]),
    );
  });
});
