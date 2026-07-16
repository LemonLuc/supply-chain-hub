# Role-Aware Actions and Microsoft Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make follow-up actions enforce persona-specific assignment and approval policy, route Dana's recovery prompt correctly, and present Microsoft connectors separately for logistics but as one Microsoft 365 Suite connector for procurement and executive roles.

**Architecture:** Workflow actions carry explicit persona, assignee, and reviewer metadata that is filtered into the server-built application context and consumed by both the API and client. Workflow source IDs remain granular, while `RoleToolSource` becomes a logical connector that expands one visible tool into one or many workflow source IDs.

**Tech Stack:** Next.js App Router, React, TypeScript, Vercel AI SDK, OpenAI Agents SDK, Vitest, React Testing Library.

## Global Constraints

- Dana assigns the recovery check directly to Lukas; that assignment must never enter Dana's approval queue.
- Only “Ask Lucia Lopez for exception review” routes Dana's supplier exception to the executive reviewer.
- “Write Dana Narid for review” is logistics-only and must be rejected for procurement at the API boundary.
- Lukas sees separate Outlook, Microsoft SharePoint, and Microsoft Word connectors, all enabled in the active demo session.
- Dana and Lucía each see one default-on `Microsoft 365 Suite` connector covering all Microsoft-backed workflow sources.
- Disabling the suite disables every Microsoft-backed source for the target workflow; session expiry and reauthorization are out of scope.
- Preserve workflow-native source ordering in outgoing requests.
- Use strict TypeScript, existing two-space indentation, double quotes, and `@/` imports.

---

### Task 1: Role-aware action policy and prompt routing

**Files:**
- Modify: `lib/demo-data.ts`
- Modify: `lib/context.ts`
- Modify: `lib/context.test.ts`
- Modify: `lib/action-workflows.ts`
- Create: `lib/action-workflows.test.ts`
- Modify: `lib/action-agents.ts`
- Modify: `app/api/actions/route.test.ts`

**Interfaces:**
- Consumes: existing `PersonaId`, `WorkflowAction`, `AppContext`, and `ActionWorkflowResult` contracts.
- Produces: explicit `allowedPersonas`, `assigneePersona`, and `reviewerPersona` action metadata; `getActionAssignee(action)`; assignee fields on `ActionWorkflowResult`; persona-filtered `recommendedActions`.

- [ ] **Step 1: Write failing context and routing tests**

Add these assertions to `lib/context.test.ts`:

```ts
it("routes Dana's recovery assignment prompt to supplier alternatives", () => {
  expect(
    resolveWorkflowForPrompt(
      "Assign the carrier recovery check for the uncovered builds.",
      "procurement",
    ),
  ).toBe("delay");
  expect(
    resolveWorkflowForPrompt(
      "Assign a carrier recovery check for uncovered builds today.",
      "procurement",
    ),
  ).toBe("delay");
});

it("filters actions by persona eligibility", () => {
  const logistics = buildAppContext("risks", "logistics", [
    "sap",
    "carriers",
    "warehouse",
    "outlook",
  ]);
  const procurementRisk = buildAppContext("risks", "procurement", [
    "sap",
    "carriers",
    "warehouse",
    "outlook",
  ]);
  const procurementDelay = buildAppContext("delay", "procurement", [
    "sap",
    "quality",
    "excel",
    "capacity",
    "outlook",
  ]);

  expect(logistics.recommendedActions).toContainEqual(
    expect.objectContaining({
      label: "Write Dana Narid for review",
      reviewerPersona: "procurement",
    }),
  );
  expect(procurementRisk.recommendedActions).toHaveLength(0);
  expect(procurementDelay.recommendedActions).toContainEqual(
    expect.objectContaining({
      label: "Assign recovery check to logistics",
      assigneePersona: "logistics",
    }),
  );
  expect(procurementDelay.recommendedActions).toContainEqual(
    expect.objectContaining({
      label: "Ask Lucia Lopez for exception review",
      reviewerPersona: "executive",
    }),
  );
});
```

