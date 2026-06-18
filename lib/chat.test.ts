import { describe, expect, it } from "vitest";

import { buildAppContext } from "./context";
import {
  buildSystemPrompt,
  generateMockReply,
  normalizeChatOptions,
  supportedModels,
} from "./chat";

describe("normalizeChatOptions", () => {
  it("accepts supported model and thinking values", () => {
    expect(normalizeChatOptions("gpt-5.4-mini", "high")).toEqual({
      model: "gpt-5.4-mini",
      thinking: "high",
    });
  });

  it("uses safe defaults for unsupported values", () => {
    expect(normalizeChatOptions("legacy-model", "maximum")).toEqual({
      model: "gpt-5.4-mini",
      thinking: "medium",
    });
  });

  it("offers the flagship, mini, and nano model families", () => {
    expect(supportedModels.map((option) => option.id)).toEqual([
      "gpt-5.5",
      "gpt-5.4",
      "gpt-5.4-mini",
      "gpt-5.4-nano",
    ]);
  });
});

describe("chat grounding", () => {
  it("includes the application snapshot in the system prompt", () => {
    const prompt = buildSystemPrompt(buildAppContext("delay"));

    expect(prompt).toContain("A 2-week Supplier A delay creates a week-3 production gap.");
    expect(prompt).toContain("$310K");
  });

  it("returns a useful context-aware reply when no API key is configured", () => {
    const reply = generateMockReply("What should I do first?", buildAppContext("risks"));

    expect(reply).toContain("Supplier A");
    expect(reply).toContain("Escalate Supplier A");
    expect(reply).toContain("demo mode");
  });
});
