import type { AppContext } from "./context";

export const supportedModels = [
  { id: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
  { id: "gpt-5.6-luna", label: "GPT-5.6 Luna" },
] as const;

export const thinkingLevels = [
  { id: "none", label: "None" },
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "xhigh", label: "Extra high" },
  { id: "max", label: "Max" },
] as const;

export type SupportedModel = (typeof supportedModels)[number]["id"];
export type ThinkingLevel = (typeof thinkingLevels)[number]["id"];

export const defaultModel: SupportedModel = "gpt-5.6-sol";
export const defaultThinkingLevel: ThinkingLevel = "high";

export function normalizeChatOptions(model: unknown, thinking: unknown): {
  model: SupportedModel;
  thinking: ThinkingLevel;
} {
  const supportedModel = supportedModels.find((option) => option.id === model)?.id;
  const supportedThinking = thinkingLevels.find((option) => option.id === thinking)?.id;

  return {
    model: supportedModel ?? defaultModel,
    thinking: supportedThinking ?? defaultThinkingLevel,
  };
}

export function buildSystemPrompt(context: AppContext): string {
  const portfolioInstructions = context.decisionSupport?.heatMap?.length
    ? `
- Call renderSupplierPortfolio exactly once for this supplier-portfolio answer.
- Choose bubble only when the normalized numeric measures materially improve the comparison; otherwise choose matrix.
- The tool supplies trusted supplier data. Do not repeat or invent supplier values in tool input.`
    : "";

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
- If \`documents\` contains workbook data, use that workbook data directly for recent changes, rows, owners, versions, and locations.${portfolioInstructions}

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
  const actionLine = firstAction
    ? `Suggested next action: ${firstAction.label}.${secondAction ? ` I can also ${secondAction.label.toLowerCase()}.` : ""}`
    : "No follow-up action is available with the currently selected tools.";
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

${actionLine}

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

I checked ${context.activity.map((step) => step.tool).join(", ")}. The detailed tool activity and findings are available below.

${actionLine}

This response is running in demo mode with sample application data. Add a real OPENAI_API_KEY to enable model-generated analysis.`;
}

export function hasLiveApiKey(value = process.env.OPENAI_API_KEY): boolean {
  return Boolean(value && !value.startsWith("sk-sample") && value !== "replace-me");
}
