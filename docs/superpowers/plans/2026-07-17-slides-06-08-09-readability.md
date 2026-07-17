# Slides 06, 08, and 09 Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make slides 06, 08, and 09 clearer for a live buyer conversation while preserving the 11-slide Slidev deck and its visual system.

**Architecture:** Keep all audience-facing content in `slides.md`, keep slide-scoped layout rules in `style.css`, and protect the approved wording and removals with `slides.test.ts`. Reuse the existing two-card scorecard on slide 08, but replace its four-part evaluation shorthand with a three-step proof plan and plain-language owned gates.

**Tech Stack:** Slidev, Vue-rendered HTML, CSS, TypeScript, Vitest, Playwright-backed Slidev export

## Global Constraints

- Slide 08 remains one slide.
- Keep the deck at 11 slides and preserve the existing numbered-slide sequence.
- Do not use “SME-labelled gold set,” “graders,” “trace + SME review,” “regression set,” “false negatives,” or “tool / trace path” as visible slide copy.
- Remove the OpenAI data-control note from slide 06.
- Remove the collaboration sentence and lean-customer-core sentence from slide 09.
- Keep the local Slidev development server available on port 3030 for review.

---

### Task 1: Lock the requested copy changes with failing tests

**Files:**
- Modify: `slides.test.ts:17-70`
- Test: `slides.test.ts`

**Interfaces:**
- Consumes: `numberedSlide(number: string): string`
- Produces: regression checks for slides 06, 08, and 09 and for the new `.proof-steps` / `.buyer-gates` styling hooks

- [ ] **Step 1: Replace the outdated content assertions**

Use these assertions in the existing test suite:

```ts
it("keeps slide 06 deployment constraints concise", () => {
  const slide = numberedSlide("06");

  expect(slide).toContain("Deployment constraints to validate");
  expect(slide).toContain("Data &amp; privacy");
  expect(slide).toContain("Identity &amp; governance");
  expect(slide).toContain("Operations &amp; adoption");
  expect(slide).not.toContain("OpenAI data control");
  expect(slide).not.toContain("API data is not used for model training");
});

it("explains the slide 08 proof plan in buyer language", () => {
  const slide = numberedSlide("08");

  expect(slide).toContain("Agree realistic test scenarios");
  expect(slide).toContain("Compare each answer and proposed action");
  expect(slide).toContain("Review failures together");
  expect(slide).toContain("Business value · Process owner");
  expect(slide).toContain("Decision quality · Supply-chain lead");
  expect(slide).toContain("Technical reliability · IT / AI owner");
  expect(slide).toContain("Governance · Risk owner");
  expect(slide).not.toMatch(/SME-labelled gold set|Graders|Trace \+ SME review|Regression set/);
  expect(slide).not.toMatch(/false negatives|tool \/ trace path/);
});

it("removes the closing filler from slide 09", () => {
  const slide = numberedSlide("09");

  expect(slide).toContain("After the POC");
  expect(slide).toContain("How OpenAI can support adoption");
  expect(slide).not.toContain("Looking forward to shaping the collaboration");
  expect(slide).not.toContain("Lean customer core");
});

it("includes scoped styling hooks for the revised layouts", () => {
  expect(styles).toContain(".deployment-constraints");
  expect(styles).toContain(".roi-panel");
  expect(styles).toContain(".proof-steps");
  expect(styles).toContain(".buyer-gates");
  expect(styles).not.toContain(".openai-data-note");
});
```

Keep the numbered-slide and euro-value tests unchanged.

- [ ] **Step 2: Run the focused test and confirm red state**

Run: `npm test -- slides.test.ts`

Expected: FAIL because the current deck still contains the removed strings and does not contain the buyer-language proof-plan copy or styling hooks.

- [ ] **Step 3: Commit the failing regression test**

```bash
git add slides.test.ts
git commit -m "Test slide readability refinements"
```

---

### Task 2: Replace the visible slide copy and markup

**Files:**
- Modify: `slides.md:108-210`
- Test: `slides.test.ts`

**Interfaces:**
- Consumes: the existing `.decision-workflow-slide`, `.poc-slide`, `.roi-panel`, `.evaluation-panel`, `.proof-slide`, and `.post-poc-panel` presentation structure
- Produces: `.proof-steps` and `.buyer-gates` markup for slide 08; two-row `.post-poc-panel` markup for slide 09

- [ ] **Step 1: Remove slide 06’s data-control note**

Delete this element and leave the three deployment-constraint columns intact:

```html
<p class="openai-data-note"><strong>OpenAI data control:</strong> API data is not used for model training unless the customer opts in. Retention and residency depend on eligible project, endpoint and configuration.</p>
```

- [ ] **Step 2: Replace slide 08 with buyer-facing value and proof language**

Replace the content from the current `.poc-note` through `.validation-layout` with:

