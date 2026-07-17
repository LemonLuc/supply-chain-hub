# Slide 03 Pain and Slide 08 Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn slide 03’s generic discovery questions into a tangible pain hypothesis and simplify slide 08 into a readable one-workflow value hypothesis with four POC decision gates.

**Architecture:** Keep audience-facing presentation content in `slides.md`, slide-scoped layout rules in `style.css`, and detailed calculations in `executive-presentation.md`. Protect the approved wording and removals with focused `slides.test.ts` assertions, then verify the complete Slidev deck and exported PDF.

**Tech Stack:** Slidev, HTML-in-Markdown, CSS, TypeScript, Vitest, Playwright-backed Slidev export, Poppler PDF inspection

## Global Constraints

- Keep the existing 11-slide sequence and established visual system.
- Keep slide 08 as one slide.
- Keep slide 03’s left-hand “Known operating context” panel unchanged.
- Do not present the working assumptions as verified ZEISS production facts.
- Show only the rounded `€0.2M–€0.3M` one-workflow hypothesis on slide 08; keep all detailed arithmetic in `executive-presentation.md`.
- Do not introduce new images, diagrams, visual assets or dependencies.
- Preserve the unrelated application changes currently present in the working tree; stage only the slide, style, test and runbook files named in this plan.
- Keep the local Slidev development server on port 3030 available for user review.

---

### Task 1: Lock the approved content with failing tests

**Files:**
- Modify: `slides.test.ts:1-70`
- Test: `slides.test.ts`

**Interfaces:**
- Consumes: `numberedSlide(number: string): string`, the raw `slides.md`, `style.css`, and `executive-presentation.md` files.
- Produces: regression coverage for the slide 03 pain hypothesis, slide 08’s rounded value and concise decision gates, removed dense copy, and the preserved talking-track arithmetic.

- [ ] **Step 1: Load the presenter runbook in the test module**

Add this constant after the existing `styles` constant:

```ts
const runbook = readFileSync(resolve(process.cwd(), "executive-presentation.md"), "utf8");
```

- [ ] **Step 2: Add the slide 03 pain-hypothesis regression test**

Insert this test after the numbered-slide-sequence test:

```ts
it("turns slide 03 discovery into a tangible working pain hypothesis", () => {
  const slide = numberedSlide("03");

  expect(slide).toContain("Working pain hypothesis from technical discovery");
  expect(slide).toContain("roughly 20 minutes spent reconciling SAP");
  expect(slide).toContain("scarce domain experts become the bottleneck");
  expect(slide).toContain("avoidable expedite spend, schedule churn");
  expect(slide).not.toContain("Which disruptions consume the most time?");
  expect(slide).not.toContain("Where do handoffs reduce accuracy or predictability?");
  expect(slide).not.toContain(
    "Which recommendations need evidence, review and traceability?",
  );
});
```

- [ ] **Step 3: Replace the outdated slide 08 value test**

Replace `shows a euro-only value hypothesis and explicit ROI gate on slide 08` with:

```ts
it("scopes slide 08 value to one workflow without visible formulas", () => {
  const slide = numberedSlide("08");

  expect(slide).toContain("Validate value and control before scaling one workflow");
  expect(slide).toContain("Annual value hypothesis · one workflow");
  expect(slide).toContain("€0.2M–€0.3M");
  expect(slide).toContain("Faster risk review");
  expect(slide).toContain("Fewer urgent expedites");
  expect(slide).toContain("Lower disruption exposure");
  expect(slide).toContain("ZEISS confirms the baseline, attribution and annual run cost");
  expect(slide).not.toMatch(/€180K–€310K|€15K–€25K|€101K–€151K|€65K–€130K/);
  expect(slide).not.toContain("Net ROI =");
  expect(slide).not.toContain("× €");
  expect(slide).not.toContain("$");
});
```

- [ ] **Step 4: Replace the verbose-proof-plan test with concise decision-gate coverage**

Replace `explains the slide 08 proof plan in buyer language` with:

