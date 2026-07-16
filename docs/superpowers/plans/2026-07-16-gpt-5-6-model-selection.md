# GPT-5.6 Model Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every active legacy model choice with GPT-5.6 Sol, Terra, and Luna, expose all six supported reasoning efforts, default to Sol with high reasoning, and propagate the selected effort through chat and action-agent requests.

**Architecture:** Keep `lib/chat.ts` as the catalog, type, normalization, and default source of truth. The React selector consumes those exports, the chat route continues to pass normalized settings to the Vercel OpenAI Responses provider, and the action route passes both normalized values into the Agents SDK workflow. Update only the compatible AI SDK 6 OpenAI provider and the OpenAI Agents SDK; do not migrate the application to AI SDK 7.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library, Vercel AI SDK 6, `@ai-sdk/openai` 3.0.85, OpenAI Agents SDK 0.13.4.

## Global Constraints

- Active models must be exactly `gpt-5.6-sol`, `gpt-5.6-terra`, and `gpt-5.6-luna`, in that order.
- Active reasoning efforts must be exactly `none`, `low`, `medium`, `high`, `xhigh`, and `max`, in that order.
- The browser and server default must be `gpt-5.6-sol` with `high` reasoning.
- Unsupported or legacy inputs must normalize to the new defaults; do not add legacy aliases.
- Apply the selected reasoning effort to live chat and every action-agent instance.
- Keep historical specifications and plans unchanged.
- Do not change prompts, permissions, demo data, response rendering, reasoning-summary disclosure, Cloudflare settings, or environment variables.
- Stop and report a blocker if stable `@ai-sdk/openai` rejects `max`; do not rewrite requests or silently downgrade the effort.

## File Structure

- `lib/chat.ts`: owns model/reasoning catalogs, their inferred union types, exported defaults, and request normalization.
- `lib/chat.test.ts`: verifies exact catalogs, accepted values, and safe defaults.
- `app/supply-chain-app.tsx`: initializes selector state from the exported defaults.
- `app/supply-chain-app.test.tsx`: verifies visible selector choices/defaults and outbound default request values.
- `app/api/chat/route.test.ts`: verifies GPT-5.6 model and `max` effort propagation to the OpenAI Responses provider.
- `app/api/actions/route.ts`: passes normalized reasoning into the action workflow.
- `app/api/actions/route.test.ts`: verifies every constructed action agent receives the selected GPT-5.6 model and reasoning effort.
- `lib/action-agents.ts`: types and applies the selected model/reasoning settings to reviewer and orchestrator agents.
- `package.json`, `package-lock.json`: pin stable provider versions with native GPT-5.6 `max` support.

---

### Task 1: Central model catalog, normalization, and chat-provider support

**Files:**
- Modify: `lib/chat.test.ts:3-34`
- Modify: `app/api/chat/route.test.ts:39-65,161-193`
- Modify: `lib/chat.ts:3-32`
- Modify: `package.json:18-29`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `defaultModel: "gpt-5.6-sol"`
- Produces: `defaultThinkingLevel: "high"`
- Produces: `SupportedModel = "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna"`
- Produces: `ThinkingLevel = "none" | "low" | "medium" | "high" | "xhigh" | "max"`
- Produces: `normalizeChatOptions(model, thinking): { model: SupportedModel; thinking: ThinkingLevel }`
- Consumes: existing `POST /api/chat` request shape and existing `providerOptions.openai` forwarding.

- [ ] **Step 1: Write failing catalog and live-chat tests**

Replace the imports and `normalizeChatOptions` describe block at the top of `lib/chat.test.ts` with:

```ts
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
```

In `app/api/chat/route.test.ts`, change the sample-key fixture model at line 53 to `gpt-5.6-sol`. In the live reasoning test, change the request to:

```ts
        model: "gpt-5.6-terra",
        thinking: "max",
```

and change the matching provider assertion to:

```ts
    expect(streamTextMock.mock.calls[0][0]).toMatchObject({
      model: { model: "gpt-5.6-terra" },
      providerOptions: {
        openai: {
          reasoningEffort: "max",
          reasoningSummary: "detailed",
        },
      },
    });
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm test -- lib/chat.test.ts app/api/chat/route.test.ts`

Expected: FAIL because `defaultModel` and `defaultThinkingLevel` do not exist, the catalog still contains legacy models, and `max` normalizes to `high`.

- [ ] **Step 3: Pin stable SDK versions that natively support `max`**

Run: `npm install --save-exact @ai-sdk/openai@3.0.85 @openai/agents@0.13.4`

Expected `package.json` dependency entries:

```json
"@ai-sdk/openai": "3.0.85",
"@openai/agents": "0.13.4"
```

Leave `ai` and `@ai-sdk/react` on their locked AI SDK 6-compatible versions. Verify the installed provider with:

```bash
grep -q '"max"' node_modules/@ai-sdk/openai/dist/index.d.ts && echo "max supported"
```

Expected: `max supported`.

- [ ] **Step 4: Implement the centralized GPT-5.6 catalog and defaults**

