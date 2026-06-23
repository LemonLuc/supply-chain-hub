import { afterEach, describe, expect, it, vi } from "vitest";

const {
  agentConstructorMock,
  forceFlushMock,
  handoffMock,
  runMock,
  toolMock,
} = vi.hoisted(() => ({
  agentConstructorMock: vi.fn(function Agent(config: Record<string, unknown>) {
    return { ...config, __agent: true };
  }),
  forceFlushMock: vi.fn(async () => undefined),
  handoffMock: vi.fn((agent: unknown, config: unknown) => ({ agent, config, __handoff: true })),
  runMock: vi.fn(async () => ({ finalOutput: "Action workflow completed." })),
  toolMock: vi.fn((config: Record<string, unknown>) => ({ ...config, type: "function" })),
}));

vi.mock("@openai/agents", () => ({
  Agent: agentConstructorMock,
  getGlobalTraceProvider: () => ({ forceFlush: forceFlushMock }),
  handoff: handoffMock,
  run: runMock,
  tool: toolMock,
}));

import { POST } from "./route";

const previousApiKey = process.env.OPENAI_API_KEY;
const previousDemoRole = process.env.DEMO_USER_ROLE;
const previousLockedDemoRole = process.env.LOCK_DEMO_USER_ROLE;

afterEach(() => {
  process.env.OPENAI_API_KEY = previousApiKey;
  process.env.DEMO_USER_ROLE = previousDemoRole;
  process.env.LOCK_DEMO_USER_ROLE = previousLockedDemoRole;
  agentConstructorMock.mockClear();
  forceFlushMock.mockClear();
  handoffMock.mockClear();
  runMock.mockClear();
  toolMock.mockClear();
});

function actionRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/actions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/actions", () => {
  it("runs an OpenAI Agents SDK action workflow for Lukas to escalate to Dana", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";

    const response = await POST(
      actionRequest({
        workflowKey: "risks",
        demoPersona: "logistics",
        selectedSourceIds: ["sap", "carriers", "warehouse", "outlook"],
        actionLabel: "Write Dana Narid for review",
        model: "gpt-5.4-mini",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orchestration).toBe("agents-sdk");
    expect(body.reviewerPersona).toBe("procurement");
    expect(body.notice).toBe("Approval request sent to Dana Narid.");
    expect(body.draft).toContain("From Lukas Weber to Dana Narid.");
    expect(body.traceId).toMatch(/^trace_/);
    expect(toolMock).toHaveBeenCalledWith(expect.objectContaining({ name: "read_supply_chain_context" }));
    expect(toolMock).toHaveBeenCalledWith(expect.objectContaining({ name: "prepare_action_workflow" }));
    expect(handoffMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Procurement Review Agent" }),
      expect.objectContaining({ toolNameOverride: "handoff_to_procurement_lead" }),
    );
    expect(runMock).toHaveBeenCalledOnce();
    expect(forceFlushMock).toHaveBeenCalledOnce();
  });

  it("uses the deterministic action fallback when no live OpenAI key is configured", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";

    const response = await POST(
      actionRequest({
        workflowKey: "risks",
        demoPersona: "logistics",
        selectedSourceIds: ["sap", "carriers", "warehouse", "outlook"],
        actionLabel: "Write Dana Narid for review",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orchestration).toBe("demo-fallback");
    expect(body.reviewerPersona).toBe("procurement");
    expect(runMock).not.toHaveBeenCalled();
    expect(forceFlushMock).not.toHaveBeenCalled();
  });

  it("rejects an action that is not available for the selected tools", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";

    const response = await POST(
      actionRequest({
        workflowKey: "risks",
        demoPersona: "logistics",
        selectedSourceIds: ["sap", "carriers", "warehouse"],
        actionLabel: "Write Dana Narid for review",
      }),
    );

    expect(response.status).toBe(403);
    expect(runMock).not.toHaveBeenCalled();
  });

  it("lets Lucia run strategic actions without routing anything to Dana", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";

    const response = await POST(
      actionRequest({
        workflowKey: "consolidate",
        demoPersona: "executive",
        selectedSourceIds: ["sap", "contracts", "quality", "resilience", "policy"],
        actionLabel: "Draft contract termination letter",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orchestration).toBe("agents-sdk");
    expect(body.reviewerPersona).toBeNull();
    expect(body.notice).toContain("Draft prepared for Dr. Lucía López");
    expect(body.notice).not.toContain("Dana");
  });
});
