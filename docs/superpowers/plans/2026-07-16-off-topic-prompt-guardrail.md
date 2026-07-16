# Off-Topic Prompt Guardrail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Block prompts outside Supply Chain Hub's business scope before any chat workflow runs, while allowing relevant calculations and failing open when model-backed classification is unavailable.

**Architecture:** Add a focused prompt-scope module that performs deterministic checks, structured OpenAI classification, fail-open error handling, and blocked-history cleanup. Integrate it at the top of the existing Vercel AI SDK route and preserve the current UI stream, tool, workbook, and demo response paths.

**Tech Stack:** Next.js App Router, TypeScript, Vercel AI SDK 6, `@ai-sdk/openai`, Vitest

## Global Constraints

- Use `gpt-5.4-nano` for live prompt classification.
- Block only model classifications with category `off_topic` and confidence greater than or equal to `0.7`.
- Fail open on classifier execution or parsing errors and never log prompt content.
- Block obvious standalone arithmetic in demo mode without an API key.
- Return blocked prompts through the existing Vercel UI message stream protocol.
- Remove blocked prompt/refusal pairs before subsequent classification and main-model calls.
- Do not modify `app/globals.css` or other unrelated user changes.

---

### Task 1: Prompt scope classifier and history sanitizer

**Files:**
- Create: `lib/prompt-scope.test.ts`
- Create: `lib/prompt-scope.ts`

**Interfaces:**
- Produces: `OFF_TOPIC_RESPONSE: string`
- Produces: `getUIMessageText(message: UIMessage): string`
- Produces: `sanitizeGuardrailHistory(messages: UIMessage[]): UIMessage[]`
- Produces: `checkPromptScope(options: { question: string; messages: UIMessage[]; apiKey?: string }): Promise<PromptScopeDecision>`
- Produces: `PromptScopeDecision` with `blocked`, `confidence`, `category`, and `source`

- [ ] **Step 1: Write failing unit tests for deterministic blocking, live classification, fail-open behavior, and history cleanup**

Create `lib/prompt-scope.test.ts`:

```typescript
import type { UIMessage } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";

const { generateTextMock } = vi.hoisted(() => ({
  generateTextMock: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: () => ({
    responses: (model: string) => ({ model }),
  }),
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return { ...actual, generateText: generateTextMock };
});

import {
  OFF_TOPIC_RESPONSE,
  checkPromptScope,
  sanitizeGuardrailHistory,
} from "./prompt-scope";

function message(id: string, role: UIMessage["role"], text: string): UIMessage {
  return { id, role, parts: [{ type: "text", text }] };
}

afterEach(() => {
  generateTextMock.mockReset();
  vi.restoreAllMocks();
});

describe("prompt scope guardrail", () => {
  it.each(["calculate 2x2", "calcualte 2 x 2", "What is 2 * 2?"])(
    "blocks standalone arithmetic in demo mode: %s",
    async (question) => {
      const result = await checkPromptScope({
        question,
        messages: [message("user-1", "user", question)],
        apiKey: "sk-sample-replace-me",
      });

      expect(result.blocked).toBe(true);
      expect(result.source).toBe("deterministic");
      expect(generateTextMock).not.toHaveBeenCalled();
    },
  );

  it("allows arithmetic that materially supports supply-chain work", async () => {
    const question = "Calculate safety stock for 20 units per day across a 4 day lead time.";
    const result = await checkPromptScope({
      question,
      messages: [message("user-1", "user", question)],
      apiKey: "sk-sample-replace-me",
    });

    expect(result.blocked).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("allows application help and contextual follow-ups in demo mode", async () => {
    for (const question of ["What can this app do?", "What should I do first?", "What about 15%?"]) {
      const result = await checkPromptScope({
        question,
        messages: [message("user-1", "user", question)],
        apiKey: "sk-sample-replace-me",
      });
      expect(result.blocked).toBe(false);
    }
  });

  it("blocks a high-confidence live off-topic classification", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: { category: "off_topic", confidence: 0.96 },
    });

    const result = await checkPromptScope({
      question: "Who won the football match?",
      messages: [message("user-1", "user", "Who won the football match?")],
      apiKey: "sk-live-test-key",
    });

    expect(result).toMatchObject({
      blocked: true,
      confidence: 0.96,
      category: "off_topic",
      source: "model",
    });
  });

  it("allows a low-confidence live off-topic classification", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: { category: "off_topic", confidence: 0.51 },
    });

    const result = await checkPromptScope({
      question: "Can you help with a calculation?",
      messages: [message("user-1", "user", "Can you help with a calculation?")],
      apiKey: "sk-live-test-key",
    });

    expect(result.blocked).toBe(false);
  });

  it("fails open without logging conversation content", async () => {
    generateTextMock.mockRejectedValueOnce(new Error("classifier unavailable for secret prompt"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = await checkPromptScope({
      question: "secret prompt",
      messages: [message("user-1", "user", "secret prompt")],
      apiKey: "sk-live-test-key",
    });

    expect(result).toMatchObject({ blocked: false, source: "fail_open" });
    expect(JSON.stringify(warn.mock.calls)).not.toContain("secret prompt");
  });

  it("removes a blocked prompt and refusal from later history", () => {
    const current = message("user-2", "user", "Show current supplier risk.");
    const sanitized = sanitizeGuardrailHistory([
      message("user-1", "user", "calculate 2x2"),
      message("assistant-1", "assistant", OFF_TOPIC_RESPONSE),
      current,
    ]);

    expect(sanitized).toEqual([current]);
  });
});
```

