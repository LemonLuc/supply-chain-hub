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
  assigneePersona: PersonaId | null;
  assigneeName: string | null;
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

export function getActionReviewer(action: WorkflowAction): PersonaId | null {
  return action.reviewerPersona ?? null;
}

export function getActionAssignee(action: WorkflowAction): PersonaId | null {
  return action.assigneePersona ?? null;
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
  reviewerPersona: PersonaId | null = getActionReviewer(action),
  assigneePersona: PersonaId | null = getActionAssignee(action),
): string {
  const requester = mockUsers[persona];
  const reviewer = reviewerPersona ? mockUsers[reviewerPersona] : null;
  const assignee = assigneePersona ? mockUsers[assigneePersona] : null;
  const evidence = context.rows.length
    ? context.rows.map((row) => `${row.subject}: ${row.evidence}`).join(" ")
    : context.answer.summary;

  return [
    `${action.label}`,
    reviewer
      ? `From ${requester.name} to ${reviewer.name}.`
      : assignee
        ? `From ${requester.name} to ${assignee.name}.`
        : `Prepared for ${requester.name}.`,
    `${context.answer.headline}: ${context.answer.summary}`,
    `Evidence: ${evidence}`,
    `Requested action: ${action.detail}`,
    `Workflow: ${workflowKey}`,
  ].join("\n\n");
}

export function buildActionNotice(
  persona: PersonaId,
  action: WorkflowAction,
  reviewerPersona: PersonaId | null,
  assigneePersona: PersonaId | null = getActionAssignee(action),
): string {
  if (reviewerPersona) return `Approval request sent to ${mockUsers[reviewerPersona].name}.`;
  if (assigneePersona) {
    return `Task assigned to ${mockUsers[assigneePersona].name}. ${action.detail}`;
  }

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
  const reviewerPersona = getActionReviewer(action);
  const assigneePersona = getActionAssignee(action);
  const requester = mockUsers[persona];
  const reviewer = reviewerPersona ? mockUsers[reviewerPersona] : null;
  const assignee = assigneePersona ? mockUsers[assigneePersona] : null;

  return {
    actionLabel: action.label,
    workflowKey,
    requesterPersona: persona,
    requesterName: requester.name,
    assigneePersona,
    assigneeName: assignee?.name ?? null,
    reviewerPersona,
    reviewerName: reviewer?.name ?? null,
    draft: buildActionDraft(
      context,
      workflowKey,
      persona,
      action,
      reviewerPersona,
      assigneePersona,
    ),
    notice: buildActionNotice(persona, action, reviewerPersona, assigneePersona),
    agentName,
    orchestration,
    toolCalls,
    handoff: reviewerPersona ? { from: persona, to: reviewerPersona } : null,
    ...(traceId ? { traceId } : {}),
  };
}
