import { describe, expect, it } from "vitest";

import {
  buildActionWorkflowResult,
  getActionAssignee,
  getActionReviewer,
} from "./action-workflows";
import { buildAppContext } from "./context";

describe("action workflow policy", () => {
  it("assigns Dana's recovery task directly to Lukas", () => {
    const context = buildAppContext("delay", "procurement", [
      "sap",
      "quality",
      "excel",
      "capacity",
      "outlook",
    ]);
    const action = context.recommendedActions.find(
      (candidate) => candidate.label === "Assign recovery check to logistics",
    );

    expect(action).toBeDefined();
    expect(getActionAssignee(action!)).toBe("logistics");
    expect(getActionReviewer(action!)).toBeNull();

    const result = buildActionWorkflowResult({
      context,
      workflowKey: "delay",
      persona: "procurement",
      action: action!,
      orchestration: "demo-fallback",
    });

    expect(result).toMatchObject({
      assigneePersona: "logistics",
      assigneeName: "Lukas Weber",
      reviewerPersona: null,
      reviewerName: null,
      handoff: null,
    });
    expect(result.notice).toContain("Task assigned to Lukas Weber");
  });
});
