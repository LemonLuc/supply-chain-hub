# Chat Answer Feedback and Tool Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render every authorized tool once per user and add compact copy and page-local feedback controls below generated answers.

**Architecture:** Collapse workflow-specific source definitions into logical persona tools keyed by stable source ID while retaining workflow membership for request filtering. Add a controlled `AnswerActions` component below assistant text; `SupplyChainApp` owns clipboard confirmation and message-keyed feedback state so reset and persona-switch behavior remain centralized.

**Tech Stack:** Next.js App Router, React 19, strict TypeScript, Lucide React, Vitest, React Testing Library, CSS theme tokens.

## Global Constraints

- Feedback stays in React state for the current page lifetime; do not add an API, persistence, or analytics.
- Only assistant messages with non-empty text receive copy and feedback actions.
- One tool checkbox applies to every authorized workflow containing that stable source ID.
- A logical tool defaults to selected when at least one authorized workflow selects it by default.
- Clipboard failure must not display a false success state.
- Preserve the unrelated existing change to `next-env.d.ts`.

---

### Task 1: Logical Persona Tool Deduplication

**Files:**
- Modify: `lib/context.test.ts`
- Modify: `lib/context.ts`
- Modify: `app/supply-chain-app.test.tsx`
- Modify: `app/supply-chain-app.tsx`

**Interfaces:**
- Produces: `RoleToolSource` with `toolId: string`, `workflowKeys: WorkflowKey[]`, and `workflowLabels: string[]`.
- Produces: `buildRoleToolSources(personaValue?: unknown): RoleToolSource[]` returning unique stable source IDs.
- Consumes: `workflows[workflowKey].sources` and persona `allowedWorkflows`.

- [ ] **Step 1: Write failing context tests for stable-ID deduplication and retained workflow membership**

Replace the `buildRoleToolSources` assertions with tests equivalent to:

```ts
it("exposes unique stable tools to logistics planners", () => {
  const sources = buildRoleToolSources("logistics");

  expect(sources.map((source) => source.toolId)).toEqual([
    "sap",
    "carriers",
    "warehouse",
    "outlook",
  ]);
  expect(sources.every((source) => source.workflowKeys.every((key) => key === "risks"))).toBe(true);
});

it("deduplicates shared procurement tools and retains their workflows", () => {
  const sources = buildRoleToolSources("procurement");
  const outlook = sources.find((source) => source.toolId === "outlook");

  expect(new Set(sources.map((source) => source.toolId)).size).toBe(sources.length);
  expect(sources.map((source) => source.toolId)).toEqual([
    "sap",
    "carriers",
    "warehouse",
    "outlook",
    "quality",
    "excel",
    "capacity",
    "teams",
  ]);
  expect(outlook).toMatchObject({
    selected: true,
    workflowKeys: ["risks", "delay"],
  });
});

it("exposes only unique strategic tools to executives", () => {
  const sources = buildRoleToolSources("executive");

  expect(sources.map((source) => source.toolId)).toEqual([
    "sap",
    "contracts",
    "quality",
    "resilience",
    "policy",
    "word",
  ]);
  expect(sources.every((source) => source.workflowKeys.includes("consolidate"))).toBe(true);
});
```

- [ ] **Step 2: Run the focused context tests and verify RED**

Run: `npm test -- lib/context.test.ts`

Expected: FAIL because current tool IDs are workflow-qualified and `workflowKeys` does not exist.

- [ ] **Step 3: Implement logical tool aggregation**

Change the role source type and builder in `lib/context.ts` to:

```ts
export type RoleToolSource = WorkflowSource & {
  toolId: string;
  workflowKeys: WorkflowKey[];
  workflowLabels: string[];
};

export function buildRoleToolSources(personaValue?: unknown): RoleToolSource[] {
  const policy = getPersonaPolicy(personaValue);
  const sourcesById = new Map<string, RoleToolSource>();

  for (const workflowKey of policy.allowedWorkflows) {
    const workflow = workflows[workflowKey];

    for (const source of workflow.sources) {
      const existing = sourcesById.get(source.id);

      if (existing) {
        sourcesById.set(source.id, {
          ...existing,
          selected: existing.selected || source.selected,
          workflowKeys: [...existing.workflowKeys, workflowKey],
          workflowLabels: [...existing.workflowLabels, workflow.navLabel],
        });
        continue;
      }

      sourcesById.set(source.id, {
        ...source,
        toolId: source.id,
        workflowKeys: [workflowKey],
        workflowLabels: [workflow.navLabel],
      });
    }
  }

  return [...sourcesById.values()];
}
```

- [ ] **Step 4: Run the focused context tests and verify GREEN**

