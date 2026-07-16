import { APICallError } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";

const { streamTextMock } = vi.hoisted(() => ({
  streamTextMock: vi.fn((_options: unknown) => ({
    toUIMessageStreamResponse: vi.fn(() => new Response("live stream")),
  })),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: () => ({
    responses: (model: string) => ({ model }),
  }),
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    convertToModelMessages: vi.fn(async (messages) => messages),
    streamText: streamTextMock,
  };
});

import { POST } from "./route";

const previousApiKey = process.env.OPENAI_API_KEY;
const previousDemoRole = process.env.DEMO_USER_ROLE;
const previousLockedDemoRole = process.env.LOCK_DEMO_USER_ROLE;

afterEach(() => {
  process.env.OPENAI_API_KEY = previousApiKey;
  process.env.DEMO_USER_ROLE = previousDemoRole;
  process.env.LOCK_DEMO_USER_ROLE = previousLockedDemoRole;
  streamTextMock.mockClear();
});

describe("POST /api/chat", () => {
  it("streams a grounded demo reply when the API key is a sample", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "What should I do first?" }],
          },
        ],
        workflowKey: "risks",
        model: "gpt-5.4-mini",
        thinking: "medium",
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
    expect(stream).toContain("DHL Freight shipment 00340434161094000012");
    expect(stream).toContain("demo mode");
  });

  it("rejects a request without a user message", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [], workflowKey: "risks" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("uses the server-derived procurement identity without financial elevation", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";
    process.env.DEMO_USER_ROLE = "procurement";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "What is the cost impact?" }],
          },
        ],
        workflowKey: "risks",
        persona: "logistics",
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(stream).not.toContain("€185,000");
    expect(stream).toContain("not available to your signed-in role");
  });

  it("does not trust a browser persona to elevate access", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";
    process.env.DEMO_USER_ROLE = "logistics";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "What is the cost impact?" }],
          },
        ],
        workflowKey: "risks",
        persona: "procurement",
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(stream).not.toContain("€185,000");
    expect(stream).toContain("not available to your signed-in role");
  });

  it("uses the selected demo CEO persona for live demo requests", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    process.env.DEMO_USER_ROLE = undefined;
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Show supplier consolidation options with cost and resilience tradeoffs." }],
          },
        ],
        workflowKey: "consolidate",
        demoPersona: "executive",
        selectedSourceIds: ["sap", "contracts", "quality", "resilience", "policy"],
      }),
    });

    const response = await POST(request);
    const systemPrompt = (streamTextMock.mock.calls[0][0] as { system: string }).system;

    expect(response.status).toBe(200);
    expect(systemPrompt).toContain('"id": "executive"');
    expect(systemPrompt).toContain('"key": "consolidate"');
    expect(systemPrompt).toContain("Two consolidation candidates pass the resilience guardrails");
  });

  it("registers a trusted model-selected portfolio tool for executive requests", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Compare supplier cost and resilience." }],
          },
        ],
        workflowKey: "consolidate",
        demoPersona: "executive",
        selectedSourceIds: ["sap", "contracts", "quality", "resilience", "policy"],
      }),
    });

    await POST(request);

    const options = streamTextMock.mock.calls[0][0] as {
      tools: {
        renderSupplierPortfolio?: {
          execute?: (input: { preferredView: "matrix" | "bubble"; reason: string }) => unknown;
        };
      };
      stopWhen?: unknown;
      system: string;
    };
    expect(options.tools).toHaveProperty("renderSupplierPortfolio");
    expect(options.stopWhen).toBeDefined();
    expect(options.system).toContain("Call renderSupplierPortfolio exactly once");

    const output = await options.tools.renderSupplierPortfolio?.execute?.({
      preferredView: "bubble",
      reason: "Quantitative measures are complete.",
    });
    expect(output).toMatchObject({
      view: "bubble",
      requestedView: "bubble",
      fallbackApplied: false,
      suppliers: expect.arrayContaining([
        expect.objectContaining({ supplier: "Steripack Hohenlohe" }),
      ]),
    });
  });

  it("does not register the portfolio tool outside authorized decision support", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "What should I do first?" }],
          },
        ],
        workflowKey: "risks",
        demoPersona: "logistics",
      }),
    });

    await POST(request);

    const options = streamTextMock.mock.calls[0][0] as { tools: Record<string, unknown> };
    expect(options.tools).toEqual({});
  });

  it("enables OpenAI reasoning summaries for live responses", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "What should I do first?" }],
          },
        ],
        workflowKey: "risks",
        model: "gpt-5.4-mini",
        thinking: "medium",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalledOnce();
    expect(streamTextMock.mock.calls[0][0]).toMatchObject({
      model: { model: "gpt-5.4-mini" },
      providerOptions: {
        openai: {
          reasoningEffort: "medium",
          reasoningSummary: "detailed",
        },
      },
    });
  });

  it("passes only selected authorized sources into the live model context", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    process.env.DEMO_USER_ROLE = "logistics";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Check the selected carrier source." }],
          },
        ],
        workflowKey: "risks",
        selectedSourceIds: ["carriers"],
      }),
    });

    const response = await POST(request);
    const systemPrompt = (streamTextMock.mock.calls[0][0] as { system: string }).system;

    expect(response.status).toBe(200);
    expect(systemPrompt).toContain('"selectedAuthorizedSources"');
    expect(systemPrompt).toContain('"id": "carriers"');
    expect(systemPrompt).toContain("Shipping providers MCP");
    expect(systemPrompt).toContain("PO 4500872319");
    expect(systemPrompt).toContain("PO 4500872481");
  });

  it("returns selected SharePoint workbook data for Dana without asking the live model to infer access", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    process.env.DEMO_USER_ROLE = undefined;
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Review Supplier Risk & Capacity Register.xlsx and show me recent changes." }],
          },
        ],
        workflowKey: "delay",
        demoPersona: "procurement",
        selectedSourceIds: ["sap", "quality", "excel", "capacity", "outlook"],
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(response.status).toBe(200);
    expect(streamTextMock).not.toHaveBeenCalled();
    expect(stream).toContain("Supplier Risk & Capacity Register.xlsx");
    expect(stream).toContain("Mechatronik Süd capacity increased from 6 to 8 units");
    expect(stream).toContain("version 24.06.21-rc3");
  });

  it("uses the selected demo persona even when a default demo role is configured", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    process.env.DEMO_USER_ROLE = "logistics";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Review Supplier Risk & Capacity Register.xlsx and show me recent changes." }],
          },
        ],
        workflowKey: "delay",
        demoPersona: "procurement",
        selectedSourceIds: ["sap", "quality", "excel", "capacity", "outlook"],
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(response.status).toBe(200);
    expect(streamTextMock).not.toHaveBeenCalled();
    expect(stream).toContain("Mechatronik Süd capacity increased from 6 to 8 units");
    expect(stream).not.toContain("SharePoint MCP is not selected");
  });

  it("surfaces safe OpenAI API error details in streamed responses", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "What should I do first?" }],
          },
        ],
        workflowKey: "risks",
      }),
    });

    await POST(request);

    const responseWriter = streamTextMock.mock.results[0].value.toUIMessageStreamResponse;
    const streamOptions = responseWriter.mock.calls[0][0];
    const message = streamOptions.onError(
      new APICallError({
        message: "Incorrect API key provided",
        url: "https://api.openai.com/v1/responses",
        requestBodyValues: { input: "redacted by formatter" },
        statusCode: 401,
        responseHeaders: { "x-request-id": "req_123" },
        responseBody: JSON.stringify({
          error: {
            message: "Incorrect API key provided: sk-test",
            type: "invalid_request_error",
            code: "invalid_api_key",
          },
        }),
      }),
    );

    expect(responseWriter).toHaveBeenCalledOnce();
    expect(message).toContain("OpenAI API request failed");
    expect(message).toContain("status 401");
    expect(message).toContain("Incorrect API key provided");
    expect(message).toContain("invalid_api_key");
    expect(message).toContain("request id: req_123");
    expect(message).not.toContain("redacted by formatter");
  });
});
