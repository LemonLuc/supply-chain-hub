import { createOpenAI } from "@ai-sdk/openai";
import {
  APICallError,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";

import { asksForWorkbookReview, buildSystemPrompt, generateMockReply, hasLiveApiKey, normalizeChatOptions } from "@/lib/chat";
import { getChatTools, loadExternalContext } from "@/lib/chat-extensions";
import { buildAppContext } from "@/lib/context";
import { getCurrentUser } from "@/lib/auth";
import { normalizePersona } from "@/lib/permissions";

export const runtime = "nodejs";

type ChatRequest = {
  messages?: UIMessage[];
  workflowKey?: unknown;
  model?: unknown;
  thinking?: unknown;
  demoPersona?: unknown;
  selectedSourceIds?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cleanErrorText(value: unknown): string {
  const text = typeof value === "string" ? value : value == null ? "unknown error" : JSON.stringify(value) ?? String(value);
  return text.replace(/sk-[A-Za-z0-9_-]+/g, "sk-...redacted").replace(/\s+/g, " ").trim().slice(0, 900);
}

function parseResponseBody(body: string | undefined): unknown {
  if (!body) return undefined;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function extractApiErrorDetails(value: unknown): string | undefined {
  const payload = isRecord(value) && isRecord(value.error) ? value.error : value;
  if (!isRecord(payload)) return typeof payload === "string" ? cleanErrorText(payload) : undefined;

  const parts = [
    payload.message ? cleanErrorText(payload.message) : undefined,
    payload.code ? `code: ${cleanErrorText(payload.code)}` : undefined,
    payload.type ? `type: ${cleanErrorText(payload.type)}` : undefined,
    payload.param ? `param: ${cleanErrorText(payload.param)}` : undefined,
  ].filter(Boolean);

  return parts.length ? parts.join("; ") : undefined;
}

function formatChatStreamError(error: unknown): string {
  if (APICallError.isInstance(error)) {
    const details =
      extractApiErrorDetails(error.data) ??
      extractApiErrorDetails(parseResponseBody(error.responseBody)) ??
      cleanErrorText(error.message);
    const status = error.statusCode ? ` status ${error.statusCode}` : "";
    const requestId = error.responseHeaders?.["x-request-id"]
      ? ` request id: ${cleanErrorText(error.responseHeaders["x-request-id"])}`
      : "";
    const retryable = error.isRetryable ? " retryable: yes" : " retryable: no";

    return `OpenAI API request failed${status}: ${details}.${requestId}.${retryable}.`;
  }

  return error instanceof Error ? cleanErrorText(error.message) : cleanErrorText(error);
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<(typeof message.parts)[number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function createMockResponse(reply: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = crypto.randomUUID();
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: reply });
      writer.write({ type: "text-end", id });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: Request): Promise<Response> {
  let body: ChatRequest;

  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const question = lastUserMessage ? getMessageText(lastUserMessage) : "";

  if (!question) {
    return Response.json({ error: "A user message is required." }, { status: 400 });
  }

  const serverPersona = getCurrentUser().persona;
  const hasConfiguredServerPersona =
    process.env.DEMO_USER_ROLE === "executive" ||
    process.env.DEMO_USER_ROLE === "procurement" ||
    process.env.DEMO_USER_ROLE === "logistics";
  const demoPersona = hasConfiguredServerPersona ? serverPersona : normalizePersona(body.demoPersona ?? serverPersona);
  const context = buildAppContext(body.workflowKey, demoPersona, body.selectedSourceIds);
  const options = normalizeChatOptions(body.model, body.thinking);

  if (asksForWorkbookReview(question) || !hasLiveApiKey()) {
    return createMockResponse(generateMockReply(question, context));
  }

  const externalContext = await loadExternalContext(question, context);
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = streamText({
    model: openai.responses(options.model),
    system: [
      buildSystemPrompt(context),
      externalContext.length ? `External context:\n${externalContext.join("\n\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    messages: await convertToModelMessages(messages),
    tools: getChatTools(),
    providerOptions: {
      openai: {
        reasoningEffort: options.thinking,
        reasoningSummary: "detailed",
      },
    },
  });

  return result.toUIMessageStreamResponse({ onError: formatChatStreamError });
}