```ts
it("shows four concise POC decision gates on slide 08", () => {
  const slide = numberedSlide("08");

  expect(slide).toContain("POC decision gates");
  expect(slide).toContain(
    "Test routine cases, high-impact exceptions and permission boundaries",
  );
  expect(slide).toContain("≥25% faster review · ≥80% useful");
  expect(slide).toContain("≥90% source-backed · &lt;5% serious risks missed");
  expect(slide).toContain("≥95% correct approved system and workflow");
  expect(slide).toContain("100% human review for high-impact actions");
  expect(slide).not.toContain("Agree realistic test scenarios");
  expect(slide).not.toContain("Compare each answer and proposed action");
  expect(slide).not.toContain("Review failures together");
});
```

- [ ] **Step 5: Update the styling-hook test and add talking-track coverage**

Replace the slide 08 hook assertions inside `includes scoped styling hooks for the revised layouts` and add a separate talking-track test:

```ts
it("includes scoped styling hooks for the revised layouts", () => {
  expect(styles).toContain(".deployment-constraints");
  expect(styles).toContain(".roi-panel");
  expect(styles).toContain(".value-levers");
  expect(styles).toContain(".decision-gates");
  expect(styles).not.toContain(".proof-steps");
  expect(styles).not.toContain(".buyer-gates");
  expect(styles).not.toContain(".openai-data-note");
});

it("keeps slide 08 arithmetic in the presenter talking track", () => {
  expect(runbook).toContain("600–1,000 reviews × 20 minutes saved × €75 per hour");
  expect(runbook).toContain("12–18 avoided cases × €8,400");
  expect(runbook).toContain(
    "0.35–0.70 probability-weighted events × €185,000",
  );
  expect(runbook).toContain("€181K–€306K");
  expect(runbook).toContain("one repeatable workflow");
  expect(runbook).toContain("not enterprise-wide ZEISS value");
});
```

- [ ] **Step 6: Run the focused test and confirm the red state**

Run:

```bash
npm test -- slides.test.ts
```

Expected: FAIL because slides 03 and 08 still contain the old copy, `executive-presentation.md` does not contain the preserved arithmetic, and `style.css` still uses `.proof-steps` and `.buyer-gates`.

- [ ] **Step 7: Commit only the failing regression test**

```bash
git add slides.test.ts
git commit -m "Test concise discovery and value slides"
```

Expected: the commit contains only `slides.test.ts`; unrelated application files remain unstaged.

---

### Task 2: Replace the visible slide copy and preserve the talking track

**Files:**
- Modify: `slides.md:43-66`
- Modify: `slides.md:141-175`
- Modify: `executive-presentation.md:49-63`
- Modify: `executive-presentation.md:157-166`
- Test: `slides.test.ts`

**Interfaces:**
- Consumes: the existing `.customer-slide`, `.split-60`, `.validation-layout`, `.roi-panel`, and `.evaluation-panel` structures.
- Produces: `.value-levers`, `.gate-context`, and `.decision-gates` markup for Task 3; a runbook that retains the detailed value assumptions removed from the slide.

- [ ] **Step 1: Replace slide 03’s generic discovery questions**

Keep the existing left-hand `.statement-panel` unchanged. Replace only the `.assumption-list` element with:

```html
<div class="assumption-list">
  <h2>Working pain hypothesis from technical discovery</h2>
  <ul>
    <li>Risk reviews can start with roughly 20 minutes spent reconciling SAP, supplier, logistics and workbook updates before a decision can begin.</li>
    <li>When sources conflict, scarce domain experts become the bottleneck and escalation quality depends on who is available.</li>
    <li>The result is slower mitigation, avoidable expedite spend, schedule churn and unclear approval ownership.</li>
  </ul>
</div>
```

- [ ] **Step 2: Replace slide 08 with the approved one-workflow scorecard**

Replace the content from `.poc-note` through `.validation-layout` with:

