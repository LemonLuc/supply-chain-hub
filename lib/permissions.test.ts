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
      allowedWorkflows: ["risks", "delay"],
    });
  });

  it("reserves the executive supplier portfolio for the Chief Logistics Officer", () => {
    expect(getPersonaPolicy("executive")).toEqual({
      canViewFinancials: true,
      allowedWorkflows: ["risks", "delay", "consolidate"],
    });
    expect(canAccessWorkflow("procurement", "consolidate")).toBe(false);
    expect(canAccessWorkflow("executive", "consolidate")).toBe(true);
  });

  it("exposes the two demo identities with procurement represented by a woman", () => {
    expect(personas).toEqual([
      { id: "logistics", label: "Logistics Planner" },
      { id: "procurement", label: "Procurement Team Lead" },
      { id: "executive", label: "Chief Logistics Officer" },
    ]);
  });
});
