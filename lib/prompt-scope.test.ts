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