```html
<p class="poc-note">Validate value and control before scaling one workflow.</p>
<div class="validation-layout">
  <div class="validation-panel roi-panel">
    <span>1</span>
    <h2>Annual value hypothesis · one workflow</h2>
    <strong class="roi-total">€0.2M–€0.3M</strong>
    <ul class="value-levers">
      <li>Faster risk review</li>
      <li>Fewer urgent expedites</li>
      <li>Lower disruption exposure</li>
    </ul>
    <p class="roi-gate">ZEISS confirms the baseline, attribution and annual run cost.</p>
  </div>
  <div class="criteria-panel evaluation-panel">
    <span>2</span>
    <h2>POC decision gates</h2>
    <p class="gate-context">Test routine cases, high-impact exceptions and permission boundaries.</p>
    <div class="decision-gates">
      <div><b>Process</b><p>≥25% faster review · ≥80% useful</p></div>
      <div><b>Decision quality</b><p>≥90% source-backed · &lt;5% serious risks missed</p></div>
      <div><b>Technical reliability</b><p>≥95% correct approved system and workflow</p></div>
      <div><b>Governance</b><p>100% human review for high-impact actions</p></div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Add the technical-discovery bridge to the presenter runbook**

Insert this passage after the current-state-pain core line in `executive-presentation.md`:

```markdown
Slide 03 discovery bridge:

"In our initial technical discovery, the pain was not a lack of dashboards. The working hypothesis is that a risk review can begin with roughly 20 minutes of reconciling SAP, supplier, logistics and workbook updates. When those sources conflict, scarce domain experts become the bottleneck. Mitigation starts later, while expedite spend, schedule churn and approval ambiguity increase. The POC must now validate that baseline with ZEISS rather than treat it as a proven production fact."
```

- [ ] **Step 4: Add the slide 08 value arithmetic to the presenter runbook**

Insert this section immediately before `### 27:00-30:00 - Close And Next Step`:

```markdown
#### Slide 08: POC Value And Decision Gates

Frame the headline as a conservative hypothesis for one repeatable workflow, not enterprise-wide ZEISS value:

- Faster review work: 600–1,000 reviews × 20 minutes saved × €75 per hour = approximately €15K–€25K.
- Fewer urgent expedites: 12–18 avoided cases × €8,400 = approximately €101K–€151K.
- Lower disruption exposure: 0.35–0.70 probability-weighted events × €185,000 = approximately €65K–€130K.
- Combined value: approximately €181K–€306K, rounded on the slide to €0.2M–€0.3M.

Core line:

"For an organization of ZEISS’s scale, this is intentionally narrow. It is the value hypothesis for one workflow or operating scope. ZEISS still needs to confirm the baseline, attribution, annual run cost and rollout scope before we extrapolate."

Close on the four gates: process improvement, decision quality, technical reliability and accountable human review for every high-impact action.
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
npm test -- slides.test.ts
```

Expected: the content and talking-track assertions pass; the styling-hook test remains red until Task 3 replaces the old slide 08 CSS selectors.

- [ ] **Step 6: Commit only the copy and runbook updates**

```bash
git add slides.md executive-presentation.md
git commit -m "Clarify discovery pain and POC value"
```

Expected: the commit contains only `slides.md` and `executive-presentation.md`; unrelated application files remain unstaged.

---

### Task 3: Rebalance the slide 03 and slide 08 layouts

**Files:**
- Modify: `style.css:458-521`
- Modify: `style.css:1052-1062`
- Modify: `style.css:1168-1338`
- Modify: `style.css:1960-2010`
- Test: `slides.test.ts`

**Interfaces:**
- Consumes: Task 2’s `.value-levers`, `.gate-context`, and `.decision-gates` markup.
- Produces: slide-scoped, print-safe presentation styling without `.roi-caption`, `.roi-drivers`, `.proof-steps`, or `.buyer-gates`.

- [ ] **Step 1: Give slide 03’s longer pain hypothesis sufficient height**

Replace the current customer-slide panel sizing and text rules with:

```css
.customer-slide .statement-panel,
.customer-slide .assumption-list {
  align-content: start;
  display: grid;
  gap: 10px;
  height: 272px;
  justify-content: flex-start;
  min-height: 0;
  padding: 22px;
}

.customer-slide h2 {
  font-size: 16px;
  line-height: 1.2;
}

.customer-slide ul {
  gap: 8px;
}

.customer-slide li {
  font-size: 13.8px;
  line-height: 1.32;
  padding-left: 20px;
}
```

Keep `.customer-slide .split-60`, `.zeiss-logo`, `.customer-slide li::before`, and `.statement-panel` unchanged.

- [ ] **Step 2: Increase slide 08 whitespace and card balance**

Use these slide-scoped layout values:

```css
.poc-slide {
  gap: 14px;
  grid-template-rows: 18px 48px auto auto;
}

.poc-slide .poc-note {
  font-size: 14px !important;
  line-height: 1.25;
  margin-top: -2px;
  padding: 11px 17px;
}

.poc-slide .validation-layout {
  gap: 18px;
  grid-template-columns: 0.9fr 1.1fr;
  margin-top: -8px;
  width: min(100%, 940px);
}

.roi-panel,
.evaluation-panel {
  min-height: 292px;
  padding: 22px 24px;
}

.roi-panel > span,
.evaluation-panel > span {
  margin-bottom: 12px;
}

.roi-panel h2,
.evaluation-panel h2 {
  font-size: 16px;
  line-height: 1.2;
  margin-bottom: 12px;
}

.roi-panel .roi-total {
  color: var(--blue);
  display: block;
  font-size: 34px;
  font-weight: 720;
  letter-spacing: -0.03em;
  line-height: 1;
}
```

- [ ] **Step 3: Replace the dense value-driver styling with a flat list**

Delete `.roi-caption`, all `.roi-drivers` rules, and the old `.roi-gate strong` rule. Replace the old `.roi-gate` block with:

```css
.value-levers {
  display: grid;
  gap: 11px;
  list-style: none;
  margin: 24px 0 20px;
  padding: 0;
}

.value-levers li {
  border-left: 3px solid rgba(11, 77, 255, 0.72);
  color: var(--ink);
  font-size: 14px;
  font-weight: 640;
  line-height: 1.2;
  padding: 3px 0 3px 12px;
}

.value-levers li::before {
  content: none;
}

.roi-gate {
  border-top: 1px solid rgba(16, 16, 16, 0.12);
  color: var(--muted);
  font-size: 11.5px !important;
  font-weight: 520;
  line-height: 1.28 !important;
  margin-top: auto;
  padding-top: 12px;
}
```

- [ ] **Step 4: Replace proof-step and buyer-gate styling with four readable gates**

Delete every `.proof-steps` and `.buyer-gates` rule. Replace `.criteria-panel.evaluation-panel`, `.release-gates`, and `.evaluation-panel .release-gates > div` with:

```css
.criteria-panel.evaluation-panel {
  display: block;
}

.gate-context {
  color: var(--muted);
  font-size: 12px !important;
  line-height: 1.3 !important;
  margin: 0 0 15px;
}

.decision-gates {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.decision-gates > div {
  background: rgba(11, 77, 255, 0.045);
  border-top: 3px solid rgba(11, 77, 255, 0.65);
  min-height: 82px;
  padding: 13px 14px;
}

.decision-gates b {
  color: var(--ink);
  display: block;
  font-size: 12px;
  line-height: 1.15;
  margin-bottom: 8px;
}

.decision-gates p {
  color: var(--blue);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.22;
}
```

Remove the generic `.release-gates` rule as well; `slides.md` has no remaining markup use after Task 2.

- [ ] **Step 5: Update the print selector list**

In the `.print-slide-container` selector group, remove:

```css
.print-slide-container .roi-drivers > div,
.print-slide-container .proof-steps > div,
.print-slide-container .release-gates > div,
```

Add:

```css
.print-slide-container .decision-gates > div,
```

