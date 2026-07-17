import { APICallError } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";

const { convertToModelMessagesMock, generateTextMock, imageGenerationMock, streamTextMock } = vi.hoisted(() => ({
  convertToModelMessagesMock: vi.fn(async (messages) => messages),
  generateTextMock: vi.fn(async (_options: unknown) => ({
    output: { category: "supply_chain", confidence: 0.99 },
  })),
  imageGenerationMock: vi.fn((options: unknown) => ({
    type: "provider-defined",
    id: "openai.image_generation",
    options,
  })),
  streamTextMock: vi.fn((_options: unknown) => ({
    toUIMessageStreamResponse: vi.fn(() => new Response("live stream")),
  })),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: () => ({
    responses: (model: string) => ({ model }),
    tools: {
      imageGeneration: imageGenerationMock,
    },
  }),
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    convertToModelMessages: convertToModelMessagesMock,
    generateText: generateTextMock,
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
  vi.restoreAllMocks();
  convertToModelMessagesMock.mockClear();
  generateTextMock.mockReset();
  generateTextMock.mockResolvedValue({
    output: { category: "supply_chain", confidence: 0.99 },
  });
  imageGenerationMock.mockClear();
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
        model: "gpt-5.6-sol",
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

  it("streams a trusted operational chart for an explicit demo visualization request", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Visualize the delivery risks as a chart." }],
          },
        ],
        workflowKey: "risks",
        demoPersona: "logistics",
        selectedSourceIds: ["sap", "carriers"],
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(stream).toContain('"toolName":"renderOperationalChart"');
    expect(stream).toContain('"kind":"operational-bar"');
    expect(stream).toContain('"id":"shipment-quantities"');
    expect(stream).not.toContain('"toolName":"generateSlideVisual"');
  });

  it("streams a demo slide image when no trusted quantitative chart is available", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Create an image suitable for a slide deck." }],
          },
        ],
        workflowKey: "risks",
        demoPersona: "logistics",
        selectedSourceIds: [],
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(stream).toContain('"toolName":"generateSlideVisual"');
    expect(stream).toContain('"kind":"slide-image"');
    expect(stream).toContain('"demo":true');
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

  it("blocks standalone arithmetic before any chat workflow runs", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "calcualte 2x2" }],
          },
        ],
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
    generateTextMock.mockResolvedValueOnce({
      output: { category: "off_topic", confidence: 0.97 },
    });
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Who won the football match?" }],
          },
        ],
        workflowKey: "risks",
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(stream).toContain("I can only help with supply-chain operations and analysis");
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it("blocks the request when live prompt classification fails", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    generateTextMock.mockRejectedValueOnce(new Error("classifier unavailable"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "what's 2x2" }],
          },
        ],
        workflowKey: "risks",
      }),
    });

    const response = await POST(request);
    const stream = await response.text();

    expect(response.status).toBe(200);
    expect(stream).toContain("I can only help with supply-chain operations and analysis");
    expect(streamTextMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("removes blocked turns before sending a later allowed prompt to the model", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const refusal =
      "I can only help with supply-chain operations and analysis. Please connect your question to suppliers, procurement, inventory, logistics, shipments, demand planning, production, or this application.";
    const current = {
      id: "message-3",
      role: "user",
      parts: [{ type: "text", text: "Check carrier recovery options." }],
    };
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "calculate 2x2" }],
          },
          {
            id: "message-2",
            role: "assistant",
            parts: [{ type: "text", text: refusal }],
          },
          current,
        ],
        workflowKey: "risks",
      }),
    });

    await POST(request);

    expect(convertToModelMessagesMock).toHaveBeenCalledWith([current]);
    const guardrailPrompt = (generateTextMock.mock.calls[0][0] as { prompt: string }).prompt;
    expect(guardrailPrompt).not.toContain("calculate 2x2");
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

  it("registers the newer portfolio tool for explicit savings and relationship requests", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Plot annual consolidation savings and strategic relationship score as a bubble chart." }],
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

  it("leaves the historical cost and resilience heat map to the restored client renderer", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [
              {
                type: "text",
                text: "Show the supplier cost and resilience heat map with bubbles.",
              },
            ],
          },
        ],
        workflowKey: "consolidate",
        demoPersona: "executive",
        selectedSourceIds: ["sap", "contracts", "quality", "resilience", "policy"],
      }),
    });

    await POST(request);

    const options = streamTextMock.mock.calls[0][0] as {
      tools: Record<string, unknown>;
      system: string;
    };
    expect(options.tools).not.toHaveProperty("renderSupplierPortfolio");
    expect(options.tools).not.toHaveProperty("generateSlideVisual");
    expect(options.system).not.toContain("Call renderSupplierPortfolio exactly once");
    expect(options.system).toContain(
      "Do not create another chart, table, diagram, or text-based substitute",
    );
    expect(imageGenerationMock).not.toHaveBeenCalled();
  });

  it("does not register the portfolio tool for a text-only executive request", async () => {
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
      tools: Record<string, unknown>;
      system: string;
    };
    expect(options.tools).toEqual({});
    expect(options.system).not.toContain("renderSupplierPortfolio");
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
    expect(imageGenerationMock).not.toHaveBeenCalled();
  });

  it("registers only the trusted chart when an explicit live request has quantitative evidence", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Visualize this delivery plan as a chart." }],
          },
        ],
        workflowKey: "risks",
        demoPersona: "logistics",
        selectedSourceIds: ["sap", "carriers"],
      }),
    });

    await POST(request);

    const options = streamTextMock.mock.calls[0][0] as {
      tools: Record<string, unknown>;
      system: string;
    };
    expect(options.tools).toHaveProperty("renderOperationalChart");
    expect(options.tools).not.toHaveProperty("generateSlideVisual");
    expect(imageGenerationMock).not.toHaveBeenCalled();
    expect(options.system).toContain("Produce exactly one visual");
    expect(options.system).toContain("Call renderOperationalChart");
  });

  it("routes a contextual Visualize this follow-up through GPT image generation", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Show me potential delivery risks for this week." }],
          },
          {
            id: "message-2",
            role: "assistant",
            parts: [{ type: "text", text: "DHL Freight has the primary supply-chain delivery risk." }],
          },
          {
            id: "message-3",
            role: "user",
            parts: [{ type: "text", text: "Visualize this." }],
          },
        ],
        workflowKey: "risks",
        demoPersona: "logistics",
        selectedSourceIds: ["sap", "carriers"],
      }),
    });

    await POST(request);

    const options = streamTextMock.mock.calls[0][0] as {
      tools: Record<string, unknown>;
      system: string;
    };
    expect(options.tools).not.toHaveProperty("renderOperationalChart");
    expect(options.tools).toHaveProperty("generateSlideVisual");
    expect(imageGenerationMock).toHaveBeenCalledWith({
      outputFormat: "webp",
      quality: "medium",
      size: "1536x1024",
    });
    expect(options.system).toContain("Call generateSlideVisual");
    expect(options.system).not.toContain("Call renderOperationalChart");
  });

  it("registers the slide-image tool only when no trusted chart is available", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Create an image suitable for a supply-chain slide deck." }],
          },
        ],
        workflowKey: "risks",
        demoPersona: "logistics",
        selectedSourceIds: [],
      }),
    });

    await POST(request);

    const options = streamTextMock.mock.calls[0][0] as {
      tools: Record<string, unknown>;
      system: string;
    };
    expect(options.tools).not.toHaveProperty("renderOperationalChart");
    expect(options.tools).toHaveProperty("generateSlideVisual");
    expect(imageGenerationMock).toHaveBeenCalledWith({
      outputFormat: "webp",
      quality: "medium",
      size: "1536x1024",
    });
    expect(options.system).toContain("Produce exactly one visual");
    expect(options.system).not.toContain("Call renderOperationalChart");
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
        model: "gpt-5.6-terra",
        thinking: "max",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalledOnce();
    expect(streamTextMock.mock.calls[0][0]).toMatchObject({
      model: { model: "gpt-5.6-terra" },
      providerOptions: {
        openai: {
          reasoningEffort: "max",
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
    expect(stream).toContain("version 26.07.17-rc3");
  });

  it("uses the selected demo persona even when a default demo role is configured", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    process.env.DEMO_USER_ROLE = "logistics";
    process.env.LOCK_DEMO_USER_ROLE = "true";
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
