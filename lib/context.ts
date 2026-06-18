import { suppliers, workflowKeys, workflows, type WorkflowKey } from "./demo-data";

export function normalizeWorkflowKey(value: unknown): WorkflowKey {
  return typeof value === "string" && workflowKeys.includes(value as WorkflowKey)
    ? (value as WorkflowKey)
    : "risks";
}

export function buildAppContext(value: unknown) {
  const key = normalizeWorkflowKey(value);
  const workflow = workflows[key];

  return {
    workflow: {
      key,
      question: workflow.question,
      confidence: workflow.confidence,
    },
    answer: {
      headline: workflow.headline,
      summary: workflow.summary,
      impacts: workflow.impacts,
    },
    recommendedActions: workflow.actions,
    architectureTrace: workflow.architecture,
    suppliers,
    highlightedSuppliers: workflow.highlights,
    metrics: {
      supplierCount: suppliers.length,
      openAlerts: suppliers.filter((supplier) => supplier.risk !== "Low").length * 2,
      revenueAtRisk: workflows.risks.impacts[1][1],
    },
  };
}

export type AppContext = ReturnType<typeof buildAppContext>;