```html
<p class="poc-note">Validate a credible business case and earn a scale decision by testing real supply-chain scenarios with ZEISS business and IT owners.</p>
<div class="validation-layout">
  <div class="validation-panel roi-panel">
    <span>1</span>
    <h2>Business value to validate</h2>
    <strong class="roi-total">€180K–€310K</strong>
    <p class="roi-caption">Illustrative annual gross value. The POC will confirm actual review volumes, expedite costs and disruption exposure against the ZEISS baseline.</p>
    <div class="roi-drivers">
      <div><b>€15K–€25K</b><p>Faster review work</p><small>600–1,000 reviews × 20 minutes saved × €75/hour</small></div>
      <div><b>€101K–€151K</b><p>Fewer urgent expedites</p><small>12–18 avoided cases × €8,400</small></div>
      <div><b>€65K–€130K</b><p>Lower disruption exposure</p><small>0.35–0.70 probability-weighted events × €185,000</small></div>
    </div>
    <p class="roi-gate"><strong>Scale decision</strong> ZEISS confirms measured benefit and annual solution cost before rollout. Net ROI = (validated benefit − annualized solution cost) ÷ annualized solution cost.</p>
  </div>
  <div class="criteria-panel evaluation-panel">
    <span>2</span>
    <h2>How the POC earns a scale decision</h2>
    <div class="proof-steps">
      <div><b>1</b><p><strong>Agree realistic test scenarios.</strong> Business and IT select routine cases, high-impact exceptions and permission boundaries.</p></div>
      <div><b>2</b><p><strong>Compare each answer and proposed action.</strong> Check the supporting evidence, serious-risk coverage, approved systems and required human approvals.</p></div>
      <div><b>3</b><p><strong>Review failures together.</strong> Correct the workflow and rerun the same scenarios before release.</p></div>
    </div>
    <div class="release-gates buyer-gates">
      <div><b>Business value · Process owner</b><p>At least 25% faster review work and at least 80% user usefulness.</p></div>
      <div><b>Decision quality · Supply-chain lead</b><p>At least 90% supported by approved sources and fewer than 5% of serious risks missed.</p></div>
      <div><b>Technical reliability · IT / AI owner</b><p>At least 95% of runs use the correct approved systems and workflow.</p></div>
      <div><b>Governance · Risk owner</b><p>Every sensitive or high-impact action receives accountable human review.</p></div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Remove the two slide 09 filler elements**

Delete the `.time-value-footer` block from `.post-poc-panel` and delete the final `.collaboration-note` paragraph. Do not alter the timeline, adoption path, or OpenAI support copy.

- [ ] **Step 4: Run the focused content tests**

Run: `npm test -- slides.test.ts`

Expected: the content assertions pass; the styling-hook assertion still fails until Task 3 adds `.proof-steps` and `.buyer-gates` and removes `.openai-data-note` CSS.

- [ ] **Step 5: Commit the copy and markup**

```bash
git add slides.md
git commit -m "Rewrite POC scorecard for buyers"
```

---

### Task 3: Rebalance the three slide layouts

**Files:**
- Modify: `style.css:1052-1318`
- Modify: `style.css:1371-1380`
- Modify: `style.css:1433-1436`
- Modify: `style.css:1559-1656`
- Modify: `style.css:1776-1830`
- Test: `slides.test.ts`

**Interfaces:**
- Consumes: the Task 2 markup classes `.proof-steps` and `.buyer-gates`
- Produces: readable, print-safe card sizing and spacing for slides 06, 08, and 09

- [ ] **Step 1: Lift and simplify slide 06’s lower box**

Apply these scoped values:

```css
.decision-workflow-slide {
  gap: 8px;
  grid-template-rows: 18px 54px auto auto auto;
}

.decision-workflow-slide .workflow-map {
  align-items: stretch;
  margin-top: 2px;
  width: min(100%, 960px);
}

.decision-workflow-slide .before-after {
  margin-top: 4px;
  width: min(100%, 960px);
}

.deployment-constraints {
  gap: 7px 16px;
  margin-top: -2px;
  min-height: 82px;
  padding: 11px 16px 12px;
}

.deployment-constraints p {
  font-size: 9.4px;
  line-height: 1.22;
}
```

Remove both `.openai-data-note` CSS rules.

- [ ] **Step 2: Increase slide 08’s readable type and replace the four-box loop**

Keep the existing cards, but use these scoped rules for the revised content:

```css
.poc-slide {
  gap: 12px;
  grid-template-rows: 18px 64px auto auto;
}

.poc-slide .poc-note {
  font-size: 12.5px !important;
  line-height: 1.25;
  margin-top: -2px;
  padding: 10px 16px;
}

.poc-slide .validation-layout {
  gap: 14px;
  grid-template-columns: 0.92fr 1.08fr;
  margin-top: -18px;
  width: min(100%, 960px);
}

.roi-panel,
.evaluation-panel {
  min-height: 300px;
  padding: 16px 18px;
}

.roi-caption {
  font-size: 10.2px !important;
  line-height: 1.24 !important;
  margin: 6px 0 10px;
}

