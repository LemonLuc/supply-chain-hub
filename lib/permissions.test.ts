import { describe, expect, it } from "vitest";

import { canAccessWorkflow, getPersonaPolicy, normalizePersona, personas } from "./permissions";

describe("persona permissions", () => {
  it("defaults unknown personas to the least-privileged logistics role", () => {
    expect(normalizePersona("unknown")).toBe("logistics");
    expect(normalizePersona(undefined)).toBe("logistics");
  });

  it("removes financial access and advanced workflows from logistics", () => {
    expect(getPersonaPolicy("logistics")).toEqual({
      canViewFinancials: false,
      allowedWorkflows: ["risks"],
    });
    expect(canAccessWorkflow("logistics", "delay")).toBe(false);
    expect(canAccessWorkflow("logistics", "consolidate")).toBe(false);
  });

  it("grants procurement access while preserving executive approval gates", () => {
    expect(getPersonaPolicy("procurement")).toEqual({
      canViewFinancials: true,
      allowedWorkflows: ["risks", "delay", "consolidate"],
    });
  });

  it("exposes the two demo identities with procurement represented by a woman", () => {
    expect(personas).toEqual([
      { id: "logistics", label: "Logistics planner" },
      { id: "procurement", label: "Procurement lead" },
    ]);
  });
});
