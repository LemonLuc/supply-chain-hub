import { describe, expect, it } from "vitest";

import { buildAppContext, buildRoleToolSources, normalizeWorkflowKey, resolveWorkflowForPrompt } from "./context";

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

    expect(context.persona.canViewFinancials).toBe(false);
    expect(context.answer).not.toHaveProperty("financialMetrics");
    expect(context.rows[0]).not.toHaveProperty("financial");
  });

  it("limits operational evidence to multiple selected authorized sources", () => {
    const context = buildAppContext("risks", "logistics", ["carriers", "warehouse", "unknown"]);

    expect(context.sources.map((source) => source.id)).toEqual(["carriers", "warehouse"]);
    expect(context.selectedAuthorizedSources.map((source) => source.id)).toEqual(["carriers", "warehouse"]);
    expect(context.activity.map((step) => step.tool)).toEqual(["Shipping providers MCP", "SAP EWM MCP"]);
    expect(context.rows.map((row) => row.subject)).toEqual(["PO 4500872319 · DHL Freight", "PO 4500872481 · FedEx Priority"]);
  });

  it("hides Outlook-gated actions when Outlook is not selected", () => {
    const context = buildAppContext("risks", "logistics", ["sap", "carriers", "warehouse"]);

    expect(context.recommendedActions.map((action) => action.label)).not.toContain("Write Dana Narid for review");
    expect(context.recommendedActions.map((action) => action.label)).not.toContain("Request DHL recovery routing");
    expect(context.recommendedActions.map((action) => action.label)).toContain("Log DHL exception on PO 4500872319");
  });

  it("includes Outlook-gated actions when Outlook is selected", () => {
    const context = buildAppContext("risks", "logistics", ["sap", "carriers", "warehouse", "outlook"]);

    expect(context.recommendedActions.map((action) => action.label)).toEqual([
      "Request DHL recovery routing",
      "Create Outlook recovery task",
      "Write Dana Narid for review",
      "Log DHL exception on PO 4500872319",
    ]);
  });

  it("falls back to the risk radar when logistics requests a restricted workflow", () => {
    const context = buildAppContext("delay", "logistics");

    expect(context.workflow.key).toBe("risks");
    expect(context.workflow.accessAllowed).toBe(false);
    expect(context.answer.headline).toBe("Delivery exception found");
    expect(context).not.toHaveProperty("decisionSupport");
  });

  it("includes workflow-specific decision data for authorized executive requests", () => {
    const context = buildAppContext("consolidate", "executive");

    expect(context.workflow.key).toBe("consolidate");
    expect(context.workflow.accessAllowed).toBe(true);
    const portfolio = context.decisionSupport?.heatMap ?? [];
    expect(portfolio).toHaveLength(7);
    expect(portfolio[0]).toMatchObject({
      supplier: "MediSeal Jena",
      annualCostUsd: 2_100_000,
      annualSavingsUsd: 120_000,
      relationshipScore: 93,
    });
    expect(portfolio[1]).toMatchObject({
      supplier: "OptiQuartz Suhl",
      annualCostUsd: 2_800_000,
      annualSavingsUsd: 250_000,
      relationshipScore: 84,
    });
    expect(portfolio[4]).toMatchObject({
      supplier: "FlexPack Esslingen",
      annualCostUsd: 800_000,
      annualSavingsUsd: 660_000,
      relationshipScore: 35,
    });
    expect(portfolio[6]).toMatchObject({
      supplier: "HelioGlass Dresden",
      annualCostUsd: 2_300_000,
      annualSavingsUsd: 910_000,
      relationshipScore: 70,
    });
    expect(
      portfolio.every(
        (item) =>
          typeof item.annualCostUsd === "number" &&
          item.annualCostUsd >= 0 &&
          typeof item.annualSavingsUsd === "number" &&
          item.annualSavingsUsd >= 0 &&
          typeof item.relationshipScore === "number" &&
          item.relationshipScore >= 0 &&
          item.relationshipScore <= 100 &&
          Array.isArray(item.relationshipDrivers) &&
          item.relationshipDrivers.length >= 2,
      ),
    ).toBe(true);
    expect(context.approval).toBeUndefined();
    expect(context.recommendedActions.map((action) => action.label)).toEqual([
      "Draft contract termination letter",
      "Prepare board decision record",
      "Create supplier negotiation mandate",
    ]);
  });

  it("keeps executives on the strategic portfolio workflow", () => {
    const context = buildAppContext("delay", "executive", ["sap", "quality", "excel", "capacity", "outlook"]);

    expect(context.workflow.key).toBe("risks");
    expect(context.workflow.accessAllowed).toBe(false);
    expect(context).not.toHaveProperty("documents");
  });

  it("includes SharePoint workbook review data for Dana when the Excel source is selected", () => {
    const context = buildAppContext("delay", "procurement", ["sap", "quality", "excel", "capacity", "outlook"]);

    expect(context.workflow.key).toBe("delay");
    expect(context.workflow.accessAllowed).toBe(true);
    expect(context.sources.map((source) => source.id)).toContain("excel");
    expect(context.documents?.map((document) => document.name)).toEqual(["Supplier Risk & Capacity Register.xlsx"]);
    expect(JSON.stringify(context.documents)).toContain("Dana Narid");
    expect(JSON.stringify(context.documents)).toContain("Mechatronik Süd capacity increased from 6 to 8 units");
  });

  it("focuses the visible answer and evidence rows on the selected workbook prompt", () => {
    const context = buildAppContext(
      "delay",
      "procurement",
      ["sap", "quality", "excel", "capacity", "outlook"],
      "Review Supplier Risk & Capacity Register.xlsx and show me recent changes.",
    );

    expect(context.answer.headline).toBe("Supplier risk register changes found");
    expect(context.answer.summary).toContain("Supplier Risk & Capacity Register.xlsx");
    expect(context.answer.metrics).toEqual([
      ["Workbook version", "24.06.21-rc3"],
      ["Recent changes", "3"],
      ["Owner", "Dana Narid"],
    ]);
    expect(context.rows.map((row) => row.detail)).toEqual([
      "Alternate Coverage",
      "Qualification Status",
      "Production Impact",
    ]);
    expect(context.rows[0].evidence).toContain("incoming torque test required");
  });

  it("omits SharePoint workbook review data when the workbook source is not selected", () => {
    const context = buildAppContext("delay", "executive", ["sap", "quality", "capacity", "outlook"]);

    expect(context.sources.map((source) => source.id)).not.toContain("excel");
    expect(context).not.toHaveProperty("documents");
  });

  it("does not leak restricted workflow synthetic data when access is denied", () => {
    const context = buildAppContext("consolidate", "procurement");

    expect(context.workflow.key).toBe("risks");
    expect(context.workflow.accessAllowed).toBe(false);
    expect(context.answer.headline).toBe("Delivery exception found");
    expect(JSON.stringify(context)).not.toContain("Steripack Hohenlohe");
    expect(JSON.stringify(context)).not.toContain("C-level approval required");
  });
});