.roi-drivers b { font-size: 11.8px; }
.roi-drivers p { font-size: 9.8px; line-height: 1.16; }
.roi-drivers small { font-size: 9px; line-height: 1.18; }
.roi-gate { font-size: 9.4px !important; line-height: 1.24 !important; }

.criteria-panel.evaluation-panel {
  display: block;
}

.proof-steps {
  display: grid;
  gap: 5px;
  margin: 7px 0 9px;
}

.proof-steps > div {
  align-items: flex-start;
  background: rgba(11, 77, 255, 0.045);
  display: grid;
  gap: 7px;
  grid-template-columns: 18px 1fr;
  padding: 7px 8px;
}

.proof-steps b {
  align-items: center;
  background: var(--blue);
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  font-size: 8px;
  height: 18px;
  justify-content: center;
  margin: 0;
  width: 18px;
}

.proof-steps p {
  color: var(--muted);
  font-size: 9.5px;
  line-height: 1.22;
}

.proof-steps p strong {
  color: var(--ink);
  display: inline;
  font-size: inherit;
  margin: 0;
}

.buyer-gates {
  gap: 0 12px;
  grid-template-columns: 1fr 1fr;
}

.buyer-gates b {
  color: var(--ink);
  font-size: 9.4px;
  margin-bottom: 3px;
}

.buyer-gates p {
  color: var(--blue);
  font-size: 8.9px;
  font-weight: 620;
  line-height: 1.18;
}
```

Delete the obsolete `.evaluation-loop` rules, and retain the shared `.release-gates` grid and divider rules used by `.buyer-gates`.

- [ ] **Step 3: Redistribute slide 09 after the removals**

Remove the unused `.time-value-footer` and `.collaboration-note` rules, then apply:

```css
.adoption-path,
.adoption-support {
  gap: 14px;
  grid-template-columns: 160px repeat(3, minmax(0, 1fr));
  padding: 17px 16px;
}

.adoption-path b,
.adoption-support b {
  font-size: 10.2px;
}

.adoption-path p,
.adoption-support p {
  font-size: 9.5px;
  line-height: 1.24;
}

.proof-slide {
  gap: 16px;
  grid-template-rows: 18px 64px 164px auto;
}

.proof-slide .timeline div {
  height: 164px;
  min-height: 164px;
  padding: 18px 15px;
}
```

Keep `.proof-slide .timeline` and `.proof-slide .post-poc-panel` at their existing 980px maximum width and zero top margin.

- [ ] **Step 4: Run the focused test and verify green state**

Run: `npm test -- slides.test.ts`

Expected: PASS with all slide-content and styling-hook assertions green.

- [ ] **Step 5: Commit the layout refinements**

```bash
git add style.css
git commit -m "Rebalance slide readability and spacing"
```

---

### Task 4: Verify the live deck and exported artifact

**Files:**
- Verify: `slides.md`
- Verify: `style.css`
- Verify: `Supply_Chain_Hub_Lucie.pdf`

**Interfaces:**
- Consumes: the complete Slidev deck from Tasks 1-3
- Produces: a tested Slidev build, updated PDF, rendered PNGs for slides 06/08/09, and a live review page at `http://localhost:3030/8`

- [ ] **Step 1: Run repository verification**

Run:

```bash
npm test
npm run typecheck
npm run slides:build
```

Expected: all Vitest suites pass, TypeScript exits with code 0, and Slidev writes `dist-slidev` without build errors.

- [ ] **Step 2: Export the updated PDF**

Run:

```bash
npm exec slidev -- export slides.md --output Supply_Chain_Hub_Lucie.pdf --timeout 60000
```

Expected: Slidev reports a successful 11-page PDF export.

- [ ] **Step 3: Render the three affected PDF pages**

Run:

```bash
mkdir -p tmp/pdfs/readability-final
pdftoppm -f 6 -l 6 -png -r 144 Supply_Chain_Hub_Lucie.pdf tmp/pdfs/readability-final/slide-06
pdftoppm -f 8 -l 9 -png -r 144 Supply_Chain_Hub_Lucie.pdf tmp/pdfs/readability-final/slide
```

Expected: `slide-06-06.png`, `slide-08.png`, and `slide-09.png` are present under `tmp/pdfs/readability-final/`.

- [ ] **Step 4: Inspect slides 06, 08, and 09 at full size**

Check each render for clipped text, overlaps, unexpected wrapping, inconsistent gaps, text below 9px, and collisions with slide numbers. If any defect appears, adjust only the scoped rules from Task 3, rerun the focused test/build/export, and inspect again.

- [ ] **Step 5: Refresh the live development slide**

Confirm the existing server responds at `http://localhost:3030/8`, navigate the in-app browser to that URL, and capture the visible slide after the latest hot reload. Leave the browser on slide 08 for the user.

- [ ] **Step 6: Commit the verified PDF if it changed**

```bash
git add Supply_Chain_Hub_Lucie.pdf
git commit -m "Refresh presentation PDF"
```
