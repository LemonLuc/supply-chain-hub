import { describe, expect, it } from "vitest";

import {
  buildActionWorkflowResult,
  getActionAssignee,
  getActionReviewer,
  getRecipientActionLabel,
} from "./action-workflows";
import { buildAppContext } from "./context";
import { workflows } from "./demo-data";

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
    expect(getRecipientActionLabel(action!)).toBe("Run recovery check");

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
      recipientActionLabel: "Run recovery check",
      handoff: null,
    });
    expect(result.notice).toContain("Task assigned to Lukas Weber");
  });

  it("resolves recipient-facing labels for every review handoff", () => {
    const logisticsContext = buildAppContext("risks", "logistics");
    const procurementContext = buildAppContext("delay", "procurement");
    const danaReview = logisticsContext.recommendedActions.find(
      (candidate) => candidate.label === "Write Dana Narid for review",
    );
    const luciaReview = procurementContext.recommendedActions.find(
      (candidate) => candidate.label === "Ask Lucia Lopez for exception review",
    );

    expect(danaReview).toBeDefined();
    expect(luciaReview).toBeDefined();
    expect(getRecipientActionLabel(danaReview!)).toBe(
      "Review delivery risk summary",
    );
    expect(getRecipientActionLabel(luciaReview!)).toBe(
      "Review six-build coverage exception",
    );

    const result = buildActionWorkflowResult({
      context: logisticsContext,
      workflowKey: "risks",
      persona: "logistics",
      action: danaReview!,
      orchestration: "demo-fallback",
    });

    expect(result.actionLabel).toBe("Write Dana Narid for review");
    expect(result.recipientActionLabel).toBe("Review delivery risk summary");
  });

  it("defines recipient copy for every directed action", () => {
    const directedActions = Object.values(workflows)
      .flatMap((workflow) => workflow.actions)
      .filter((action) => action.assigneePersona || action.reviewerPersona);

    expect(directedActions).not.toHaveLength(0);
    for (const action of directedActions) {
      expect(action.recipientLabel).toEqual(expect.any(String));
      expect(action.recipientLabel?.trim()).not.toBe("");
    }
  });
});