Replace `lib/chat.ts:3-32` with:

```ts
export const supportedModels = [
  { id: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
  { id: "gpt-5.6-luna", label: "GPT-5.6 Luna" },
] as const;

export const thinkingLevels = [
  { id: "none", label: "None" },
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "xhigh", label: "Extra high" },
  { id: "max", label: "Max" },
] as const;

export type SupportedModel = (typeof supportedModels)[number]["id"];
export type ThinkingLevel = (typeof thinkingLevels)[number]["id"];

export const defaultModel: SupportedModel = "gpt-5.6-sol";
export const defaultThinkingLevel: ThinkingLevel = "high";

export function normalizeChatOptions(model: unknown, thinking: unknown): {
  model: SupportedModel;
  thinking: ThinkingLevel;
} {
  const supportedModel = supportedModels.find((option) => option.id === model)?.id;
  const supportedThinking = thinkingLevels.find((option) => option.id === thinking)?.id;

  return {
    model: supportedModel ?? defaultModel,
    thinking: supportedThinking ?? defaultThinkingLevel,
  };
}
```

- [ ] **Step 5: Run the focused tests to verify they pass**

Run: `npm test -- lib/chat.test.ts app/api/chat/route.test.ts`

Expected: PASS for both files, including the `max` provider assertion.

- [ ] **Step 6: Commit the catalog and provider support**

```bash
git add lib/chat.ts lib/chat.test.ts app/api/chat/route.test.ts package.json package-lock.json
git commit -m "Upgrade chat models to GPT-5.6"
```

---

### Task 2: Selector defaults and visible choices

**Files:**
- Modify: `app/supply-chain-app.test.tsx:289-308`
- Modify: `app/supply-chain-app.tsx:28-31,197-202`

**Interfaces:**
- Consumes: `defaultModel`, `defaultThinkingLevel`, `supportedModels`, and `thinkingLevels` from `@/lib/chat`.
- Produces: initial component state of `{ model: "gpt-5.6-sol", thinking: "high" }` and matching chat/action request bodies.

- [ ] **Step 1: Write failing selector and outbound-request tests**

Add these tests after `removes workflow navigation and limits logistics planners to their authorized source set` in `app/supply-chain-app.test.tsx`:

```tsx
  it("defaults to GPT-5.6 Sol with high reasoning and offers only GPT-5.6 choices", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    const modelSelect = screen.getByLabelText("Model") as HTMLSelectElement;
    const thinkingSelect = screen.getByLabelText("Thinking level") as HTMLSelectElement;

    expect(modelSelect).toHaveValue("gpt-5.6-sol");
    expect(within(modelSelect).getAllByRole("option").map((option) => (option as HTMLOptionElement).value)).toEqual([
      "gpt-5.6-sol",
      "gpt-5.6-terra",
      "gpt-5.6-luna",
    ]);
    expect(thinkingSelect).toHaveValue("high");
    expect(within(thinkingSelect).getAllByRole("option").map((option) => (option as HTMLOptionElement).value)).toEqual([
      "none",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
    ]);
  });

  it("sends Sol with high reasoning when the user keeps the defaults", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      model: "gpt-5.6-sol",
      thinking: "high",
    });
  });
```

- [ ] **Step 2: Run the UI tests to verify they fail**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: FAIL because the component still initializes the model state with `gpt-5.4-mini`.

- [ ] **Step 3: Initialize component state from the centralized defaults**

Replace the one-line chat import in `app/supply-chain-app.tsx` with:

```ts
import {
  defaultModel,
  defaultThinkingLevel,
  supportedModels,
  thinkingLevels,
  type SupportedModel,
  type ThinkingLevel,
} from "@/lib/chat";
```

Replace the two state initializers with:

```ts
  const [model, setModel] = useState<SupportedModel>(defaultModel);
  const [thinking, setThinking] = useState<ThinkingLevel>(defaultThinkingLevel);
```

- [ ] **Step 4: Run the UI tests to verify they pass**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: PASS with both new selector tests.

- [ ] **Step 5: Commit the selector defaults**

```bash
git add app/supply-chain-app.tsx app/supply-chain-app.test.tsx
git commit -m "Default model selection to GPT-5.6 Sol"
```

---

### Task 3: Reasoning propagation through action agents

**Files:**
- Modify: `app/api/actions/route.test.ts:52-81`
- Modify: `app/api/actions/route.ts:62-69`
- Modify: `lib/action-agents.ts:3-17,39-57,89-100,113-121`

**Interfaces:**
- Consumes: `SupportedModel` and `ThinkingLevel` from `lib/chat.ts`.
- Changes: `RunActionAgentsOptions` gains `thinking: ThinkingLevel` and narrows `model` to `SupportedModel`.
- Changes: `buildReviewerAgent(name, instructions, model, thinking)` applies `{ reasoning: { effort: thinking } }`.
- Produces: every reviewer and orchestrator `Agent` receives the selected model and reasoning effort.

- [ ] **Step 1: Write the failing action-agent assertion**

In the first live action test in `app/api/actions/route.test.ts`, change the request values to:

```ts
        model: "gpt-5.6-sol",
        thinking: "max",
```

Then add these assertions after the existing `handoffMock` assertion and before the `runMock` assertion:

```ts
    expect(agentConstructorMock).toHaveBeenCalledTimes(3);
    for (const [config] of agentConstructorMock.mock.calls) {
      expect(config).toMatchObject({
        model: "gpt-5.6-sol",
        modelSettings: { reasoning: { effort: "max" } },
      });
    }
```

- [ ] **Step 2: Run the focused action test to verify it fails**

Run: `npm test -- app/api/actions/route.test.ts -t "runs an OpenAI Agents SDK action workflow"`

Expected: FAIL because all three agent configs currently contain `modelSettings: {}`.

- [ ] **Step 3: Pass reasoning through the route and every agent**

In `app/api/actions/route.ts`, add the normalized reasoning value to the workflow call:

```ts
  const result = await runActionAgentsWorkflow({
    context,
    workflowKey: context.workflow.key,
    persona,
    action,
    model: options.model,
    thinking: options.thinking,
  });
```

In `lib/action-agents.ts`, add the chat types import:

```ts
import type { SupportedModel, ThinkingLevel } from "./chat";
```

Replace `RunActionAgentsOptions` with:

```ts
type RunActionAgentsOptions = {
  context: AppContext;
  workflowKey: WorkflowKey;
  persona: PersonaId;
  action: WorkflowAction;
  model: SupportedModel;
  thinking: ThinkingLevel;
};
```

Replace `buildReviewerAgent` with:

```ts
function buildReviewerAgent(
  name: string,
  instructions: string,
  model: SupportedModel,
  thinking: ThinkingLevel,
) {
  return new Agent({
    name,
    handoffDescription: instructions,
    instructions,
    model,
    modelSettings: { reasoning: { effort: thinking } },
    tools: [],
    handoffs: [],
  });
}
```

Add `thinking` to the `runActionAgentsWorkflow` parameter destructuring:

```ts
  action,
  model,
  thinking,
}: RunActionAgentsOptions): Promise<ActionWorkflowResult> {
```

Pass `thinking` as the fourth argument to both reviewer builders:

```ts
  const procurementAgent = buildReviewerAgent(
    "Procurement Review Agent",
    "Review logistics escalation requests as Dana Narid, the procurement team lead.",
    model,
    thinking,
  );
  const executiveAgent = buildReviewerAgent(
    "Executive Decision Agent",
    "Review strategic escalation requests as Dr. Lucía López, the final C-level decision maker.",
    model,
    thinking,
  );
```

Set the orchestrator model settings to:

```ts
    modelSettings: { reasoning: { effort: thinking } },
```

- [ ] **Step 4: Run the focused action test to verify it passes**

Run: `npm test -- app/api/actions/route.test.ts -t "runs an OpenAI Agents SDK action workflow"`

Expected: PASS with three GPT-5.6 Sol agent configs using `max` reasoning.

- [ ] **Step 5: Run the complete action route test file**

Run: `npm test -- app/api/actions/route.test.ts`

Expected: PASS for all action-route tests, including deterministic fallback and authorization behavior.

- [ ] **Step 6: Commit action reasoning propagation**

```bash
git add app/api/actions/route.ts app/api/actions/route.test.ts lib/action-agents.ts
git commit -m "Apply reasoning settings to action agents"
```

---

### Task 4: Legacy-model audit and full verification

**Files:**
- Verify: `app/**/*.ts`, `app/**/*.tsx`, `lib/**/*.ts`, `lib/**/*.tsx`
- Verify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: all behavior implemented in Tasks 1-3.
- Produces: evidence that executable code contains no legacy active model IDs and the complete application passes tests, type checking, and production build.

- [ ] **Step 1: Verify legacy active model identifiers are gone**

Run:

```bash
if grep -R -n -E 'gpt-5\.5|gpt-5\.4(-mini|-nano)?' app lib --include='*.ts' --include='*.tsx'; then exit 1; fi
```

Expected: no output and exit status 0. Historical files under `docs/` are intentionally excluded.

- [ ] **Step 2: Verify all model and reasoning identifiers are present where expected**

Run:

```bash
grep -R -n -E 'gpt-5\.6-(sol|terra|luna)|"max"' app lib --include='*.ts' --include='*.tsx'
```

Expected: matches in the centralized catalog, selector tests, chat route tests, and action route tests; no `gpt-5.6-luma` match.

- [ ] **Step 3: Run the complete test suite**

Run: `npm test`

Expected: 9 test files and 86 tests pass with zero failures.

- [ ] **Step 4: Run strict TypeScript checking**

Run: `npm run typecheck`

Expected: exit status 0 with no TypeScript diagnostics, including native `max` support in both SDK paths.

- [ ] **Step 5: Build the production application**

Run: `npm run build`

Expected: successful Next.js production build with `/api/chat` and `/api/actions` compiled.

- [ ] **Step 6: Run final repository checks**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` exits 0 and `git status --short` is empty after the three implementation commits.