- [ ] **Step 2: Run the unit test to verify RED**

Run: `npm test -- lib/prompt-scope.test.ts`

Expected: FAIL because `./prompt-scope` does not exist.

- [ ] **Step 3: Implement the prompt-scope module**

Create `lib/prompt-scope.ts`:

```typescript
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
  "supply chain", "supplier", "procurement", "sourcing", "inventory", "logistics",
  "shipment", "carrier", "freight", "purchase order", " po ", "forecast", "demand",
  "production", "capacity", "safety stock", "lead time", "quality", "warehouse",
  "material", "workbook", "register", "resilience", "consolidation",
];

const applicationOrConversationPattern =
  /^(?:hi|hello|hey|thanks|thank you|yes|no|why|show me more|what should i do first|what (?:else|about .+)|what can (?:this app|you) do|how do i use (?:this|the) app|help)[.!?]*$/i;

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
  return standaloneArithmeticPattern.test(question) || obviousOffTopicPatterns.some((pattern) => pattern.test(question));
}

function allowedDecision(category: PromptScopeCategory, source: PromptScopeDecision["source"], confidence = 1): PromptScopeDecision {
  return { blocked: false, category, confidence, source };
}

export function getUIMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<(typeof message.parts)[number], { type: "text" }> => part.type === "text")
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
    return { blocked: true, category: "off_topic", confidence: 1, source: "deterministic" };
  }

  if (!hasLiveApiKey(apiKey)) {
    const category = hasSupplyChainSignal(question)
      ? "supply_chain"
      : applicationOrConversationPattern.test(question)
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
```

- [ ] **Step 4: Run the unit test to verify GREEN**

Run: `npm test -- lib/prompt-scope.test.ts`

Expected: PASS with all prompt-scope tests green.

- [ ] **Step 5: Commit the classifier**

```bash
git add lib/prompt-scope.ts lib/prompt-scope.test.ts
git commit -m "Add off-topic prompt scope classifier"
```

### Task 2: Enforce the guardrail in the chat route

**Files:**
- Modify: `app/api/chat/route.ts:1-155`
- Modify: `app/api/chat/route.test.ts:1-410`

**Interfaces:**
- Consumes: `OFF_TOPIC_RESPONSE`, `checkPromptScope`, `getUIMessageText`, and `sanitizeGuardrailHistory` from `lib/prompt-scope.ts`
- Preserves: `POST(request: Request): Promise<Response>` and the Vercel UI message stream response contract

- [ ] **Step 1: Extend route mocks and write failing route tests**

Update the hoisted mocks in `app/api/chat/route.test.ts` to expose structured guardrail output and converted-message calls:

```typescript
const { convertToModelMessagesMock, generateTextMock, streamTextMock } = vi.hoisted(() => ({
  convertToModelMessagesMock: vi.fn(async (messages) => messages),
  generateTextMock: vi.fn(async () => ({
    output: { category: "supply_chain", confidence: 0.99 },
  })),
  streamTextMock: vi.fn((_options: unknown) => ({
    toUIMessageStreamResponse: vi.fn(() => new Response("live stream")),
  })),
}));
```

Return these mocks from the existing `ai` mock:

```typescript
return {
  ...actual,
  convertToModelMessages: convertToModelMessagesMock,
  generateText: generateTextMock,
  streamText: streamTextMock,
};
```

Reset them in `afterEach`:

```typescript
convertToModelMessagesMock.mockClear();
generateTextMock.mockReset();
generateTextMock.mockResolvedValue({
  output: { category: "supply_chain", confidence: 0.99 },
});
streamTextMock.mockClear();
```

Add these tests inside `describe("POST /api/chat", ...)`:

