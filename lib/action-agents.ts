import { Agent, getGlobalTraceProvider, handoff, run, tool } from "@openai/agents";

import {
  buildActionWorkflowResult,
  type ActionWorkflowResult,
} from "./action-workflows";
import type { AppContext } from "./context";
import type { WorkflowAction, WorkflowKey } from "./demo-data";
import type { PersonaId } from "./permissions";

type RunActionAgentsOptions = {
  context: AppContext;
  workflowKey: WorkflowKey;
  persona: PersonaId;
  action: WorkflowAction;
  model: string;
};

const emptyToolParameters = {
  type: "object" as const,
  properties: {},
  required: [] as string[],
  additionalProperties: false as const,
};

function buildAgentInstructions(persona: PersonaId, context: AppContext, action: WorkflowAction) {
  return [
    "You orchestrate Supply Chain Hub action workflows.",
    "Use the provided tools before answering.",
    "Do not override role permissions, approval gates, selected sources, or deterministic application state.",
    "If a reviewer persona is present, hand off to the reviewer agent for the decision workflow.",
    "Return concise action-ready text only.",
    `Current persona: ${persona}.`,
    `Workflow: ${context.workflow.key}.`,
    `Requested action: ${action.label}.`,
  ].join("\n");
}

function buildReviewerAgent(name: string, instructions: string, model: string) {
  return new Agent({
    name,
    handoffDescription: instructions,
    instructions,
    model,
    modelSettings: {},
    tools: [],
    handoffs: [],
  });
}

export async function runActionAgentsWorkflow({
  context,
  workflowKey,
  persona,
  action,
  model,
}: RunActionAgentsOptions): Promise<ActionWorkflowResult> {
  const traceId = `trace_${crypto.randomUUID().replace(/-/g, "")}`;
  const baseResult = buildActionWorkflowResult({
    context,
    workflowKey,
    persona,
    action,
    orchestration: "agents-sdk",
    toolCalls: ["read_supply_chain_context", "prepare_action_workflow"],
    traceId,
  });
  const readContext = tool({
    name: "read_supply_chain_context",
    description: "Read the authorized Supply Chain Hub context for this action workflow.",
    parameters: emptyToolParameters,
    strict: true,
    execute: () => ({
      persona,
      workflowKey,
      action,
      reviewerPersona: baseResult.reviewerPersona,
      answer: context.answer,
      selectedAuthorizedSources: context.selectedAuthorizedSources,
      rows: context.rows,
      recommendedActions: context.recommendedActions,
    }),
  });
  const prepareAction = tool({
    name: "prepare_action_workflow",
    description: "Prepare the permitted action result, draft, and approval routing metadata.",
    parameters: emptyToolParameters,
    strict: true,
    execute: () => baseResult,
  });
  const procurementAgent = buildReviewerAgent(
    "Procurement Review Agent",
    "Review logistics escalation requests as Dana Narid, the procurement team lead.",
    model,
  );
  const executiveAgent = buildReviewerAgent(
    "Executive Decision Agent",
    "Review strategic escalation requests as Dr. Lucía López, the final C-level decision maker.",
    model,
  );
  const agentHandoffs = [
    handoff(procurementAgent, {
      toolNameOverride: "handoff_to_procurement_lead",
      toolDescriptionOverride: "Hand off logistics approval requests to Dana Narid.",
      isEnabled: baseResult.reviewerPersona === "procurement",
    }),
    handoff(executiveAgent, {
      toolNameOverride: "handoff_to_executive_decision_maker",
      toolDescriptionOverride: "Hand off procurement exception requests to Lucia Lopez.",
      isEnabled: baseResult.reviewerPersona === "executive",
    }),
  ];
  const orchestrator = new Agent({
    name: "Supply Chain Action Orchestrator",
    handoffDescription: "Coordinates Supply Chain Hub action workflows, tools, and approval handoffs.",
    instructions: buildAgentInstructions(persona, context, action),
    model,
    modelSettings: {},
    tools: [readContext, prepareAction],
    handoffs: agentHandoffs,
    toolUseBehavior: { stopAtToolNames: ["prepare_action_workflow"] },
  });

  try {
    await run(
      orchestrator,
      [
        `Run action workflow for ${baseResult.requesterName}.`,
        `Action: ${baseResult.actionLabel}.`,
        baseResult.reviewerPersona
          ? `Reviewer persona: ${baseResult.reviewerPersona}. Use the handoff before preparing the workflow.`
          : "No reviewer persona is required. Prepare the action workflow directly.",
      ].join("\n"),
      { maxTurns: 4 },
    );
  } finally {
    await getGlobalTraceProvider().forceFlush();
  }

  return baseResult;
}
