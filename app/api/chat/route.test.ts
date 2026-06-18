import { afterEach, describe, expect, it } from "vitest";

import { POST } from "./route";

const previousApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  process.env.OPENAI_API_KEY = previousApiKey;
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
    expect(stream).toContain("Supplier A");
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
});