Run: `npm test -- lib/context.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing UI tests for one visible checkbox and shared workflow selection**

In `app/supply-chain-app.test.tsx`, change the existing procurement assertion to `screen.getByLabelText("SAP S/4HANA")` and add:

```ts
it("shows shared procurement tools once and applies their selection to every workflow", async () => {
  const fetchMock = mockChatStream();
  render(<SupplyChainApp currentUser={mockUsers.procurement} />);

  fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
  expect(screen.getAllByLabelText("SAP S/4HANA")).toHaveLength(1);
  expect(screen.getAllByLabelText("Outlook")).toHaveLength(1);
  expect(screen.getByText("7 / 8 data sources selected")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Outlook"));

  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "Show me potential delivery risks for this week." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "What approved alternates can cover the delayed turret assemblies?" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

  const bodies = fetchMock.mock.calls.map((call) => JSON.parse(String(call[1]?.body)));
  expect(bodies[0]).toMatchObject({ workflowKey: "risks" });
  expect(bodies[1]).toMatchObject({ workflowKey: "delay" });
  expect(bodies[0].selectedSourceIds).not.toContain("outlook");
  expect(bodies[1].selectedSourceIds).not.toContain("outlook");
});
```

- [ ] **Step 6: Run the focused UI test and verify RED**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: FAIL because procurement still renders duplicate SAP and Outlook checkboxes.

- [ ] **Step 7: Filter selected sources by retained workflow membership**

Change `getSelectedSourceIdsForWorkflow` in `app/supply-chain-app.tsx` to:

```ts
function getSelectedSourceIdsForWorkflow(nextWorkflowKey: WorkflowKey) {
  const selectedSourceIds = new Set(
    roleToolSources
      .filter(
        (source) =>
          source.workflowKeys.includes(nextWorkflowKey) &&
          sourceIsSelected(source.toolId, source.selected),
      )
      .map((source) => source.id),
  );

  return workflows[nextWorkflowKey].sources
    .filter((source) => selectedSourceIds.has(source.id))
    .map((source) => source.id);
}
```

Filtering the workflow's original source list last preserves the workflow-native request order after logical settings deduplication.

The existing settings render loop continues to key and update selection with `source.toolId`, which is now the stable ID.

- [ ] **Step 8: Run context and UI tests and verify GREEN**

Run: `npm test -- lib/context.test.ts app/supply-chain-app.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit the deduplication slice**

```bash
git add lib/context.ts lib/context.test.ts app/supply-chain-app.tsx app/supply-chain-app.test.tsx
git commit -m "Deduplicate tools in chat settings"
```

### Task 2: Per-Answer Copy and Feedback Controls

**Files:**
- Create: `app/answer-actions.tsx`
- Modify: `app/supply-chain-app.test.tsx`
- Modify: `app/supply-chain-app.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `FeedbackRating = "helpful" | "not-helpful"`.
- Produces: `AnswerFeedback = { rating: FeedbackRating; comment: string; formOpen: boolean; submitted: boolean }`.
- Produces: controlled `AnswerActions` props for copy, rating selection, comment updates, submission, and cancellation.
- Consumes: assistant `message.id`, `messageText(message)`, and `navigator.clipboard.writeText`.

- [ ] **Step 1: Write failing answer action tests**

Add focused tests to `app/supply-chain-app.test.tsx`:

```ts
it("places copy and feedback actions below each generated answer", async () => {
  mockChatStreamWithMarkdownTable();
  render(<SupplyChainApp currentUser={mockUsers.logistics} />);

  fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
  const answer = await screen.findByRole("heading", { name: "Shipment options" });
  const copy = screen.getByRole("button", { name: "Copy answer" });

  expect(copy.closest(".answer-actions")).not.toBeNull();
  expect(answer.compareDocumentPosition(copy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getAllByRole("button", { name: "Mark answer as helpful" })).toHaveLength(1);
  expect(screen.getAllByRole("button", { name: "Mark answer as not helpful" })).toHaveLength(1);
});

it("copies the assistant answer and confirms only successful clipboard writes", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  mockChatStreamWithMarkdownTable();
  render(<SupplyChainApp currentUser={mockUsers.logistics} />);

  fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
  await screen.findByRole("heading", { name: "Shipment options" });
  fireEvent.click(screen.getByRole("button", { name: "Copy answer" }));

  await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
  expect(writeText.mock.calls[0][0]).toContain("Shipment options");
  expect(await screen.findByRole("button", { name: "Answer copied" })).toBeInTheDocument();
});

it("collects optional feedback and confirms submission", async () => {
  mockChatStreamWithMarkdownTable();
  render(<SupplyChainApp currentUser={mockUsers.logistics} />);

  fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
  await screen.findByRole("heading", { name: "Shipment options" });
  const helpful = screen.getByRole("button", { name: "Mark answer as helpful" });
  fireEvent.click(helpful);

  expect(helpful).toHaveAttribute("aria-pressed", "true");
  fireEvent.change(screen.getByLabelText("Optional feedback"), {
    target: { value: "Clear and useful." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));

  expect(screen.queryByLabelText("Optional feedback")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Feedback received");
});

it("cancels unsubmitted feedback and leaves user messages without answer actions", async () => {
  mockChatStreamWithMarkdownTable();
  render(<SupplyChainApp currentUser={mockUsers.logistics} />);

  fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
  await screen.findByRole("heading", { name: "Shipment options" });
  fireEvent.click(screen.getByRole("button", { name: "Mark answer as not helpful" }));
  fireEvent.change(screen.getByLabelText("Optional feedback"), {
    target: { value: "Needs a clearer recommendation." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cancel feedback" }));

  expect(screen.queryByLabelText("Optional feedback")).not.toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Copy answer" })).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Mark answer as not helpful" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});
```

Use this exact cleanup near the current test teardown so clipboard mocks remain isolated:

```ts
const originalClipboard = navigator.clipboard;

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: originalClipboard,
  });
});
```

Add a rejected-write case that uses `vi.fn().mockRejectedValue(new Error("Clipboard unavailable"))`, clicks `Copy answer`, waits for the rejected mock to be called, and verifies that no button named `Answer copied` appears.

After the successful feedback submission assertion, click `Clear conversation` and verify that `Feedback received` and all answer-action buttons disappear. This covers message feedback reset without introducing persistence.

- [ ] **Step 2: Run the focused UI tests and verify RED**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: FAIL because feedback buttons and the lower answer action row do not exist.

- [ ] **Step 3: Create the controlled answer actions component**

Create `app/answer-actions.tsx` with:

```tsx
"use client";

import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { useId, type FormEvent } from "react";

export type FeedbackRating = "helpful" | "not-helpful";

export type AnswerFeedback = {
  rating: FeedbackRating;
  comment: string;
  formOpen: boolean;
  submitted: boolean;
};

type AnswerActionsProps = {
  copied: boolean;
  feedback: AnswerFeedback | undefined;
  onCopy: () => void;
  onSelectFeedback: (rating: FeedbackRating) => void;
  onCommentChange: (comment: string) => void;
  onSubmitFeedback: () => void;
  onCancelFeedback: () => void;
};

export function AnswerActions({
  copied,
  feedback,
  onCopy,
  onSelectFeedback,
  onCommentChange,
  onSubmitFeedback,
  onCancelFeedback,
}: AnswerActionsProps) {
  const feedbackFieldId = useId();

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmitFeedback();
  }

  return (
    <div className="answer-action-region">
      <div className="answer-actions" aria-label="Answer actions">
        <button
          type="button"
          aria-label={copied ? "Answer copied" : "Copy answer"}
          title={copied ? "Answer copied" : "Copy answer"}
          onClick={onCopy}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </button>
        <button
          type="button"
          aria-label="Mark answer as helpful"
          title="Helpful"
          aria-pressed={feedback?.rating === "helpful"}
          onClick={() => onSelectFeedback("helpful")}
        >
          <ThumbsUp aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Mark answer as not helpful"
          title="Not helpful"
          aria-pressed={feedback?.rating === "not-helpful"}
          onClick={() => onSelectFeedback("not-helpful")}
        >
          <ThumbsDown aria-hidden="true" />
        </button>
      </div>
      {feedback?.formOpen && (
        <form className="answer-feedback-form" aria-label="Answer feedback" onSubmit={submitFeedback}>
          <label htmlFor={feedbackFieldId}>Optional feedback</label>
          <textarea
            id={feedbackFieldId}
            aria-label="Optional feedback"
            value={feedback.comment}
            placeholder="What worked or could be improved?"
            onChange={(event) => onCommentChange(event.target.value)}
          />
          <div>
            <button type="submit">Submit feedback</button>
            <button type="button" onClick={onCancelFeedback}>Cancel feedback</button>
          </div>
        </form>
      )}
      {feedback?.submitted && <p className="answer-feedback-status" role="status">Feedback received</p>}
    </div>
  );
}
```

- [ ] **Step 4: Integrate answer action state and resilient clipboard behavior**

In `app/supply-chain-app.tsx`:

```ts
import { AnswerActions, type AnswerFeedback, type FeedbackRating } from "./answer-actions";

const [answerFeedback, setAnswerFeedback] = useState<Record<string, AnswerFeedback>>({});
```

Remove `Copy` from the existing Lucide import, retain `Check` because approval and action notices also use it, remove the header copy button, and add these handlers:

```ts
async function copyAnswer(message: UIMessage) {
  const text = messageText(message);
  if (!text || typeof navigator.clipboard?.writeText !== "function") return;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return;
  }

  setCopiedMessageId(message.id);
  window.setTimeout(() => setCopiedMessageId((current) => (current === message.id ? "" : current)), 1800);
}

