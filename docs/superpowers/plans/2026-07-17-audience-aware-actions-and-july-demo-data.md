# Audience-Aware Actions and July Demo Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give initiators and recipients correct action wording throughout Supply Chain Hub, rename Lukas's Outlook connector to Microsoft Outlook, and refresh active mock dates to July 2026 / CW 30.

**Architecture:** Keep `WorkflowAction.label` as the initiator command and add a typed `recipientLabel` for recipient-facing tasks and approvals. A shared action-workflow helper exposes the recipient label to both server results and the UI; approval state stores both audience labels. Demo-source naming and dates remain centralized in `lib/demo-data.ts`, with stable connector IDs.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, React Testing Library

## Global Constraints

- Directed actions must target either an assignee or a reviewer, never both.
- Every action with `assigneePersona` or `reviewerPersona` must provide non-empty `recipientLabel` metadata.
- Sender menus, drafts, notices, requests, and submitted cards retain `label`.
- Recipient task cards and incoming approval cards use `recipientLabel`.
- Incoming pending status is `Review pending`; submitted pending status names the reviewer.
- Lukas sees `Microsoft Outlook`, while connector ID `outlook` remains unchanged.
- Active mock dates use 17 July 2026 and delivery week CW 30 (20–26 July 2026).
- Preserve unrelated dirty workspace changes.

---

### Task 1: General Recipient-Aware Action Model and API

**Files:**
- Modify: `lib/demo-data.ts`
- Modify: `lib/action-workflows.ts`
- Test: `lib/action-workflows.test.ts`

**Interfaces:**
- Produces: `getRecipientActionLabel(action: WorkflowAction): string`
- Produces: `ActionWorkflowResult.recipientActionLabel: string | null`
- Consumes: `WorkflowAction.label`, `recipientLabel`, `assigneePersona`, and `reviewerPersona`

- [ ] **Step 1: Write the failing action-model tests**

Add assertions that Dana's assignment resolves to `Run recovery check`, Lukas's approval resolves to `Review delivery risk summary`, Lucía's approval resolves to `Review six-build coverage exception`, and API results expose the same `recipientActionLabel`.

```ts
expect(getRecipientActionLabel(action!)).toBe("Run recovery check");
expect(result.recipientActionLabel).toBe("Run recovery check");

const reviewAction = buildAppContext("risks", "logistics").recommendedActions.find(
  (candidate) => candidate.label === "Write Dana Narid for review",
);
expect(getRecipientActionLabel(reviewAction!)).toBe("Review delivery risk summary");
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --run lib/action-workflows.test.ts`

Expected: FAIL because `getRecipientActionLabel` and `recipientActionLabel` do not exist.

- [ ] **Step 3: Implement the typed action metadata and resolver**

Replace `recipientTaskLabel` with `recipientLabel`. Use a union that requires `recipientLabel` on assignee/reviewer variants and prevents an action from targeting both. Add recipient labels to every directed action.

```ts
export function getRecipientActionLabel(action: WorkflowAction): string {
  return action.recipientLabel ?? action.label;
}
```

Return `recipientActionLabel` from `buildActionWorkflowResult`, or `null` for actions without recipient-specific copy.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- --run lib/action-workflows.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the action model**

```bash
git add lib/action-workflows.ts lib/action-workflows.test.ts
git add -p lib/demo-data.ts
git commit -m "Generalize recipient-facing action labels"
```

### Task 2: Audience-Aware Approval UI

**Files:**
- Modify: `app/supply-chain-app.tsx`
- Test: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: `getRecipientActionLabel(action)` and optional API `recipientActionLabel`
- Stores: `requesterActionLabel: string` and `reviewerActionLabel: string` per approval request

- [ ] **Step 1: Write the failing approval UI regression**

Extend the Lukas-to-Dana workflow test so Lukas's submitted card retains `Write Dana Narid for review` and `Pending review by Dana Narid`, while Dana's incoming card renders `Review delivery risk summary`, `Review pending`, and `Approve Review delivery risk summary`.

