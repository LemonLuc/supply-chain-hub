import { afterEach, describe, expect, it } from "vitest";

import { POST } from "./route";

const previousApiKey = process.env.OPENAI_API_KEY;
const previousDemoRole = process.env.DEMO_USER_ROLE;

afterEach(() => {
  process.env.OPENAI_API_KEY = previousApiKey;
  process.env.DEMO_USER_ROLE = previousDemoRole;
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

  it("uses the server-derived procurement identity", async () => {
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

    expect(stream).toContain("€185,000");
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
});