- [ ] **Step 2: Run the context tests and verify RED**

Run:

```bash
npm test -- lib/context.test.ts
```

Expected: FAIL because the recovery prompt resolves to `risks`, action metadata does not exist, and procurement still receives risk actions.

- [ ] **Step 3: Add explicit action metadata and persona filtering**

Update `WorkflowAction` in `lib/demo-data.ts`:

```ts
export type WorkflowAction = {
  label: string;
  detail: string;
  kind: "draft" | "update" | "share" | "approval";
  sourceIds?: string[];
  allowedPersonas?: PersonaId[];
  assigneePersona?: PersonaId;
  reviewerPersona?: PersonaId;
};
```

Mark every risk action `allowedPersonas: ["logistics"]`. Add `reviewerPersona: "procurement"` to “Write Dana Narid for review.” Mark every delay action `allowedPersonas: ["procurement"]`; add `assigneePersona: "logistics"` to “Assign recovery check to logistics” and `reviewerPersona: "executive"` to “Ask Lucia Lopez for exception review.” Mark every consolidation action `allowedPersonas: ["executive"]`.

In `buildAppContext`, filter with both policy and source requirements:

```ts
const selectedActions = workflow.actions.filter(
  (action) =>
    (!action.allowedPersonas || action.allowedPersonas.includes(persona)) &&
    sourceSetIncludesAll(selectedSourceIds, action.sourceIds),
);
```

In `resolveWorkflowForPrompt`, check exact authorized suggested prompts before keyword matching and extend delay keywords:

```ts
const exactSuggestedWorkflow = policy.allowedWorkflows.find((workflowKey) =>
  workflows[workflowKey].suggestedPrompts.some(
    (suggestedPrompt) => suggestedPrompt.toLowerCase() === normalizedPrompt,
  ),
);
if (exactSuggestedWorkflow) return exactSuggestedWorkflow;

const candidates: Array<[WorkflowKey, string[]]> = [
  [
    "consolidate",
    [
      "heat map",
      "heatmap",
      "consolidate",
      "portfolio",
      "tail-spend",
      "resilience",
      "savings",
      "relationship",
      "relationships",
      "board",
      "contract termination",
    ],
  ],
  [
    "delay",
    [
      "alternative",
      "alternatives",
      "alternate",
      "turret",
      "supplier overview",
      "supplier risk",
      "capacity register",
      "delayed",
      "delay",
      "uncovered build",
      "uncovered builds",
      "recovery check",
    ],
  ],
  [
    "risks",
    [
      "risk",
      "delivery",
      "shipment",
      "carrier",
      "milestone",
      "freight",
      "fedex",
      "dhl",
      "ups",
      "pickup",
    ],
  ],
];
```

- [ ] **Step 4: Run the context tests and verify GREEN**

Run:

```bash
npm test -- lib/context.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing action result and API authorization tests**

Create `lib/action-workflows.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  buildActionWorkflowResult,
  getActionAssignee,
  getActionReviewer,
} from "./action-workflows";
import { buildAppContext } from "./context";

