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
        model: "gpt-5.6-sol",
        thinking: "max",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orchestration).toBe("agents-sdk");
    expect(body.reviewerPersona).toBe("procurement");
    expect(body.recipientActionLabel).toBe("Review delivery risk summary");
    expect(body.notice).toBe("Approval request sent to Dana Narid.");
    expect(body.draft).toContain("From Lukas Weber to Dana Narid.");
    expect(body.traceId).toMatch(/^trace_/);
    expect(toolMock).toHaveBeenCalledWith(expect.objectContaining({ name: "read_supply_chain_context" }));
    expect(toolMock).toHaveBeenCalledWith(expect.objectContaining({ name: "prepare_action_workflow" }));
    expect(handoffMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Procurement Review Agent" }),
      expect.objectContaining({ toolNameOverride: "handoff_to_procurement_lead" }),
    );
    expect(agentConstructorMock).toHaveBeenCalledTimes(3);
    for (const [config] of agentConstructorMock.mock.calls) {
      expect(config).toMatchObject({
        model: "gpt-5.6-sol",
        modelSettings: { reasoning: { effort: "max" } },
      });
    }
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
    expect(body.recipientActionLabel).toBe("Review delivery risk summary");
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

  it("rejects Microsoft-backed actions when the suite source is not selected", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";

    const procurementResponse = await POST(
      actionRequest({
        workflowKey: "delay",
        demoPersona: "procurement",
        selectedSourceIds: ["sap", "quality", "capacity"],
        actionLabel: "Add comment to supplier risk register",
      }),
    );
    const executiveResponse = await POST(
      actionRequest({
        workflowKey: "consolidate",
        demoPersona: "executive",
        selectedSourceIds: ["sap", "contracts", "quality", "resilience", "policy"],
        actionLabel: "Draft contract termination letter",
      }),
    );

    expect(procurementResponse.status).toBe(403);
    expect(executiveResponse.status).toBe(403);
    expect(runMock).not.toHaveBeenCalled();
  });

  it("rejects Dana submitting a self-addressed review action", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";

    const response = await POST(
      actionRequest({
        workflowKey: "risks",
        demoPersona: "procurement",
        selectedSourceIds: ["sap", "carriers", "warehouse", "outlook"],
        actionLabel: "Write Dana Narid for review",
      }),
    );

    expect(response.status).toBe(403);
  });

  it("assigns Dana's recovery check directly to Lukas", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";

    const response = await POST(
      actionRequest({
        workflowKey: "delay",
        demoPersona: "procurement",
        selectedSourceIds: ["sap", "quality", "excel", "capacity", "outlook"],
        actionLabel: "Assign recovery check to logistics",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      assigneePersona: "logistics",
      assigneeName: "Lukas Weber",
      recipientActionLabel: "Run recovery check",
      reviewerPersona: null,
      reviewerName: null,
      handoff: null,
    });
  });

  it("uses the selected demo persona even when the legacy role lock is configured", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";
    process.env.DEMO_USER_ROLE = "logistics";
    process.env.LOCK_DEMO_USER_ROLE = "true";

    const response = await POST(
      actionRequest({
        workflowKey: "delay",
        demoPersona: "procurement",
        selectedSourceIds: ["sap", "quality", "excel", "capacity", "outlook"],
        actionLabel: "Assign recovery check to logistics",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      requesterPersona: "procurement",
      assigneePersona: "logistics",
      assigneeName: "Lukas Weber",
    });
  });

  it("returns the authorized mock assignment when live orchestration fails", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";
    runMock.mockRejectedValueOnce(new Error("Agents SDK unavailable"));

    const response = await POST(
      actionRequest({
        workflowKey: "delay",
        demoPersona: "procurement",
        selectedSourceIds: ["sap", "quality", "excel", "capacity", "outlook"],
        actionLabel: "Assign recovery check to logistics",
        model: "gpt-5.6-sol",
        thinking: "high",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      orchestration: "demo-fallback",
      requesterPersona: "procurement",
      assigneePersona: "logistics",
      assigneeName: "Lukas Weber",
      recipientActionLabel: "Run recovery check",
    });
  });

  it("routes Dana's exception review only to Lucia", async () => {
    process.env.OPENAI_API_KEY = "sk-sample-replace-me";

    const response = await POST(
      actionRequest({
        workflowKey: "delay",
        demoPersona: "procurement",
        selectedSourceIds: ["sap", "quality", "excel", "capacity", "outlook"],
        actionLabel: "Ask Lucia Lopez for exception review",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      assigneePersona: null,
      assigneeName: null,
      reviewerPersona: "executive",
      reviewerName: "Dr. Lucía López",
      recipientActionLabel: "Review six-build coverage exception",
      handoff: { from: "procurement", to: "executive" },
    });
  });

  it("lets Lucia run strategic actions without routing anything to Dana", async () => {
    process.env.OPENAI_API_KEY = "sk-live-test-key";

    const response = await POST(
      actionRequest({
        workflowKey: "consolidate",
        demoPersona: "executive",
        selectedSourceIds: ["sap", "contracts", "quality", "resilience", "policy", "word"],
        actionLabel: "Draft contract termination letter",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orchestration).toBe("agents-sdk");
    expect(body.reviewerPersona).toBeNull();
    expect(body.recipientActionLabel).toBeNull();
    expect(body.notice).toContain("Draft prepared for Dr. Lucía López");
    expect(body.notice).not.toContain("Dana");
  });
});
