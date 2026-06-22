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
    thinking: supportedThinking ?? "high",
  };
}

export function buildSystemPrompt(context: AppContext): string {
  return `You are Supply Chain Hub. Answer using the live application snapshot below.

Priorities:
- Be concise, operational, and explicit about evidence from the snapshot.
- Distinguish observed facts from recommendations.
- Describe tool activity as an audit trace. Never reveal private chain-of-thought.
- Never invent suppliers, metrics, policies, or external data.
- When evidence is missing, say what additional source or tool is needed.
- Respect workflow access, financial visibility, and approval gates in the snapshot.
- Any source listed in \`sources\` or \`selectedAuthorizedSources\` is already authorized and available for this request.
- Do not say you lack access to SAP, SharePoint, Excel, or any selected source. If selected evidence is present, answer from it.
- If \`documents\` contains workbook data, use that workbook data directly for recent changes, rows, owners, versions, and locations.

Application snapshot:
${JSON.stringify(context, null, 2)}`;
}

export function asksForWorkbookReview(question: string): boolean {
  const normalizedQuestion = question.toLowerCase();

  return (
    normalizedQuestion.includes("supplier risk") ||
    normalizedQuestion.includes("capacity register") ||
    normalizedQuestion.includes("workbook") ||
    normalizedQuestion.includes(".xlsx") ||
    normalizedQuestion.includes("recent changes")
  );
}

export function generateMockReply(question: string, context: AppContext): string {
  const [firstAction, secondAction] = context.recommendedActions;
  const normalizedQuestion = question.toLowerCase();
  const firstDocument = context.documents?.[0];
  if (asksForWorkbookReview(question)) {
    if (!firstDocument) {
      return `I cannot review Supplier Risk & Capacity Register.xlsx because the SharePoint MCP is not selected as an authorized source for this request.

Enable the SharePoint workbook source in chat settings and rerun the review prompt to include workbook contents and recent changes.

This response is running in demo mode with sample application data. Add a real OPENAI_API_KEY to enable model-generated analysis.`;
    }

    return `${firstDocument.name} review

The workbook is available from ${firstDocument.location} at ${firstDocument.version}, last modified ${firstDocument.lastModified} by ${firstDocument.owner}.

Recent changes:
${firstDocument.recentChanges.map((change) => `- ${change.timestamp} · ${change.worksheet} ${change.range}: ${change.change} Impact: ${change.impact}`).join("\n")}

Current register rows:
${firstDocument.rows.map((row) => `- ${row.key}: ${row.status}. ${row.evidence} Owner: ${row.owner}; next review: ${row.nextReview}.`).join("\n")}

Suggested next action: ${firstAction.label}.${secondAction ? ` I can also ${secondAction.label.toLowerCase()}.` : ""}

This response is running in demo mode with sample application data. Add a real OPENAI_API_KEY to enable model-generated analysis.`;
  }
  const asksForMoney = ["impact", "cost", "€", "revenue", "savings"].some((term) =>
    normalizedQuestion.includes(term),
  );
  const financialNote =
    asksForMoney && !context.persona.canViewFinancials
      ? "\nFinancial and quantified business-risk data is not available to your signed-in role."
      : asksForMoney && context.answer.financialMetrics?.length
        ? `\nAuthorized financial view: ${context.answer.financialMetrics
            .map(([label, value]) => `${label}: ${value}`)
            .join("; ")}.`
      : "";

  return `${context.answer.headline}

${context.answer.summary}${financialNote}

I checked ${context.activity.map((step) => step.tool).join(", ")}. The detailed tool activity and source records are available in the audit panel.

Suggested next action: ${firstAction.label}.${secondAction ? ` I can also ${secondAction.label.toLowerCase()}.` : ""}

This response is running in demo mode with sample application data. Add a real OPENAI_API_KEY to enable model-generated analysis.`;
}

export function hasLiveApiKey(value = process.env.OPENAI_API_KEY): boolean {
  return Boolean(value && !value.startsWith("sk-sample") && value !== "replace-me");
}