describe("action workflow policy", () => {
  it("assigns Dana's recovery task directly to Lukas", () => {
    const context = buildAppContext("delay", "procurement", [
      "sap",
      "quality",
      "excel",
      "capacity",
      "outlook",
    ]);
    const action = context.recommendedActions.find(
      (candidate) => candidate.label === "Assign recovery check to logistics",
    );
    expect(action).toBeDefined();
    expect(getActionAssignee(action!)).toBe("logistics");
    expect(getActionReviewer(action!)).toBeNull();

    const result = buildActionWorkflowResult({
      context,
      workflowKey: "delay",
      persona: "procurement",
      action: action!,
      orchestration: "demo-fallback",
    });

    expect(result).toMatchObject({
      assigneePersona: "logistics",
      assigneeName: "Lukas Weber",
      reviewerPersona: null,
      reviewerName: null,
      handoff: null,
    });
    expect(result.notice).toContain("Task assigned to Lukas Weber");
  });
});
```

Add these API tests to `app/api/actions/route.test.ts`:

```ts
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
    reviewerPersona: null,
    reviewerName: null,
    handoff: null,
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
    handoff: { from: "procurement", to: "executive" },
  });
});
```

- [ ] **Step 6: Run the action tests and verify RED**

Run:

```bash
npm test -- lib/action-workflows.test.ts app/api/actions/route.test.ts
```

Expected: FAIL because assignee helpers and result fields do not exist and procurement can still submit the static risk action.

- [ ] **Step 7: Implement explicit assignee and reviewer results**

In `lib/action-workflows.ts`, extend the result and replace inferred reviewer routing:

```ts
export type ActionWorkflowResult = {
  actionLabel: string;
  workflowKey: WorkflowKey;
  requesterPersona: PersonaId;
  requesterName: string;
  assigneePersona: PersonaId | null;
  assigneeName: string | null;
  reviewerPersona: PersonaId | null;
  reviewerName: string | null;
  draft: string;
  notice: string;
  agentName: string;
  orchestration: ActionOrchestrationMode;
  toolCalls: string[];
  handoff: { from: string; to: string } | null;
  traceId?: string;
};

export function getActionReviewer(action: WorkflowAction): PersonaId | null {
  return action.reviewerPersona ?? null;
}

export function getActionAssignee(action: WorkflowAction): PersonaId | null {
  return action.assigneePersona ?? null;
}
```

Use those helpers in `buildActionDraft`, `buildActionNotice`, and `buildActionWorkflowResult`. The assignment notice must be:

```ts
if (assigneePersona) {
  return `Task assigned to ${mockUsers[assigneePersona].name}. ${action.detail}`;
}
```

Return `handoff` only for reviewers. In `lib/action-agents.ts`, expose `assigneePersona` through `read_supply_chain_context` and update the run prompt to describe direct assignment when present without adding a reviewer handoff.

- [ ] **Step 8: Run focused action and context tests and verify GREEN**

Run:

```bash
npm test -- lib/context.test.ts lib/action-workflows.test.ts app/api/actions/route.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit the action policy slice**

```bash
git add lib/demo-data.ts lib/context.ts lib/context.test.ts lib/action-workflows.ts lib/action-workflows.test.ts lib/action-agents.ts app/api/actions/route.test.ts
git commit -m "Enforce persona-aware action routing"
```

---

### Task 2: Logical Microsoft connectors by persona

**Files:**
- Modify: `lib/demo-data.ts`
- Modify: `lib/context.ts`
- Modify: `lib/context.test.ts`
- Modify: `app/supply-chain-app.tsx`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: `WorkflowSource`, `WorkflowKey`, persona policies, and settings state keyed by `toolId`.
- Produces: `RoleToolSource.sourceIds: string[]`; separate logistics connectors; aggregated `microsoft-365` connectors; workflow-safe source expansion.

- [ ] **Step 1: Write failing logical connector tests**

Replace the `buildRoleToolSources` expectations in `lib/context.test.ts` with:

```ts
it("exposes separate active Microsoft tools to logistics", () => {
  const sources = buildRoleToolSources("logistics");

  expect(sources.map((source) => source.toolId)).toEqual([
    "sap",
    "carriers",
    "warehouse",
    "outlook",
    "sharepoint",
    "word",
  ]);
  expect(
    sources
      .filter((source) => ["outlook", "sharepoint", "word"].includes(source.toolId))
      .every((source) => source.selected && source.sourceIds.length === 1),
  ).toBe(true);
});

it.each(["procurement", "executive"] as const)(
  "exposes one Microsoft 365 Suite connector to %s",
  (persona) => {
    const sources = buildRoleToolSources(persona);
    const suite = sources.filter((source) => source.toolId === "microsoft-365");

    expect(suite).toHaveLength(1);
    expect(suite[0]).toMatchObject({
      name: "Microsoft 365 Suite",
      category: "Microsoft 365 MCP",
      selected: true,
    });
    expect(
      sources.some((source) =>
        ["outlook", "sharepoint", "word", "excel", "teams"].includes(source.toolId),
      ),
    ).toBe(false);
  },
);
```

