import { mockUsers } from "./auth";
import type { AppContext } from "./context";
import type { WorkflowAction, WorkflowKey } from "./demo-data";
import type { PersonaId } from "./permissions";

export type ActionOrchestrationMode = "agents-sdk" | "demo-fallback";

export type ActionWorkflowResult = {
  actionLabel: string;
  workflowKey: WorkflowKey;
  requesterPersona: PersonaId;
  requesterName: string;
  reviewerPersona: PersonaId | null;
  reviewerName: string | null;
  draft: string;
  notice: string;
  agentName: string;
  orchestration: ActionOrchestrationMode;
  toolCalls: string[];
  handoff: { from: string; to: string } | null;
  traceId?: string;
};

type BuildActionWorkflowResultOptions = {
  context: AppContext;
  workflowKey: WorkflowKey;
  persona: PersonaId;
  action: WorkflowAction;
  orchestration: ActionOrchestrationMode;
  agentName?: string;
  toolCalls?: string[];
  traceId?: string;
};

export function getActionReviewer(persona: PersonaId, action: WorkflowAction): PersonaId | null {
  if (action.kind !== "approval") return null;
  if (persona === "logistics") return "procurement";
  if (persona === "procurement") return "executive";
  return null;
}

export function findActionByLabel(context: AppContext, actionLabel: unknown): WorkflowAction | undefined {
  return typeof actionLabel === "string"
    ? context.recommendedActions.find((action) => action.label === actionLabel)
    : undefined;
}

export function buildActionDraft(
  context: AppContext,
  workflowKey: WorkflowKey,
  persona: PersonaId,
  action: WorkflowAction,
  reviewerPersona: PersonaId | null = getActionReviewer(persona, action),
): string {
  const requester = mockUsers[persona];
  const reviewer = reviewerPersona ? mockUsers[reviewerPersona] : null;
  const evidence = context.rows.length
    ? context.rows.map((row) => `${row.subject}: ${row.evidence}`).join(" ")
    : context.answer.summary;

  return [
    `${action.label}`,
    reviewer ? `From ${requester.name} to ${reviewer.name}.` : `Prepared for ${requester.name}.`,
    `${context.answer.headline}: ${context.answer.summary}`,
    `Evidence: ${evidence}`,
    `Requested action: ${action.detail}`,
    `Workflow: ${workflowKey}`,
  ].join("\n\n");
}

export function buildActionNotice(persona: PersonaId, action: WorkflowAction, reviewerPersona: PersonaId | null): string {
  if (reviewerPersona) return `Approval request sent to ${mockUsers[reviewerPersona].name}.`;

  const requester = mockUsers[persona];
  const actionLabel =
    action.kind === "draft"
      ? "Draft prepared"
      : action.kind === "share"
        ? "Mandate prepared"
        : "Action staged";

  return `${actionLabel} for ${requester.name}. ${action.detail}`;
}

export function buildActionWorkflowResult({
  context,
  workflowKey,
  persona,
  action,
  orchestration,
  agentName = "Supply Chain Action Orchestrator",
  toolCalls = [],
  traceId,
}: BuildActionWorkflowResultOptions): ActionWorkflowResult {
  const reviewerPersona = getActionReviewer(persona, action);
  const requester = mockUsers[persona];
  const reviewer = reviewerPersona ? mockUsers[reviewerPersona] : null;

  return {
    actionLabel: action.label,
    workflowKey,
    requesterPersona: persona,
    requesterName: requester.name,
    reviewerPersona,
    reviewerName: reviewer?.name ?? null,
    draft: buildActionDraft(context, workflowKey, persona, action, reviewerPersona),
    notice: buildActionNotice(persona, action, reviewerPersona),
    agentName,
    orchestration,
    toolCalls,
    handoff: reviewerPersona ? { from: persona, to: reviewerPersona } : null,
    ...(traceId ? { traceId } : {}),
  };
}
