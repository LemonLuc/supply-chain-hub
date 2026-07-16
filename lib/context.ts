import { workflowKeys, workflows, type ResultRow, type WorkflowKey, type WorkflowSource } from "./demo-data";
import { canAccessWorkflow, getPersonaPolicy, normalizePersona } from "./permissions";

export function normalizeWorkflowKey(value: unknown): WorkflowKey {
  return typeof value === "string" && workflowKeys.includes(value as WorkflowKey)
    ? (value as WorkflowKey)
    : "risks";
}

export type RoleToolSource = WorkflowSource & {
  toolId: string;
  workflowKeys: WorkflowKey[];
  workflowLabels: string[];
};

export function buildRoleToolSources(personaValue?: unknown): RoleToolSource[] {
  const policy = getPersonaPolicy(personaValue);
  const sourcesById = new Map<string, RoleToolSource>();

  for (const workflowKey of policy.allowedWorkflows) {
    const workflow = workflows[workflowKey];

    for (const source of workflow.sources) {
      const existing = sourcesById.get(source.id);

      if (existing) {
        sourcesById.set(source.id, {
          ...existing,
          selected: existing.selected || source.selected,
          workflowKeys: [...existing.workflowKeys, workflowKey],
          workflowLabels: [...existing.workflowLabels, workflow.navLabel],
        });
        continue;
      }

      sourcesById.set(source.id, {
        ...source,
        toolId: source.id,
        workflowKeys: [workflowKey],
        workflowLabels: [workflow.navLabel],
      });
    }
  }

  return [...sourcesById.values()];
}

export function resolveWorkflowForPrompt(prompt: string, personaValue?: unknown): WorkflowKey {
  const policy = getPersonaPolicy(personaValue);
  const normalizedPrompt = prompt.toLowerCase();
  const exactSuggestedWorkflow = policy.allowedWorkflows.find((workflowKey) =>
    workflows[workflowKey].suggestedPrompts.some(
      (suggestedPrompt) => suggestedPrompt.toLowerCase() === normalizedPrompt,
    ),
  );
  if (exactSuggestedWorkflow) return exactSuggestedWorkflow;

  const candidates: Array<[WorkflowKey, string[]]> = [
    ["consolidate", ["heat map", "heatmap", "consolidate", "portfolio", "tail-spend", "resilience", "savings", "relationship", "relationships", "board", "contract termination"]],
    ["delay", ["alternative", "alternatives", "alternate", "turret", "supplier overview", "supplier risk", "capacity register", "delayed", "delay", "uncovered build", "uncovered builds", "recovery check"]],
    ["risks", ["risk", "delivery", "shipment", "carrier", "milestone", "freight", "fedex", "dhl", "ups", "pickup"]],
  ];
  const match = candidates.find(([workflowKey, keywords]) =>
    policy.allowedWorkflows.includes(workflowKey) && keywords.some((keyword) => normalizedPrompt.includes(keyword)),
  );

  return match?.[0] ?? policy.allowedWorkflows[0] ?? "risks";
}

const sourceActivityTokens: Record<string, string[]> = {
  sap: ["SAP"],
  carriers: ["Shipping"],
  warehouse: ["EWM"],
  quality: ["Quality"],
  excel: ["SharePoint"],
  capacity: ["capacity"],
  contracts: ["Contract"],
  resilience: ["Resilience"],
  policy: ["Policy"],
};

function sourceSetIncludesAll(selectedSourceIds: Set<string>, requiredSourceIds: string[] | undefined): boolean {
  return !requiredSourceIds?.length || requiredSourceIds.every((sourceId) => selectedSourceIds.has(sourceId));
}

