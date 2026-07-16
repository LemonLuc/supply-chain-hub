import { createOpenAI } from "@ai-sdk/openai";
import {
  generateText,
  jsonSchema,
  Output,
  type UIMessage,
} from "ai";

export const OFF_TOPIC_RESPONSE =
  "I can only help with supply-chain operations and analysis. Please connect your question to suppliers, procurement, inventory, logistics, shipments, demand planning, production, or this application.";

const GUARDRAIL_MODEL = "gpt-5.4-nano";
const CONFIDENCE_THRESHOLD = 0.7;
const MAX_CONTEXT_MESSAGES = 10;

const categories = ["supply_chain", "app_help", "conversation", "off_topic"] as const;
type PromptScopeCategory = (typeof categories)[number];

type PromptScopeModelOutput = {
  category: PromptScopeCategory;
  confidence: number;
};

export type PromptScopeDecision = PromptScopeModelOutput & {
  blocked: boolean;
  source: "deterministic" | "model" | "fail_open";
};

const outputSchema = jsonSchema<PromptScopeModelOutput>({
  type: "object",
  additionalProperties: false,
  properties: {
    category: { type: "string", enum: [...categories] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["category", "confidence"],
});

const scopePolicy = `Classify the latest user request for Supply Chain Hub.

Allowed categories:
- supply_chain: procurement, sourcing, suppliers, supplier risk, capacity, quality, inventory, logistics, shipments, purchase orders, demand forecasting, production planning, and calculations materially supporting those topics.
- app_help: questions about using Supply Chain Hub.
- conversation: greetings, clarifications, and contextual follow-ups supporting an allowed conversation.

Use off_topic for general mathematics, trivia, unrelated writing, unrelated programming, or any request without a material connection to the application. A bare request such as "calculate 2x2" is off-topic. Incidental supply-chain wording must not make an unrelated task allowed.`;

const supplyChainTerms = [
  "supply chain",
  "supplier",
  "procurement",
  "sourcing",
  "inventory",
  "logistics",
  "shipment",
  "carrier",
  "freight",
  "purchase order",
  " po ",
  "forecast",
  "demand",
  "production",
  "capacity",
  "safety stock",
  "lead time",
  "quality",
  "warehouse",
  "material",
  "workbook",
  "register",
  "resilience",
  "consolidation",
];

const applicationHelpPattern =
  /^(?:what can (?:this app|you) do|how do i use (?:this|the) app|help)[.!?]*$/i;
const conversationPattern =
  /^(?:hi|hello|hey|thanks|thank you|yes|no|why|show me more|what should i do first|what (?:else|about .+))[.!?]*$/i;
const standaloneArithmeticPattern =
  /^\s*(?:(?:calculate|calcualte|compute|solve|what(?:'s| is))\s+)?-?\d+(?:\.\d+)?\s*(?:x|×|\*|\/|\+|-)\s*-?\d+(?:\.\d+)?\s*\??\s*$/i;

const obviousOffTopicPatterns = [
  /^(?:write|compose) (?:me )?(?:a )?(?:poem|story|song|essay)\b/i,
  /^(?:tell me )?(?:a )?joke\b/i,
  /^(?:what is|what's) the capital of\b/i,
  /^(?:write|debug|explain) (?:some )?(?:code|javascript|typescript|python)\b/i,
];

function hasLiveApiKey(value: string | undefined): value is string {
  return Boolean(value && !value.startsWith("sk-sample") && value !== "replace-me");
}

function hasSupplyChainSignal(question: string): boolean {
  const normalized = ` ${question.toLowerCase()} `;
  return supplyChainTerms.some((term) => normalized.includes(term));
}

function isObviouslyOffTopic(question: string): boolean {
  if (hasSupplyChainSignal(question)) return false;
  return (
    standaloneArithmeticPattern.test(question) ||
    obviousOffTopicPatterns.some((pattern) => pattern.test(question))
  );
}

function allowedDecision(
  category: PromptScopeCategory,
  source: PromptScopeDecision["source"],
  confidence = 1,
): PromptScopeDecision {
  return { blocked: false, category, confidence, source };
}

export function getUIMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: "text" }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function sanitizeGuardrailHistory(messages: UIMessage[]): UIMessage[] {
  const sanitized: UIMessage[] = [];

  for (const message of messages) {
    if (message.role === "assistant" && getUIMessageText(message) === OFF_TOPIC_RESPONSE) {
      if (sanitized.at(-1)?.role === "user") sanitized.pop();
      continue;
    }
    sanitized.push(message);
  }

  return sanitized;
}

export async function checkPromptScope({
  question,
  messages,
  apiKey,
}: {
  question: string;
  messages: UIMessage[];
  apiKey?: string;
}): Promise<PromptScopeDecision> {
  if (isObviouslyOffTopic(question)) {
    return {
      blocked: true,
      category: "off_topic",
      confidence: 1,
      source: "deterministic",
    };
  }

  if (!hasLiveApiKey(apiKey)) {
    const category = hasSupplyChainSignal(question)
      ? "supply_chain"
      : applicationHelpPattern.test(question)
        ? "app_help"
        : conversationPattern.test(question)
          ? "conversation"
          : "conversation";
    return allowedDecision(category, "deterministic");
  }

  try {
    const openai = createOpenAI({ apiKey });
    const conversation = messages
      .slice(-MAX_CONTEXT_MESSAGES)
      .map((message) => ({ role: message.role, content: getUIMessageText(message) }))
      .filter((message) => message.content);
    const result = await generateText({
      model: openai.responses(GUARDRAIL_MODEL),
      system: scopePolicy,
      prompt: JSON.stringify(conversation),
      output: Output.object({
        schema: outputSchema,
        name: "prompt_scope_decision",
        description: "Whether the latest request is within Supply Chain Hub's scope.",
      }),
      maxRetries: 0,
    });
    const { category, confidence } = result.output;
    return {
      blocked: category === "off_topic" && confidence >= CONFIDENCE_THRESHOLD,
      category,
      confidence,
      source: "model",
    };
  } catch (error) {
    console.warn("Off-topic prompt guardrail failed; continuing because fail-open is enabled.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return allowedDecision("conversation", "fail_open", 0);
  }
}