Add this UI coverage to `app/supply-chain-app.test.tsx`:

```ts
it("groups Microsoft settings at each persona's authorization level", () => {
  render(<SupplyChainApp currentUser={mockUsers.logistics} />);
  fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));

  expect(screen.getByLabelText("Outlook")).toBeChecked();
  expect(screen.getByLabelText("Microsoft SharePoint")).toBeChecked();
  expect(screen.getByLabelText("Microsoft Word")).toBeChecked();
  expect(screen.queryByLabelText("Microsoft 365 Suite")).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("Demo identity"), {
    target: { value: "procurement" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));

  expect(screen.getAllByLabelText("Microsoft 365 Suite")).toHaveLength(1);
  expect(screen.queryByLabelText("Outlook")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Microsoft SharePoint")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Microsoft Word")).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("Demo identity"), {
    target: { value: "executive" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));

  expect(screen.getAllByLabelText("Microsoft 365 Suite")).toHaveLength(1);
  expect(screen.queryByLabelText("Microsoft Word")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused settings tests and verify RED**

Run:

```bash
npm test -- lib/context.test.ts app/supply-chain-app.test.tsx -t "Microsoft|tools|sources"
```

Expected: FAIL because logistics lacks SharePoint and Word, elevated roles show individual products, and logical tools lack `sourceIds`.

- [ ] **Step 3: Add granular logistics sources and role-level suite projection**

In the risk workflow sources in `lib/demo-data.ts`, make Outlook selected and add:

```ts
{ id: "outlook", name: "Outlook", category: "Microsoft 365 MCP", detail: "Draft operational follow-ups", selected: true },
{ id: "sharepoint", name: "Microsoft SharePoint", category: "Microsoft 365 MCP", detail: "Operational sites, lists and shared files", selected: true },
{ id: "word", name: "Microsoft Word", category: "Microsoft 365 MCP", detail: "Create and update operational documents", selected: true },
```

Extend `RoleToolSource` in `lib/context.ts`:

```ts
export type RoleToolSource = WorkflowSource & {
  toolId: string;
  sourceIds: string[];
  workflowKeys: WorkflowKey[];
  workflowLabels: string[];
};
```

Build unique granular tools as before with `sourceIds: [source.id]`. For non-logistics personas, replace all sources whose IDs are in this set:

```ts
const microsoftSourceIds = new Set([
  "outlook",
  "sharepoint",
  "word",
  "excel",
  "teams",
]);
```

with one connector inserted at the first Microsoft source position:

```ts
{
  id: "microsoft-365",
  toolId: "microsoft-365",
  sourceIds: microsoftSources.map((source) => source.id),
  name: "Microsoft 365 Suite",
  category: "Microsoft 365 MCP",
  detail: "SharePoint, Word, Outlook, PowerPoint, Teams, Excel, and authorized Microsoft 365 apps",
  selected: true,
  workflowKeys: [...new Set(microsoftSources.flatMap((source) => source.workflowKeys))],
  workflowLabels: [...new Set(microsoftSources.flatMap((source) => source.workflowLabels))],
}
```

- [ ] **Step 4: Expand logical connector selections to workflow sources**

In `app/supply-chain-app.tsx`, replace the singular source-ID collection with:

```ts
const selectedSourceIds = new Set(
  roleToolSources
    .filter(
      (source) =>
        source.workflowKeys.includes(nextWorkflowKey) &&
        sourceIsSelected(source.toolId, source.selected),
    )
    .flatMap((source) => source.sourceIds),
);

return workflows[nextWorkflowKey].sources
  .filter((source) => selectedSourceIds.has(source.id))
  .map((source) => source.id);
