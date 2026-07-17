import {
  buildActionWorkflowResult,
  findActionByLabel,
} from "@/lib/action-workflows";
import { runActionAgentsWorkflow } from "@/lib/action-agents";
import { getCurrentUser } from "@/lib/auth";
import { hasLiveApiKey, normalizeChatOptions } from "@/lib/chat";
import { buildAppContext, normalizeWorkflowKey } from "@/lib/context";
import { normalizePersona } from "@/lib/permissions";

export const runtime = "nodejs";

type ActionRequest = {
  workflowKey?: unknown;
  demoPersona?: unknown;
  selectedSourceIds?: unknown;
  actionLabel?: unknown;
  model?: unknown;
  thinking?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let body: ActionRequest;

  try {
    body = (await request.json()) as ActionRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const serverPersona = getCurrentUser().persona;
  const persona = normalizePersona(body.demoPersona ?? serverPersona);
  const workflowKey = normalizeWorkflowKey(body.workflowKey);
  const context = buildAppContext(workflowKey, persona, body.selectedSourceIds);
  const action = findActionByLabel(context, body.actionLabel);

  if (!action) {
    return Response.json(
      {
        error:
          "The requested action is not available for the selected persona, workflow, or connected tools.",
      },
      { status: 403 },
    );
  }

  if (!hasLiveApiKey()) {
    return Response.json(
      buildActionWorkflowResult({
        context,
        workflowKey: context.workflow.key,
        persona,
        action,
        orchestration: "demo-fallback",
      }),
    );
  }

  const options = normalizeChatOptions(body.model, body.thinking);
  try {
    const result = await runActionAgentsWorkflow({
      context,
      workflowKey: context.workflow.key,
      persona,
      action,
      model: options.model,
      thinking: options.thinking,
    });

    return Response.json(result);
  } catch {
    return Response.json(
      buildActionWorkflowResult({
        context,
        workflowKey: context.workflow.key,
        persona,
        action,
        orchestration: "demo-fallback",
      }),
    );
  }
}