describe("buildRoleToolSources", () => {
  it("exposes unique stable tools to logistics planners", () => {
    const sources = buildRoleToolSources("logistics");

    expect(sources.map((source) => source.toolId)).toEqual([
      "sap",
      "carriers",
      "warehouse",
      "outlook",
    ]);
    expect(sources.every((source) => source.workflowKeys.every((key) => key === "risks"))).toBe(true);
  });

  it("deduplicates shared procurement tools and retains their workflows", () => {
    const sources = buildRoleToolSources("procurement");
    const outlook = sources.find((source) => source.toolId === "outlook");

    expect(new Set(sources.map((source) => source.toolId)).size).toBe(sources.length);
    expect(sources.map((source) => source.toolId)).toEqual([
      "sap",
      "carriers",
      "warehouse",
      "outlook",
      "quality",
      "excel",
      "capacity",
      "teams",
    ]);
    expect(outlook).toMatchObject({
      selected: true,
      workflowKeys: ["risks", "delay"],
    });
  });

  it("exposes only unique strategic tools to executives", () => {
    const sources = buildRoleToolSources("executive");

    expect(sources.map((source) => source.toolId)).toEqual([
      "sap",
      "contracts",
      "quality",
      "resilience",
      "policy",
      "word",
    ]);
    expect(sources.every((source) => source.workflowKeys.includes("consolidate"))).toBe(true);
  });
});

describe("resolveWorkflowForPrompt", () => {
  it("routes Dana's recovery assignment prompt to supplier alternatives", () => {
    expect(
      resolveWorkflowForPrompt(
        "Assign the carrier recovery check for the uncovered builds.",
        "procurement",
      ),
    ).toBe("delay");
    expect(
      resolveWorkflowForPrompt(
        "Assign a carrier recovery check for uncovered builds today.",
        "procurement",
      ),
    ).toBe("delay");
  });

  it("selects the supplier alternatives workflow when an authorized prompt asks for alternates", () => {
    expect(resolveWorkflowForPrompt("Which approved alternatives can cover the turret delay?", "procurement")).toBe("delay");
  });

  it("routes the supplier risk register review prompt to the SharePoint-backed workflow for executives", () => {
    expect(resolveWorkflowForPrompt("Which supplier consolidation options improve savings and resilience?", "executive")).toBe("consolidate");
  });

  it("falls back to an authorized workflow when the matching workflow is restricted", () => {
    expect(resolveWorkflowForPrompt("Give me a cost-versus-resilience heat map.", "procurement")).toBe("risks");
  });
});

describe("role-aware actions", () => {
  it("filters actions by persona eligibility", () => {
    const logistics = buildAppContext("risks", "logistics", [
      "sap",
      "carriers",
      "warehouse",
      "outlook",
    ]);
    const procurementRisk = buildAppContext("risks", "procurement", [
      "sap",
      "carriers",
      "warehouse",
      "outlook",
    ]);
    const procurementDelay = buildAppContext("delay", "procurement", [
      "sap",
      "quality",
      "excel",
      "capacity",
      "outlook",
    ]);

    expect(logistics.recommendedActions).toContainEqual(
      expect.objectContaining({
        label: "Write Dana Narid for review",
        reviewerPersona: "procurement",
      }),
    );
    expect(procurementRisk.recommendedActions).toHaveLength(0);
    expect(procurementDelay.recommendedActions).toContainEqual(
      expect.objectContaining({
        label: "Assign recovery check to logistics",
        assigneePersona: "logistics",
      }),
    );
    expect(procurementDelay.recommendedActions).toContainEqual(
      expect.objectContaining({
        label: "Ask Lucia Lopez for exception review",
        reviewerPersona: "executive",
      }),
    );
  });
});

describe("normalizeWorkflowKey", () => {
  it("falls back to risks for an unknown workflow", () => {
    expect(normalizeWorkflowKey("unknown")).toBe("risks");
  });
});
