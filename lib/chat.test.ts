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
  it("includes restricted workflow evidence only for an authorized role", () => {
    const prompt = buildSystemPrompt(buildAppContext("delay", "procurement"));

    expect(prompt).toContain("One approved alternate can protect the first eight builds");
    expect(prompt).toContain("€21,600");
    expect(prompt).toContain("Never reveal private chain-of-thought");
  });

  it("returns an operational, tool-grounded demo reply", () => {
    const reply = generateMockReply("What should I do first?", buildAppContext("risks"));

    expect(reply).toContain("DHL Freight shipment 00340434161094000012");
    expect(reply).toContain("Draft email to DHL Freight");
    expect(reply).toContain("SAP S/4HANA MCP");
    expect(reply).toContain("demo mode");
  });

  it("answers financial questions only when the context permits it", () => {
    const procurementReply = generateMockReply(
      "What is the cost impact?",
      buildAppContext("risks", "procurement"),
    );
    const logisticsReply = generateMockReply(
      "What is the cost impact?",
      buildAppContext("risks", "logistics"),
    );

    expect(procurementReply).toContain("€185,000");
    expect(logisticsReply).not.toContain("€185,000");
    expect(logisticsReply).toContain("not available to your signed-in role");
  });
});
