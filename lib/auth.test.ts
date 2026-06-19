import { describe, expect, it } from "vitest";

import { getCurrentUser } from "./auth";

describe("getCurrentUser", () => {
  it("defaults to a least-privileged logistics planner", () => {
    expect(getCurrentUser({})).toEqual({
      name: "Lukas Weber",
      initials: "LW",
      role: "Logistics Planner",
      businessUnit: "Industrial Quality & Research",
      persona: "logistics",
    });
  });

  it("resolves the procurement mock identity from server configuration", () => {
    expect(getCurrentUser({ DEMO_USER_ROLE: "procurement" })).toEqual({
      name: "Anna Keller",
      initials: "AK",
      role: "Procurement Lead",
      businessUnit: "Semiconductor Manufacturing Technology",
      persona: "procurement",
    });
  });

  it("falls back to logistics for an unknown role", () => {
    expect(getCurrentUser({ DEMO_USER_ROLE: "administrator" }).persona).toBe("logistics");
  });
});