```

This filters through the workflow's own source list last, preserving source order and excluding unrelated suite products.

- [ ] **Step 5: Run focused connector tests and verify GREEN**

Run:

```bash
npm test -- lib/context.test.ts app/supply-chain-app.test.tsx -t "Microsoft|tools|sources"
```

Expected: PASS.

- [ ] **Step 6: Add suite toggle request regression coverage**

In `app/supply-chain-app.test.tsx`, add a procurement test that disables `Microsoft 365 Suite`, sends a risk prompt and a delay prompt, and asserts:

```ts
expect(riskBody.selectedSourceIds).toEqual(["sap", "carriers", "warehouse"]);
expect(delayBody.selectedSourceIds).toEqual(["sap", "quality", "capacity"]);
```

Then re-enable the suite and verify the delay request restores Microsoft-backed sources in native order:

```ts
expect(delayBody.selectedSourceIds).toEqual([
  "sap",
  "quality",
  "excel",
  "capacity",
  "outlook",
  "teams",
]);
```

- [ ] **Step 7: Run the full context and application tests**

Run:

```bash
npm test -- lib/context.test.ts app/supply-chain-app.test.tsx
```

Expected: the focused files pass. Update existing assertions to expect logistics `6 / 6` selected sources and default risk request IDs `[
"sap", "carriers", "warehouse", "outlook", "sharepoint", "word"
]`; procurement counts and requests must reflect one selected suite connector rather than individual Microsoft checkboxes.

- [ ] **Step 8: Commit the connector slice**

```bash
git add lib/demo-data.ts lib/context.ts lib/context.test.ts app/supply-chain-app.tsx app/supply-chain-app.test.tsx
git commit -m "Group Microsoft tools by persona access"
```

---

### Task 3: Direct assignment UI and honest action failures

**Files:**
- Modify: `app/supply-chain-app.tsx`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: `ActionWorkflowResult.assigneePersona`, `getActionAssignee(action)`, explicit reviewer metadata, and persona-local task rendering.
- Produces: direct task ownership for Lukas, separate executive approvals, rollback on failed requests, and persona-aligned action menus.

- [ ] **Step 1: Write failing UI action tests**

Add a test that renders Dana, clicks the exact suggested recovery prompt, and verifies the request and action menu:

```ts
expect(requestBody.workflowKey).toBe("delay");
expect(screen.queryByRole("button", { name: /Write Dana Narid for review/i })).not.toBeInTheDocument();
expect(screen.getByRole("button", { name: /Assign recovery check to logistics/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Ask Lucia Lopez for exception review/i })).toBeInTheDocument();
```

Mock the assignment response with:

```ts
{
  actionLabel: "Assign recovery check to logistics",
  assigneePersona: "logistics",
  assigneeName: "Lukas Weber",
  reviewerPersona: null,
  reviewerName: null,
  draft: "Assign recovery check to logistics\n\nFrom Dana Narid to Lukas Weber.",
  notice: "Task assigned to Lukas Weber. Create the carrier recovery task for the logistics planner to execute.",
  orchestration: "demo-fallback",
  toolCalls: [],
}
```

Click the assignment, expect no approval queue, switch to logistics, and expect Lukas's `My tasks` list to contain the assignment.

Add a second test using `vi.spyOn(globalThis, "fetch")` that returns the normal chat stream for `/api/chat` and `Response.json({ error: "Action unavailable" }, { status: 403 })` for `/api/actions`. After clicking “Assign recovery check to logistics,” assert:

```ts
expect(
  await screen.findByText("Action could not be completed. Please try again."),
).toBeInTheDocument();
expect(screen.queryByText("My tasks")).not.toBeInTheDocument();
expect(screen.queryByText("Approval queue")).not.toBeInTheDocument();
expect(screen.queryByText("Submitted requests")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused UI tests and verify RED**

Run:

```bash
npm test -- app/supply-chain-app.test.tsx -t "assigns the recovery|rejected action"
```

Expected: FAIL because assignment results do not create tasks for another persona and request failures currently fabricate fallback success.

- [ ] **Step 3: Implement assignee-owned tasks**

Import `getActionAssignee` with `getActionReviewer`. Update `applyActionResult`:

```ts
const reviewerPersona = result?.reviewerPersona ?? getActionReviewer(action);
const assigneePersona = result?.assigneePersona ?? getActionAssignee(action);

if (!reviewerPersona) {
  const createsTask = Boolean(assigneePersona) ||
    (action.kind === "update" && action.label.toLowerCase().includes("task"));
  if (createsTask) {
    setPersonalTasks((current) => [
      ...current,
      {
        id: `task-${crypto.randomUUID()}`,
        actionLabel: personalTaskTitle(action),
        workflowKey,
        ownerPersona: assigneePersona ?? persona,
        detail: action.detail,
        status: "open",
      },
    ]);
  }
  const owner = mockUsers[assigneePersona ?? persona];
  setActionMenuOpen(false);
  setActionNotice(
    result?.notice ??
      `${createsTask ? "Task created" : action.kind === "draft" ? "Draft prepared" : action.kind === "share" ? "Mandate prepared" : "Action staged"} for ${owner.name}. ${action.detail}`,
  );
  setActionNoticeTone("success");
  return;
}
```

Use `getActionReviewer(action)` for optimistic approval creation. Direct assignments do not create optimistic approvals.

- [ ] **Step 4: Replace client-side success fabrication with rollback**

In `runAction`, reject non-2xx responses and update `catch` to:

```ts
if (reviewerPersona) {
  setApprovalRequests((current) =>
    current.filter((request) => request.id !== optimisticApprovalId),
  );
}
setActionMenuOpen(false);
setActionNotice("Action could not be completed. Please try again.");
setActionNoticeTone("error");
```

Do not call `applyActionResult` from `catch`.

- [ ] **Step 5: Run focused UI tests and verify GREEN**

Run:

```bash
npm test -- app/supply-chain-app.test.tsx -t "assigns the recovery|rejected action"
```

Expected: PASS.

- [ ] **Step 6: Run all action and application tests**

Run:

```bash
npm test -- app/supply-chain-app.test.tsx app/api/actions/route.test.ts lib/action-workflows.test.ts lib/context.test.ts
```

Expected: PASS. Every successful non-assignment action mock returns `assigneePersona: null` and `assigneeName: null`; the direct-assignment mock returns the Lukas values shown in Step 1.

- [ ] **Step 7: Commit the UI action slice**

```bash
git add app/supply-chain-app.tsx app/supply-chain-app.test.tsx
git commit -m "Assign persona-owned recovery tasks"
```

---

### Task 4: Full verification and dev-server walkthrough

**Files:**
- Verify: all modified source and test files

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: a clean verified branch and a running local preview demonstrating the requested persona behavior.

- [ ] **Step 1: Run whitespace and repository checks**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only intentional task files appear before the final commit.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Run typecheck after tests**

Run:

```bash
npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 4: Run the production build after typecheck**

Run:

```bash
npm run build
```

Expected: optimized Next.js build succeeds. Run these commands sequentially so `.next/types` regeneration does not race `tsc`.

- [ ] **Step 5: Start the development server**

Run:

```bash
npm run dev -- --hostname 127.0.0.1
```

Expected: Next.js reports a local URL, normally `http://127.0.0.1:3000`.

- [ ] **Step 6: Verify the requested UI in the in-app browser**

Open the reported local URL and verify:

1. Logistics settings show Outlook, Microsoft SharePoint, and Microsoft Word separately.
2. Procurement settings show one Microsoft 365 Suite connector and no individual Microsoft product connectors.
3. Clicking “Assign the carrier recovery check for the uncovered builds.” shows “Assign recovery check to logistics” and “Ask Lucia Lopez for exception review,” but not “Write Dana Narid for review.”
4. Clicking the assignment shows “Task assigned to Lukas Weber.”
5. Switching to Logistics Planner reveals the assigned task under `My tasks`.
6. Executive settings show one Microsoft 365 Suite connector.

Capture a screenshot of the procurement action menu or assigned-task state for the handoff.

- [ ] **Step 7: Stop the development server after the walkthrough if the user does not need it left running**

Send Ctrl-C to the server process only after browser verification. If the user asked to see the changes live, leave the server running and report its URL.
