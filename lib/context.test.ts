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
    expect(context.decisionSupport?.heatMap).toEqual([
      { supplier: "Steripack Hohenlohe", cost: "High", resilience: "High", recommendation: "Consolidate volume into MediSeal Jena" },
      { supplier: "MediSeal Jena", cost: "Medium", resilience: "High", recommendation: "Retain as strategic packaging source" },
      { supplier: "PräziForm Aalen", cost: "High", resilience: "Medium", recommendation: "Renegotiate or consolidate bracket volume" },
      { supplier: "Glaswerke Mainz", cost: "High", resilience: "Low", recommendation: "Protect and qualify backup capacity" },
      { supplier: "OptiQuartz Suhl", cost: "Medium", resilience: "Low", recommendation: "Retain for optical glass redundancy" },
    ]);
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
  it("exposes only risk-radar sources to logistics planners", () => {
    const sources = buildRoleToolSources("logistics");

    expect(sources.map((source) => source.toolId)).toEqual([
      "risks:sap",
      "risks:carriers",
      "risks:warehouse",
      "risks:outlook",
    ]);
    expect(sources.map((source) => source.workflowKey)).not.toContain("delay");
    expect(sources.map((source) => source.workflowKey)).not.toContain("consolidate");
  });

  it("exposes sources from all three authorized workflows to executives", () => {
    const sources = buildRoleToolSources("executive");

    expect(sources.some((source) => source.toolId === "consolidate:contracts")).toBe(true);
    expect(sources.some((source) => source.toolId.startsWith("risks:"))).toBe(false);
    expect(sources.some((source) => source.toolId.startsWith("delay:"))).toBe(false);
    expect(sources).toHaveLength(6);
  });
});

describe("resolveWorkflowForPrompt", () => {
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

describe("normalizeWorkflowKey", () => {
  it("falls back to risks for an unknown workflow", () => {
    expect(normalizeWorkflowKey("unknown")).toBe("risks");
  });
});