function buildSelectedAnswer(
  workflow: (typeof workflows)[WorkflowKey],
  selectedRows: Array<Omit<(typeof workflow.rows)[number], "financial">>,
  allRowsAvailable: boolean,
  canViewFinancials: boolean,
) {
  if (allRowsAvailable) {
    return {
      headline: workflow.headline,
      summary: workflow.summary,
      metrics: workflow.metrics,
      ...(canViewFinancials ? { financialMetrics: workflow.financialMetrics } : {}),
    };
  }

  if (selectedRows.length === 0) {
    return {
      headline: "No records returned from selected sources",
      summary:
        "The selected authorized sources did not return enough evidence for this workflow. Re-enable the relevant source or request access to the missing connector.",
      metrics: [
        ["Selected records", "0"],
        ["Evidence status", "Incomplete"],
      ],
      ...(canViewFinancials ? { financialMetrics: undefined } : {}),
    };
  }

  return {
    headline: "Selected source records returned",
    summary: selectedRows
      .map((row) => `${row.subject}: ${row.status}. ${row.evidence}`)
      .join(" "),
    metrics: [
      ["Selected records", String(selectedRows.length)],
      ["Evidence status", "Filtered"],
    ],
    ...(canViewFinancials ? { financialMetrics: undefined } : {}),
  };
}

function focusesWorkbookPrompt(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const normalizedPrompt = value.toLowerCase();

  return (
    normalizedPrompt.includes("supplier risk") ||
    normalizedPrompt.includes("capacity register") ||
    normalizedPrompt.includes("workbook") ||
    normalizedPrompt.includes(".xlsx") ||
    normalizedPrompt.includes("recent changes")
  );
}

export function buildAppContext(
  value: unknown,
  personaValue?: unknown,
  selectedSourceValue?: unknown,
  promptValue?: unknown,
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
  const selectedRows = workflow.rows
    .filter((row) => sourceSetIncludesAll(selectedSourceIds, row.sourceIds))
    .map(({ financial, ...row }) => (policy.canViewFinancials ? { ...row, financial } : row));
  const allRowsAvailable = workflow.rows.every((row) => sourceSetIncludesAll(selectedSourceIds, row.sourceIds));
  const selectedActions = workflow.actions.filter(
    (action) =>
      (!action.allowedPersonas || action.allowedPersonas.includes(persona)) &&
      sourceSetIncludesAll(selectedSourceIds, action.sourceIds),
  );
  const selectedDocuments = workflow.documents?.filter((document) =>
    sourceSetIncludesAll(selectedSourceIds, document.sourceIds),
  );
  const [focusedDocument] = selectedDocuments ?? [];
  const focusWorkbook = Boolean(focusedDocument && focusesWorkbookPrompt(promptValue));
  const focusedAnswer = focusWorkbook
    ? {
        headline: "Supplier risk register changes found",
        summary: `${focusedDocument.name} is available from ${focusedDocument.location} at ${focusedDocument.version}. ${focusedDocument.summary}`,
        metrics: [
          ["Workbook version", focusedDocument.version.replace(/^version\s+/i, "")],
          ["Recent changes", String(focusedDocument.recentChanges.length)],
          ["Owner", focusedDocument.owner],
        ],
      }
    : buildSelectedAnswer(workflow, selectedRows, allRowsAvailable, policy.canViewFinancials);
  const focusedRows: Array<Omit<ResultRow, "financial"> & { financial?: string }> = focusWorkbook
    ? focusedDocument.rows.map((row) => ({
        subject: row.key,
        detail: row.worksheet,
        status: row.status,
        evidence: `${row.evidence} Owner: ${row.owner}; next review: ${row.nextReview}.`,
        sourceIds: focusedDocument.sourceIds,
      }))
    : selectedRows;

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
    answer: focusedAnswer,
    sources: selectedSources,
    selectedAuthorizedSources: selectedSources,
    activity: workflow.activity.filter((step) =>
      step.sourceIds
        ? sourceSetIncludesAll(selectedSourceIds, step.sourceIds)
        : activityTokens.some((token) => step.tool.includes(token)),
    ),
    analysisTrace: workflow.analysisTrace,
    ...(workflow.heatMap ? { decisionSupport: { heatMap: workflow.heatMap } } : {}),
    ...(workflow.approval ? { approval: workflow.approval } : {}),
    recommendedActions: selectedActions,
    rows: focusedRows,
    ...(selectedDocuments?.length ? { documents: selectedDocuments } : {}),
  };
}

export type AppContext = ReturnType<typeof buildAppContext>;
