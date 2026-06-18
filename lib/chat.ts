import type { AppContext } from "./context";

export const supportedModels = [
  { id: "gpt-5.5", label: "GPT-5.5" },
  { id: "gpt-5.4", label: "GPT-5.4" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini" },
  { id: "gpt-5.4-nano", label: "GPT-5.4 nano" },
] as const;

export const thinkingLevels = [
  { id: "none", label: "None" },
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "xhigh", label: "Extra high" },
] as const;

export type SupportedModel = (typeof supportedModels)[number]["id"];
export type ThinkingLevel = (typeof thinkingLevels)[number]["id"];

export function normalizeChatOptions(model: unknown, thinking: unknown): {
  model: SupportedModel;
  thinking: ThinkingLevel;
} {
  const supportedModel = supportedModels.find((option) => option.id === model)?.id;
  const supportedThinking = thinkingLevels.find((option) => option.id === thinking)?.id;

  return {
    model: supportedModel ?? "gpt-5.4-mini",
    thinking: supportedThinking ?? "medium",
  };
}

export function buildSystemPrompt(context: AppContext): string {
  return `You are the Supply Chain Hub copilot. Answer using the live application snapshot below.

Priorities:
- Be concise, operational, and explicit about evidence from the snapshot.
- Distinguish observed facts from recommendations.
- Never invent suppliers, metrics, policies, or external data.
- When evidence is missing, say what additional source or tool is needed.
- Treat recommended actions as proposals that require human approval.

Application snapshot:
${JSON.stringify(context, null, 2)}`;
}

export function generateMockReply(question: string, context: AppContext): string {
  const [firstAction, secondAction] = context.recommendedActions;
  const focus = context.highlightedSuppliers.join(", ");

  return `Based on the current ${context.workflow.key} view, ${context.answer.headline}

Start here: ${firstAction}${secondAction ? ` Then ${secondAction.charAt(0).toLowerCase()}${secondAction.slice(1)}` : ""}

The supporting signals center on ${focus}. Your question was: "${question.trim()}"

This response is running in demo mode with sample application data. Add a real OPENAI_API_KEY to enable model-generated analysis.`;
}

export function hasLiveApiKey(value = process.env.OPENAI_API_KEY): boolean {
  return Boolean(value && !value.startsWith("sk-sample") && value !== "replace-me");
}
