# ZEISS-Inspired Intranet Workflow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an intranet-ready Supply Chain Hub mockup with server-derived identity, realistic before/with-OpenAI workflows, and a ZEISS-inspired operational design.

**Architecture:** Resolve the mock user on the server and derive chat permissions from that session rather than browser input. Extend typed workflow data with manual-process and integrated-process content, then render a compact transformation band inside the existing React workspace.

**Tech Stack:** Next.js App Router, React, TypeScript, Vercel AI SDK, Lucide, Vitest, Testing Library.

---

### Task 1: Server-Derived Mock Identity

**Files:**
- Create: `lib/auth.ts`
- Create: `lib/auth.test.ts`
- Modify: `app/page.tsx`
- Modify: `app/api/chat/route.ts`
- Modify: `app/api/chat/route.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: Write failing identity tests**

```ts
expect(getCurrentUser({ DEMO_USER_ROLE: undefined })).toMatchObject({
  name: "Lukas Weber",
  persona: "logistics",
});
expect(getCurrentUser({ DEMO_USER_ROLE: "procurement" })).toMatchObject({
  name: "Anna Keller",
  persona: "procurement",
});
expect(getCurrentUser({ DEMO_USER_ROLE: "admin" }).persona).toBe("logistics");
```

Update route tests so a browser-provided `persona: "procurement"` cannot reveal impact while the server mock role is logistics.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- lib/auth.test.ts app/api/chat/route.test.ts`
Expected: FAIL because `getCurrentUser` does not exist and the route trusts browser persona.

- [ ] **Step 3: Implement the identity adapter**

```ts
export type CurrentUser = {
  name: string;
  initials: string;
  role: string;
  businessUnit: string;
  persona: PersonaId;
};

export function getCurrentUser(env = process.env): CurrentUser {
  return env.DEMO_USER_ROLE === "procurement" ? procurementUser : logisticsUser;
}
```

Resolve the user in `app/page.tsx`, pass it to `SupplyChainApp`, and use `getCurrentUser().persona` in `/api/chat`. Add `DEMO_USER_ROLE=logistics` to `.env.example`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- lib/auth.test.ts app/api/chat/route.test.ts`
Expected: PASS.

### Task 2: Realistic Workflow Data

**Files:**
- Modify: `lib/demo-data.ts`
- Modify: `lib/context.test.ts`
- Modify: `lib/chat.test.ts`

- [ ] **Step 1: Write failing workflow data tests**

```ts
expect(workflows.risks.before).toContain("SAP");
expect(workflows.delay.question).toContain("14 days");
expect(workflows.consolidate.withHub).toContain("guardrail");
expect(workflows.risks.suggestedPrompts).toHaveLength(3);
expect(workflows.risks).not.toHaveProperty("talk");
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- lib/context.test.ts lib/chat.test.ts`
Expected: FAIL because the transformation fields do not exist.

- [ ] **Step 3: Extend workflow types and synthetic data**

Add `before`, `beforeSystems`, `withHub`, `hubSteps`, `sourceStatus`, and `suggestedPrompts` to each workflow. Remove `talk`. Update supplier categories to optics/optoelectronics examples and convert currency strings to EUR.

```ts
beforeSystems: ["SAP S/4HANA", "Supplier portals", "Excel scorecards", "Email & quality notices"],
hubSteps: [
  ["Retrieve", "Authorized ERP, supplier, quality and logistics records"],
  ["Reconcile", "Normalize suppliers, parts, dates and conflicting signals"],
  ["Decide", "Rank exposure and propose human-owned actions"],
],
```

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- lib/context.test.ts lib/chat.test.ts`
Expected: PASS.

### Task 3: Operational UI And Brand System

**Files:**
- Modify: `app/supply-chain-app.tsx`
- Modify: `app/supply-chain-app.test.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write failing UI tests**

```tsx
render(<SupplyChainApp currentUser={logisticsUser} />);
expect(screen.getByText("Lukas Weber")).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "Ask Supply Chain Hub" })).toBeInTheDocument();
expect(screen.getByText("Before")).toBeInTheDocument();
expect(screen.getByText("With Supply Chain Hub")).toBeInTheDocument();
expect(screen.queryByText("Talk track")).not.toBeInTheDocument();
expect(screen.queryByLabelText("Persona")).not.toBeInTheDocument();
```

Switch workflows and verify the 14-day delay and procurement guardrail narratives render.

- [ ] **Step 2: Run UI tests and verify RED**

Run: `npm test -- app/supply-chain-app.test.tsx`
Expected: FAIL on the missing user and transformation UI and old product language.

- [ ] **Step 3: Implement the redesigned workspace**

Pass `currentUser` into the client component. Remove persona state, selector, browser persona request data, and the Talk track section. Render a read-only identity panel and a two-column workflow transformation band. Use workflow-specific suggested prompts.

Replace visual tokens with:

```css
--indigo: #0f2db3;
--azure: #0072ef;
--violet: #8f3cfb;
--lime: #d9e906;
--black: #000000;
--white: #ffffff;
```

Keep white/black dominant, Azure for interaction, Indigo for restrained identity, and Lime only for source freshness.

- [ ] **Step 4: Run UI tests and verify GREEN**

Run: `npm test -- app/supply-chain-app.test.tsx`
Expected: PASS.

### Task 4: Documentation And Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document mock SSO and workflow positioning**

Document `DEMO_USER_ROLE`, the server-derived identity boundary, the replacement path for Entra ID/Okta, and the three before/with-OpenAI workflows.

- [ ] **Step 2: Run complete automated verification**

Run: `npm test`
Expected: all tests pass.

Run: `npm run typecheck`
Expected: exit 0.

Run: `npm run build`
Expected: production build succeeds.

- [ ] **Step 3: Browser verification**

Verify the open localhost page hot-reloads, shows the signed-in user, contains no Persona selector or Talk track, renders all workflow transformations, and has no console errors or horizontal page overflow at 1280px and 390px.

## Self-Review

The plan covers server-derived identity, least-privilege chat context, realistic workflow transformation content, product renaming, Talk track removal, ZEISS-inspired colors, documentation, and responsive verification. Types and persona names remain consistent across tasks. No production SSO credentials or live enterprise integrations are introduced.
