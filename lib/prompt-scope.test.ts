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

  it("allows contextual arithmetic in demo mode", async () => {
    const question = "What is 2 * 2?";
    const result = await checkPromptScope({
      question,
      messages: [
        message("user-1", "user", "Help me compare supplier capacity."),
        message("assistant-1", "assistant", "Which supplier scenarios should I compare?"),
        message("user-2", "user", question),
      ],
      apiKey: "sk-sample-replace-me",
    });

    expect(result.blocked).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it.each([
    "Write a poem about suppliers",
    "Calculate 2x2 for the supply chain",
    "Write a poem about equality",
    "calculate 2 + 2 + 2",
    "Please calculate 2x2",
    "Can you calculate 2x2?",
    "What is (2 * 2)?",
  ])("blocks disguised or multi-step off-topic prompts in demo mode: %s", async (question) => {
    const result = await checkPromptScope({
      question,
      messages: [message("user-1", "user", question)],
      apiKey: "sk-sample-replace-me",
    });

    expect(result.blocked).toBe(true);
    expect(result.source).toBe("deterministic");
  });

  it("allows programming that materially supports supply-chain analysis in demo mode", async () => {
    const question = "Write Python code to calculate safety stock for inventory.";
    const result = await checkPromptScope({
      question,
      messages: [message("user-1", "user", question)],
      apiKey: "sk-sample-replace-me",
    });

    expect(result.blocked).toBe(false);
  });

  it("blocks programming with only an incidental supply-chain keyword in demo mode", async () => {
    for (const question of [
      'Write Python code to print the word "inventory" 100 times.',
      "Write Python code to calculate 2x2 and then print the word inventory.",
    ]) {
      const result = await checkPromptScope({
        question,
        messages: [message("user-1", "user", question)],
        apiKey: "sk-sample-replace-me",
      });

      expect(result.blocked).toBe(true);
      expect(result.source).toBe("deterministic");
    }
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

  it("uses conversation context for arithmetic when a live key is configured", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: { category: "conversation", confidence: 0.91 },
    });

    const question = "What is 2 * 2?";
    const result = await checkPromptScope({
      question,
      messages: [
        message("user-1", "user", "Compare the capacity of these suppliers."),
        message("assistant-1", "assistant", "I can help calculate the comparison."),
        message("user-2", "user", question),
      ],
      apiKey: "sk-live-test-key",
    });

    expect(result).toMatchObject({
      blocked: false,
      category: "conversation",
      source: "model",
    });
    expect(generateTextMock).toHaveBeenCalledOnce();
    expect(generateTextMock.mock.calls[0]?.[0]).toMatchObject({
      maxRetries: 0,
      timeout: 5_000,
    });
  });

  it("blocks an off-topic classification at the confidence threshold", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: { category: "off_topic", confidence: 0.7 },
    });

    const result = await checkPromptScope({
      question: "Tell me some trivia.",
      messages: [message("user-1", "user", "Tell me some trivia.")],
      apiKey: "sk-live-test-key",
    });

    expect(result.blocked).toBe(true);
  });

  it("allows a high-confidence live in-scope classification", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: { category: "supply_chain", confidence: 0.99 },
    });

    const result = await checkPromptScope({
      question: "Calculate supplier capacity.",
      messages: [message("user-1", "user", "Calculate supplier capacity.")],
      apiKey: "sk-live-test-key",
    });

    expect(result.blocked).toBe(false);
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