Do not add `.value-levers` because it has no filled background or shadow.

- [ ] **Step 6: Run the focused presentation tests**

Run:

```bash
npm test -- slides.test.ts
```

Expected: PASS with all slide content, removal, style-hook and runbook assertions green.

- [ ] **Step 7: Commit only the layout update**

```bash
git add style.css
git commit -m "Rebalance discovery and POC slides"
```

Expected: the commit contains only `style.css`; unrelated application files remain unstaged.

---

### Task 4: Verify, export and refresh the live review

**Files:**
- Modify: `Supply_Chain_Hub_Lucie.pdf`
- Verify: `slides.md`
- Verify: `style.css`
- Verify: `slides.test.ts`
- Verify: `executive-presentation.md`

**Interfaces:**
- Consumes: the completed Slidev deck and running server on `http://localhost:3030`.
- Produces: a validated 11-page PDF and visually inspected live slides 03 and 08.

- [ ] **Step 1: Run the full automated verification suite**

Run:

```bash
npm test
npm run typecheck
npm run slides:build
```

Expected: all Vitest tests pass, TypeScript exits with code 0, and Slidev builds `dist-slidev` without errors.

- [ ] **Step 2: Export the refreshed PDF**

Run:

```bash
npx slidev export slides.md --output Supply_Chain_Hub_Lucie.pdf --timeout 120000
```

Expected: Slidev writes `Supply_Chain_Hub_Lucie.pdf` successfully.

- [ ] **Step 3: Confirm the PDF page count**

Run:

```bash
pdfinfo Supply_Chain_Hub_Lucie.pdf
```

Expected: `Pages: 11`.

- [ ] **Step 4: Render the affected PDF pages for full-size inspection**

Run:

```bash
mkdir -p /tmp/supply-chain-slide-qa
pdftoppm -f 3 -l 3 -png -r 160 Supply_Chain_Hub_Lucie.pdf /tmp/supply-chain-slide-qa/slide-03
pdftoppm -f 8 -l 8 -png -r 160 Supply_Chain_Hub_Lucie.pdf /tmp/supply-chain-slide-qa/slide-08
```

Expected: `/tmp/supply-chain-slide-qa/slide-03-3.png` and `/tmp/supply-chain-slide-qa/slide-08-8.png` exist.

- [ ] **Step 5: Inspect slides 03 and 08 at full size**

Open both rendered PNGs with the local image viewer. Confirm:

- No clipping, overlapping text, unexpected wrapping or collision with the slide number.
- Slide 03’s three pain statements read in a clear causal sequence and use the same body size as the left panel.
- Slide 08 visibly leads with `€0.2M–€0.3M`, shows only three value levers, and gives the four gates equal visual weight.
- No detailed arithmetic or component euro range is visible on slide 08.

Expected: both pages pass all four checks. If a check fails, adjust only the relevant slide-scoped CSS value, rerun `npm test -- slides.test.ts`, re-export, and reinspect the affected page before continuing.

- [ ] **Step 6: Confirm the live Slidev server reflects the edits**

Navigate the existing in-app browser tab to:

```text
http://localhost:3030/3
```

Inspect slide 03, then navigate to:

```text
http://localhost:3030/8
```

Inspect slide 08 and leave the browser on slide 08 for user review.

Expected: the live server shows the same approved content and layout as the exported PDF.

- [ ] **Step 7: Commit the refreshed PDF only after visual QA passes**

```bash
git add Supply_Chain_Hub_Lucie.pdf
git commit -m "Refresh discovery and POC presentation"
```

Expected: the commit contains only `Supply_Chain_Hub_Lucie.pdf`; unrelated application files remain unstaged.

- [ ] **Step 8: Report verification evidence and hand off the live preview**

Report the exact Vitest pass count, successful typecheck, successful Slidev build, 11-page PDF confirmation, and visual inspection result for slides 03 and 08. Link the updated `slides.md`, `executive-presentation.md`, and PDF, and point the user to the live preview at `http://localhost:3030/8`.
