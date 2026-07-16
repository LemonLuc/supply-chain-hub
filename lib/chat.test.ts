import { describe, expect, it } from "vitest";

import { buildAppContext } from "./context";
import {
  buildSystemPrompt,
  defaultModel,
  defaultThinkingLevel,
  generateMockReply,
  normalizeChatOptions,
  supportedModels,
  thinkingLevels,
} from "./chat";

describe("normalizeChatOptions", () => {
  it("accepts GPT-5.6 models and every supported reasoning effort", () => {
    expect(normalizeChatOptions("gpt-5.6-luna", "max")).toEqual({
      model: "gpt-5.6-luna",
      thinking: "max",
    });
  });

  it("uses Sol with high reasoning for unsupported values", () => {
    expect(normalizeChatOptions("legacy-model", "maximum")).toEqual({
      model: defaultModel,
      thinking: defaultThinkingLevel,
    });
    expect(defaultModel).toBe("gpt-5.6-sol");
    expect(defaultThinkingLevel).toBe("high");
  });

  it("offers only the GPT-5.6 Sol, Terra, and Luna models", () => {
    expect(supportedModels).toEqual([
      { id: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
      { id: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
      { id: "gpt-5.6-luna", label: "GPT-5.6 Luna" },
    ]);
  });

  it("offers all GPT-5.6 reasoning efforts", () => {
    expect(thinkingLevels).toEqual([
      { id: "none", label: "None" },
      { id: "low", label: "Low" },
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
      { id: "xhigh", label: "Extra high" },
      { id: "max", label: "Max" },
    ]);
  });
});

describe("chat grounding", () => {
  it("includes restricted workflow evidence only for an authorized role", () => {
    const prompt = buildSystemPrompt(buildAppContext("delay", "procurement"));

    expect(prompt).toContain("One approved alternate can protect the first eight builds");
    expect(prompt).not.toContain("€21,600");
    expect(prompt).toContain("Never reveal private chain-of-thought");
  });

  it("returns an operational, tool-grounded demo reply", () => {
    const reply = generateMockReply("What should I do first?", buildAppContext("risks"));

    expect(reply).toContain("DHL Freight shipment 00340434161094000012");
    expect(reply).toContain("Log DHL exception on PO 4500872319");
    expect(reply).toContain("SAP S/4HANA MCP");
    expect(reply).toContain("demo mode");
  });

  it("does not include deselected source evidence in prompts or demo replies", () => {
    const context = buildAppContext("risks", "logistics", ["sap", "warehouse"]);
    const prompt = buildSystemPrompt(context);
    const reply = generateMockReply("What should I do first?", context);

    expect(prompt).not.toContain("DHL Freight");
    expect(prompt).not.toContain("00340434161094000012");
    expect(prompt).not.toContain("PO 4500872319");
    expect(prompt).not.toContain("FedEx");
    expect(prompt).not.toContain("PO 4500872481");
    expect(reply).not.toContain("DHL Freight");
    expect(reply).not.toContain("00340434161094000012");
    expect(reply).not.toContain("FedEx");
  });

  it("grounds supplier register review answers in selected SharePoint workbook data", () => {
    const context = buildAppContext("delay", "procurement", ["sap", "quality", "excel", "capacity", "outlook"]);
    const prompt = buildSystemPrompt(context);
    const reply = generateMockReply("Review Supplier Risk & Capacity Register.xlsx and show me recent changes.", context);

    expect(prompt).toContain("Supplier Risk & Capacity Register.xlsx");
    expect(prompt).toContain("Mechatronik Süd capacity increased from 6 to 8 units");
    expect(prompt).toContain("version 24.06.21-rc3");
    expect(reply).toContain("Supplier Risk & Capacity Register.xlsx");
    expect(reply).toContain("Mechatronik Süd capacity increased from 6 to 8 units");
  });

  it("treats selected sources in the live snapshot as accessible to the assistant", () => {
    const prompt = buildSystemPrompt(buildAppContext("delay", "procurement", ["sap", "quality", "excel", "capacity", "outlook"]));

    expect(prompt).toContain("Any source listed in `sources` or `selectedAuthorizedSources` is already authorized and available");
    expect(prompt).toContain("Do not say you lack access to SAP, SharePoint, Excel, or any selected source");
    expect(prompt).toContain("Supplier Risk & Capacity Register.xlsx");
  });

  it("does not claim workbook access when the SharePoint source is deselected", () => {
    const context = buildAppContext("delay", "executive", ["sap", "quality", "capacity", "outlook"]);
    const prompt = buildSystemPrompt(context);
    const reply = generateMockReply("Review Supplier Risk & Capacity Register.xlsx and show me recent changes.", context);

    expect(prompt).not.toContain("Mechatronik Süd capacity increased from 6 to 8 units");
    expect(reply).toContain("SharePoint MCP is not selected");
  });

  it("answers financial questions only when the context permits it", () => {
    const executiveReply = generateMockReply(
      "What is the cost impact?",
      buildAppContext("consolidate", "executive"),
    );
    const logisticsReply = generateMockReply(
      "What is the cost impact?",
      buildAppContext("risks", "logistics"),
    );
    const procurementReply = generateMockReply(
      "What is the cost impact?",
      buildAppContext("risks", "procurement"),
    );

    expect(executiveReply).toContain("€740K");
    expect(procurementReply).not.toContain("€185,000");
    expect(procurementReply).toContain("not available to your signed-in role");
    expect(logisticsReply).not.toContain("€185,000");
    expect(logisticsReply).toContain("not available to your signed-in role");
  });
});
