import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";

import { buildSystemPrompt, generateMockReply, hasLiveApiKey, normalizeChatOptions } from "@/lib/chat";
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
  const demoPersona = hasLiveApiKey() ? serverPersona : normalizePersona(body.demoPersona ?? serverPersona);
  const context = buildAppContext(body.workflowKey, demoPersona, body.selectedSourceIds);
  const options = normalizeChatOptions(body.model, body.thinking);

  if (!hasLiveApiKey()) {
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
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