```typescript
it("blocks standalone arithmetic before any chat workflow runs", async () => {
  process.env.OPENAI_API_KEY = "sk-sample-replace-me";
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: [{ id: "message-1", role: "user", parts: [{ type: "text", text: "calcualte 2x2" }] }],
      workflowKey: "risks",
    }),
  });

  const response = await POST(request);
  const stream = await response.text();

  expect(response.status).toBe(200);
  expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
  expect(stream).toContain("I can only help with supply-chain operations and analysis");
  expect(generateTextMock).not.toHaveBeenCalled();
  expect(streamTextMock).not.toHaveBeenCalled();
});

it("blocks a live prompt classified as off-topic", async () => {
  process.env.OPENAI_API_KEY = "sk-live-test-key";
  generateTextMock.mockResolvedValueOnce({ output: { category: "off_topic", confidence: 0.97 } });
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: [{ id: "message-1", role: "user", parts: [{ type: "text", text: "Who won the football match?" }] }],
      workflowKey: "risks",
    }),
  });

  const response = await POST(request);
  const stream = await response.text();

  expect(stream).toContain("I can only help with supply-chain operations and analysis");
  expect(streamTextMock).not.toHaveBeenCalled();
});

it("fails open when live prompt classification fails", async () => {
  process.env.OPENAI_API_KEY = "sk-live-test-key";
  generateTextMock.mockRejectedValueOnce(new Error("classifier unavailable"));
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: [{ id: "message-1", role: "user", parts: [{ type: "text", text: "Show current supplier risk." }] }],
      workflowKey: "risks",
    }),
  });

  const response = await POST(request);

  expect(response.status).toBe(200);
  expect(streamTextMock).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenCalledOnce();
});

it("removes blocked turns before sending a later allowed prompt to the model", async () => {
  process.env.OPENAI_API_KEY = "sk-live-test-key";
  const refusal = "I can only help with supply-chain operations and analysis. Please connect your question to suppliers, procurement, inventory, logistics, shipments, demand planning, production, or this application.";
  const current = { id: "message-3", role: "user", parts: [{ type: "text", text: "Show current supplier risk." }] };
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: [
        { id: "message-1", role: "user", parts: [{ type: "text", text: "calculate 2x2" }] },
        { id: "message-2", role: "assistant", parts: [{ type: "text", text: refusal }] },
        current,
      ],
      workflowKey: "risks",
    }),
  });

  await POST(request);

  expect(convertToModelMessagesMock).toHaveBeenCalledWith([current]);
  expect(JSON.stringify(generateTextMock.mock.calls[0][0])).not.toContain("calculate 2x2");
});
```

- [ ] **Step 2: Run focused route tests to verify RED**

Run: `npm test -- app/api/chat/route.test.ts`

Expected: the new blocking and history tests FAIL because the route does not call the guardrail.

- [ ] **Step 3: Integrate the guardrail before context construction**

In `app/api/chat/route.ts`, import the guardrail module:

```typescript
import {
  OFF_TOPIC_RESPONSE,
  checkPromptScope,
  getUIMessageText,
  sanitizeGuardrailHistory,
} from "@/lib/prompt-scope";
```

Remove the route-local `getMessageText` function. Replace message extraction and insert the gate immediately after the required-message check:

```typescript
const messages = Array.isArray(body.messages) ? body.messages : [];
const sanitizedMessages = sanitizeGuardrailHistory(messages);
const lastUserMessage = [...sanitizedMessages].reverse().find((message) => message.role === "user");
const question = lastUserMessage ? getUIMessageText(lastUserMessage) : "";

if (!question) {
  return Response.json({ error: "A user message is required." }, { status: 400 });
}

const scopeDecision = await checkPromptScope({
  question,
  messages: sanitizedMessages,
  apiKey: process.env.OPENAI_API_KEY,
});

if (scopeDecision.blocked) {
  return createMockResponse(OFF_TOPIC_RESPONSE);
}
```

Use sanitized history for the main model:

```typescript
messages: await convertToModelMessages(sanitizedMessages),
```

- [ ] **Step 4: Run route and classifier tests to verify GREEN**

Run: `npm test -- lib/prompt-scope.test.ts app/api/chat/route.test.ts`

Expected: PASS with all prompt-scope and chat-route tests green.

- [ ] **Step 5: Commit route enforcement**

```bash
git add app/api/chat/route.ts app/api/chat/route.test.ts
git commit -m "Enforce off-topic guardrail in chat"
```

### Task 3: Full verification

**Files:**
- Verify only; no planned source changes

**Interfaces:**
- Verifies all interfaces produced by Tasks 1 and 2

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all Vitest tests pass with zero failures.

- [ ] **Step 2: Run strict TypeScript validation**

Run: `npm run typecheck`

Expected: `tsc --noEmit` exits successfully with no diagnostics.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 4: Check the final diff for scope and whitespace errors**

Run: `git diff --check HEAD^..HEAD && git status --short`

Expected: no whitespace errors; only the known user-owned `app/globals.css` modification remains outside the feature commits in the original checkout.
