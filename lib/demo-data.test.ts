import { describe, expect, it } from "vitest";

import { workflows } from "./demo-data";

describe("operational workflow data", () => {
  it("models a Monday delivery radar with carrier evidence and actions", () => {
    expect(workflows.risks.question).toContain("N-FK5");
    expect(workflows.risks.sources.map((source) => source.name)).toEqual(
      expect.arrayContaining(["SAP S/4HANA", "DHL Freight", "FedEx"]),
    );
    expect(workflows.risks.actions.map((action) => action.label)).toEqual(
      expect.arrayContaining(["Draft email to DHL Freight", "Update SAP promised date"]),
    );
  });

  it("models role-restricted alternatives and an executive approval workflow", () => {
    expect(workflows.delay.minimumPersona).toBe("procurement");
    expect(workflows.delay.question).toContain("objective turret");
    expect(workflows.consolidate.minimumPersona).toBe("executive");
    expect(workflows.consolidate.approval?.label).toBe("C-level approval required");
  });

  it("stores auditable activity rather than hidden model reasoning", () => {
    expect(workflows.risks.activity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tool: "SAP S/4HANA MCP" }),
        expect.objectContaining({ tool: "DHL Freight MCP" }),
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