function selectAnswerFeedback(messageId: string, rating: FeedbackRating) {
  setAnswerFeedback((current) => ({
    ...current,
    [messageId]: {
      rating,
      comment: current[messageId]?.comment ?? "",
      formOpen: true,
      submitted: false,
    },
  }));
}

function updateAnswerFeedbackComment(messageId: string, comment: string) {
  setAnswerFeedback((current) => {
    const feedback = current[messageId];
    return feedback ? { ...current, [messageId]: { ...feedback, comment } } : current;
  });
}

function submitAnswerFeedback(messageId: string) {
  setAnswerFeedback((current) => {
    const feedback = current[messageId];
    return feedback
      ? { ...current, [messageId]: { ...feedback, formOpen: false, submitted: true } }
      : current;
  });
}

function cancelAnswerFeedback(messageId: string) {
  setAnswerFeedback((current) => {
    const remaining = { ...current };
    delete remaining[messageId];
    return remaining;
  });
}
```

Reset both `answerFeedback` and `copiedMessageId` in `resetRunState`. Render after assistant text:

```tsx
{message.role === "assistant" && messageText(message) && (
  <AnswerActions
    copied={copiedMessageId === message.id}
    feedback={answerFeedback[message.id]}
    onCopy={() => void copyAnswer(message)}
    onSelectFeedback={(rating) => selectAnswerFeedback(message.id, rating)}
    onCommentChange={(comment) => updateAnswerFeedbackComment(message.id, comment)}
    onSubmitFeedback={() => submitAnswerFeedback(message.id)}
    onCancelFeedback={() => cancelAnswerFeedback(message.id)}
  />
)}
```

- [ ] **Step 5: Style the compact lower-left action row and inline form**

Add theme-token-based rules to `app/globals.css`:

```css
.answer-action-region { display: grid; justify-items: start; gap: 7px; margin-top: 6px; }
.answer-actions { display: flex; align-items: center; gap: 2px; }
.answer-actions button { display: inline-grid; place-items: center; width: 28px; height: 28px; border: 0; border-radius: 5px; padding: 0; color: var(--muted); background: transparent; }
.answer-actions button:hover, .answer-actions button[aria-pressed="true"] { color: var(--ink); background: var(--panel-blue); }
.answer-actions button svg { width: 14px; height: 14px; }
.answer-feedback-form { display: grid; gap: 7px; width: min(100%, 420px); border: 1px solid var(--line); border-radius: 6px; padding: 10px; background: var(--surface-strong); }
.answer-feedback-form label { color: var(--muted); font-size: .68rem; font-weight: 650; }
.answer-feedback-form textarea { min-height: 70px; resize: vertical; border: 1px solid var(--line-strong); border-radius: 5px; padding: 8px; color: var(--ink); background: var(--white); font: inherit; font-size: .78rem; line-height: 1.4; }
.answer-feedback-form > div { display: flex; gap: 7px; }
.answer-feedback-form button { min-height: 30px; border: 1px solid var(--line); border-radius: 5px; padding: 5px 9px; color: var(--ink); background: var(--panel); font-size: .7rem; font-weight: 650; }
.answer-feedback-form button[type="submit"] { border-color: var(--indigo); color: var(--brand-foreground); background: var(--indigo); }
.message .answer-feedback-status { margin: 0; padding: 0; color: var(--success-ink); background: transparent; font-size: .68rem; font-weight: 650; }
```

- [ ] **Step 6: Run the focused UI tests and verify GREEN**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: PASS with no warnings.

- [ ] **Step 7: Run full verification**

Run: `npm test`

Expected: all Vitest tests pass.

Run: `npm run typecheck`

Expected: exit 0 with no TypeScript errors.

Run: `npm run build`

Expected: production build completes successfully.

- [ ] **Step 8: Commit the answer action slice**

```bash
git add app/answer-actions.tsx app/supply-chain-app.tsx app/supply-chain-app.test.tsx app/globals.css docs/superpowers/plans/2026-07-16-chat-answer-feedback-and-tool-deduplication.md
git commit -m "Add answer copy and feedback controls"
```
