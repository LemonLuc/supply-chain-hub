# Recipient-Facing Task Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make assigned personal tasks use executable recipient-facing titles while preserving sender-facing action labels and audit notices.

**Architecture:** Add optional `recipientTaskLabel` metadata to `WorkflowAction`. The action menu, action API, draft, and assignment notice continue using `label`; personal task creation uses `recipientTaskLabel ?? label`. Existing custom Outlook task copy moves into the same metadata path.

**Tech Stack:** Next.js, React, TypeScript, Vitest, React Testing Library.

## Global Constraints

- Dana’s action remains `Assign recovery check to logistics`.
- Lukas’s personal task is titled `Run recovery check`.
- Assignment ownership remains the logistics persona / Lukas Weber.
- Assignment notices, drafts, permissions, and rejection behavior remain unchanged.
- Actions without recipient-facing metadata retain their existing title.
- Preserve unrelated working-tree changes.

---

### Task 1: Distinguish sender actions from recipient tasks

**Files:**
- Modify: `app/supply-chain-app.test.tsx`
- Modify: `lib/demo-data.ts`
- Modify: `app/supply-chain-app.tsx`

**Interfaces:**
- Consumes: `WorkflowAction`, `applyActionResult`, and the existing persona-owned `PersonalTask` collection.
- Produces: `WorkflowAction.recipientTaskLabel?: string` and recipient-facing personal task titles.

- [ ] **Step 1: Write the failing persona-switch regression test**

In the existing `assigns Dana's recovery check directly to Lukas` test, scope assertions to the personal task list after switching to Lukas:

```tsx
const taskList = screen.getByLabelText("Personal task list");
expect(within(taskList).getByText("Run recovery check")).toBeInTheDocument();
expect(
  within(taskList).queryByText("Assign recovery check to logistics"),
).not.toBeInTheDocument();

fireEvent.click(
  within(taskList).getByRole("button", { name: "Mark Run recovery check done" }),
);
expect(within(taskList).getByText("Done")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and verify red**

Run:

```bash
npm test -- --run app/supply-chain-app.test.tsx -t "assigns Dana's recovery check directly to Lukas"
```

Expected: FAIL because the personal task currently renders `Assign recovery check to logistics`.

- [ ] **Step 3: Add declarative recipient-facing labels**

Extend the action type in `lib/demo-data.ts`:

```ts
export type WorkflowAction = {
  label: string;
  recipientTaskLabel?: string;
  detail: string;
  kind: "draft" | "update" | "share" | "approval";
  sourceIds?: string[];
  allowedPersonas?: PersonaId[];
  assigneePersona?: PersonaId;
  reviewerPersona?: PersonaId;
};
```

Set the two task-producing actions:

```ts
{
  label: "Create Outlook recovery task",
  recipientTaskLabel: "Track DHL confirmation, FedEx backup status and Oberkochen receiving cutoff with Supply Chain Hub",
  // existing fields unchanged
}

{
  label: "Assign recovery check to logistics",
  recipientTaskLabel: "Run recovery check",
  // existing fields unchanged
}
```

- [ ] **Step 4: Use the recipient label when creating a personal task**

Replace the label-specific UI branch in `app/supply-chain-app.tsx` with:

```ts
function personalTaskTitle(action: WorkflowAction) {
  return action.recipientTaskLabel ?? action.label;
}
```

- [ ] **Step 5: Run focused tests and verify green**

Run:

```bash
npm test -- --run app/supply-chain-app.test.tsx lib/action-workflows.test.ts lib/demo-data.test.ts
```

Expected: PASS, including task completion through `Mark Run recovery check done`.

- [ ] **Step 6: Run static and full regression verification**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all tests pass, TypeScript exits 0, and the Next.js production build succeeds.

- [ ] **Step 7: Commit the implementation**

```bash
git add app/supply-chain-app.test.tsx app/supply-chain-app.tsx lib/demo-data.ts
git commit -m "Show recipient-facing assigned task labels"
```

- [ ] **Step 8: Refresh and verify the development server**

Confirm `http://127.0.0.1:3000/` returns HTTP 200 and leave the finished app open in the development server.