```tsx
expect(within(submitted).getByText("Write Dana Narid for review")).toBeInTheDocument();
expect(within(incoming).getByText("Review delivery risk summary")).toBeInTheDocument();
expect(within(incoming).getByText("Review pending")).toBeInTheDocument();
expect(within(incoming).getByRole("button", {
  name: "Approve Review delivery risk summary",
})).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused UI test and verify RED**

Run: `npm test -- --run app/supply-chain-app.test.tsx -t "only lets Lukas write Dana"`

Expected: FAIL because the incoming card still reuses the initiator label and reviewer-named pending status.

- [ ] **Step 3: Implement audience-specific request storage and rendering**

Populate both labels in optimistic and resolved approval flows. Incoming cards use `reviewerActionLabel` plus reviewer-relative status; submitted cards use `requesterActionLabel` plus requester-relative status. Personal tasks use the shared recipient-label helper. Preserve rejection cleanup.

- [ ] **Step 4: Run the UI workflow tests and verify GREEN**

Run: `npm test -- --run app/supply-chain-app.test.tsx -t "only lets Lukas write Dana|keeps approval controls|assigns Dana's recovery check|does not fabricate success|removes an optimistic approval"`

Expected: PASS.

- [ ] **Step 5: Commit the UI behavior**

```bash
git add app/supply-chain-app.tsx app/supply-chain-app.test.tsx
git commit -m "Render actions for their current audience"
```

### Task 3: Microsoft Outlook and July CW 30 Demo Refresh

**Files:**
- Modify: `lib/demo-data.ts`
- Modify: `lib/demo-data.test.ts`
- Modify: `lib/context.test.ts`
- Modify: `lib/chat.test.ts`
- Modify: `app/api/chat/route.test.ts`
- Modify: `app/api/actions/route.test.ts`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Preserves: source id `outlook`
- Changes: Lukas-visible source name to `Microsoft Outlook`
- Changes: Lukas action label to `Create Microsoft Outlook recovery task`
- Anchors: demo data to 17 July 2026 and CW 30

- [ ] **Step 1: Write failing source and calendar assertions**

```ts
expect(workflows.risks.sources).toContainEqual(
  expect.objectContaining({ id: "outlook", name: "Microsoft Outlook" }),
);
expect(workflows.risks.question).toContain("CW 30");
expect(workflows.risks.summary).toContain("23 July");
expect(JSON.stringify(workflows)).not.toMatch(/June|2026-06|24\.06\.21/);
```

Update the Lukas settings test to query `Microsoft Outlook` and retain the request-body assertion for source id `outlook`.

- [ ] **Step 2: Run the focused data/UI tests and verify RED**

Run: `npm test -- --run lib/demo-data.test.ts app/supply-chain-app.test.tsx -t "Monday delivery radar|shows role-aware tool settings"`

Expected: FAIL on the old Outlook name and June-era data.

- [ ] **Step 3: Refresh centralized mock content**

Update the risk workflow to CW 30 with FedEx due Tuesday 21 July, DHL moved from Wednesday 22 July to Thursday 23 July, and date labels using `Jul`/`July` consistently. Update the supplier workbook to version `26.07.17-rc3`, modifications on 16–17 July, and reviews/reservation deadlines on 20–24 July. Rename the Lukas-facing source/action copy without changing source IDs.

- [ ] **Step 4: Update dependent expectations**

Update exact prompt, action label, source name, workbook version, and streamed response fixtures across the listed tests. Do not change source-id payload expectations.

- [ ] **Step 5: Run the focused suite and verify GREEN**

Run: `npm test -- --run lib/demo-data.test.ts lib/context.test.ts lib/chat.test.ts app/api/chat/route.test.ts app/api/actions/route.test.ts app/supply-chain-app.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the source/date refresh**

Stage only this task's hunks, especially in already-dirty `lib/demo-data.ts` and `lib/context.test.ts`.

```bash
git add lib/demo-data.test.ts lib/chat.test.ts app/api/chat/route.test.ts app/api/actions/route.test.ts app/supply-chain-app.test.tsx
git add -p lib/demo-data.ts lib/context.test.ts
git commit -m "Refresh Outlook naming and July demo dates"
```

### Task 4: Completion Verification and Live Preview

**Files:**
- Verify only

- [ ] **Step 1: Audit active content**

Run: `rg -n -i "june|2026-06|24\\.06\\.21|Create Outlook|name: \"Outlook\"" app lib`

Expected: no stale active mock content; historical test names may contain the product concept only when explicitly testing absence.

- [ ] **Step 2: Run complete verification**

```bash
npm test
npm run typecheck
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Verify and expose the dev server**

Confirm `http://127.0.0.1:3000/` returns HTTP 200. Refresh the existing app tab when browser policy permits; otherwise report the live URL and required manual refresh.
