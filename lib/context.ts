import { workflowKeys, workflows, type WorkflowKey } from "./demo-data";
import { canAccessWorkflow, getPersonaPolicy, normalizePersona } from "./permissions";

export function normalizeWorkflowKey(value: unknown): WorkflowKey {
  return typeof value === "string" && workflowKeys.includes(value as WorkflowKey)
    ? (value as WorkflowKey)
    : "risks";
}

const sourceActivityTokens: Record<string, string[]> = {
  sap: ["SAP"],
  dhl: ["DHL"],
  fedex: ["FedEx"],
  warehouse: ["EWM"],
  quality: ["Quality"],
  excel: ["SharePoint"],
  capacity: ["capacity"],
  contracts: ["Contract"],
  resilience: ["Resilience"],
  policy: ["Policy"],
};

export function buildAppContext(
  value: unknown,
  personaValue?: unknown,
  selectedSourceValue?: unknown,
) {
  const key = normalizeWorkflowKey(value);
  const persona = normalizePersona(personaValue);
  const policy = getPersonaPolicy(persona);
  const requestedWorkflow = workflows[key];
  const allowed = canAccessWorkflow(persona, key);
  const workflow = allowed ? requestedWorkflow : workflows.risks;
  const requestedSourceIds = Array.isArray(selectedSourceValue)
    ? selectedSourceValue.filter((item): item is string => typeof item === "string")
    : workflow.sources.filter((source) => source.selected).map((source) => source.id);
  const selectedSourceIds = new Set(
    requestedSourceIds.filter((id) => workflow.sources.some((source) => source.id === id)),
  );
  const selectedSources = workflow.sources.filter((source) => selectedSourceIds.has(source.id));
  const activityTokens = selectedSources.flatMap((source) => sourceActivityTokens[source.id] ?? []);

  return {
    persona: {
      id: persona,
      canViewFinancials: policy.canViewFinancials,
      allowedWorkflows: policy.allowedWorkflows,
    },
    workflow: {
      key: allowed ? key : "risks",
      question: workflow.question,
      accessAllowed: allowed,
    },
    answer: {
      headline: workflow.headline,
      summary: workflow.summary,
      metrics: workflow.metrics,
      ...(policy.canViewFinancials ? { financialMetrics: workflow.financialMetrics } : {}),
    },
    sources: selectedSources,
    activity: workflow.activity.filter((step) =>
      activityTokens.some((token) => step.tool.includes(token)),
    ),
    recommendedActions: workflow.actions,
    rows: workflow.rows.map(({ financial, ...row }) =>
      policy.canViewFinancials ? { ...row, financial } : row,
    ),
  };
}

export type AppContext = ReturnType<typeof buildAppContext>;
