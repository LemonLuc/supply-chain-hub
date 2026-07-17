# Slide Deck ROI, Deployment Constraints, and Evaluation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate assignment gaps 1, 4, and 5 into slides 06 and 08 while preserving the 11-slide flow, OpenAI visual system, and application behavior.

**Architecture:** Keep the existing Slidev document and CSS architecture. Replace only the slide 06 workflow strip and slide 08 two-card contents, add narrowly scoped selectors for the new elements, and protect the agreed content with a small Vitest contract test. Verify the actual exported artifact visually as well as the application build.

**Tech Stack:** Slidev Markdown, HTML, CSS, TypeScript, Vitest, Chromium/Puppeteer, Poppler.

## Global Constraints

- Keep the deck at exactly 11 slides with existing numbering, dividers, narrative sequence, and demo transition.
- Modify presentation content only on slides 06 and 08.
- Keep all new financial values in euros.
- Label the €180K–€310K range as an illustrative gross-value hypothesis requiring ZEISS baseline validation.
- Do not claim a payback period or ROI multiple without validated solution costs.
- State OpenAI data controls accurately: API data is not used for training unless the customer opts in; retention and residency depend on eligibility, project, endpoint, model, feature, and configuration.
- Frame ZEISS deployment controls and POC thresholds as proposals to validate, not current-state claims.
- Preserve the current neutral palette, typography, blue accent, eight-pixel card radius, and print-safe white backgrounds.

---

### Task 1: Add a deck content and layout contract

**Files:**
- Create: `slides.test.ts`
- Test: `slides.test.ts`

**Interfaces:**
- Consumes: `slides.md` and `style.css` as UTF-8 source artifacts.
- Produces: regression assertions for the approved slide copy, euro-only ROI content, scoped layout hooks, and unchanged visible slide numbering.

- [ ] **Step 1: Write the failing content contract**

Create `slides.test.ts` with:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const deck = readFileSync(new URL("./slides.md", import.meta.url), "utf8");
const styles = readFileSync(new URL("./style.css", import.meta.url), "utf8");

function numberedSlide(number: string) {
  const marker = `<span class="slide-number">${number}</span>`;
  const start = deck.indexOf(marker);
  const end = deck.indexOf("\n---", start);

  expect(start).toBeGreaterThanOrEqual(0);
  return deck.slice(start, end === -1 ? undefined : end);
}

describe("approved ROI, deployment, and evaluation deck content", () => {
  it("keeps the existing numbered-slide sequence", () => {
    const numbers = [...deck.matchAll(/<span class="slide-number">(\d{2})<\/span>/g)].map(
      ([, number]) => number,
    );

    expect(numbers).toEqual(["02", "03", "04", "05", "06", "08", "09", "11"]);
  });

  it("frames customer deployment constraints and OpenAI data controls on slide 06", () => {
    const slide = numberedSlide("06");

    expect(slide).toContain("Deployment constraints to validate");
    expect(slide).toContain("Data &amp; privacy");
    expect(slide).toContain("Identity &amp; governance");
    expect(slide).toContain("Operations &amp; adoption");
    expect(slide).toContain("API data is not used for model training unless the customer opts in");
    expect(slide).toContain("Retention and residency depend on eligible project, endpoint and configuration");
  });

  it("shows a euro-only value hypothesis and explicit ROI gate on slide 08", () => {
    const slide = numberedSlide("08");

    expect(slide).toContain("€180K–€310K");
    expect(slide).toContain("€15K–€25K");
    expect(slide).toContain("€101K–€151K");
    expect(slide).toContain("€65K–€130K");
    expect(slide).toContain("Net ROI = (validated benefit − annualized solution cost) ÷ annualized solution cost");
    expect(slide).not.toContain("$");
  });

  it("defines the evaluation loop, metrics, and owners on slide 08", () => {
    const slide = numberedSlide("08");

    expect(slide).toContain("SME-labelled gold set");
    expect(slide).toContain("Graders");
    expect(slide).toContain("Trace + SME review");
    expect(slide).toContain("Regression set");
    expect(slide).toContain("≤5% critical false negatives");
    expect(slide).toContain("≥95% correct tool / trace path");
    expect(slide).toContain("100% high-impact review");
  });

  it("includes scoped styling hooks for the new layout", () => {
    expect(styles).toContain(".deployment-constraints");
    expect(styles).toContain(".openai-data-note");
    expect(styles).toContain(".roi-panel");
    expect(styles).toContain(".evaluation-loop");
    expect(styles).toContain(".release-gates");
  });
});
```

- [ ] **Step 2: Run the contract and verify the expected failure**

Run: `npm test -- slides.test.ts`

Expected: FAIL because slide 06 still says “Security built into the workflow,” slide 08 lacks the euro value hypothesis and evaluation loop, and the new CSS hooks do not exist.

---

### Task 2: Implement the approved slide content and visual treatment

**Files:**
- Modify: `slides.md:130-169`
- Modify: `style.css:1051-1164`
- Modify: `style.css:1366-1405`
- Modify: `style.css:1809-1845`
- Test: `slides.test.ts`

**Interfaces:**
- Consumes: the existing `.workflow-security`, `.validation-layout`, `.validation-panel`, and `.criteria-panel` visual vocabulary.
- Produces: `.deployment-constraints`, `.openai-data-note`, `.roi-panel`, `.roi-drivers`, `.roi-gate`, `.evaluation-panel`, `.evaluation-loop`, and `.release-gates` presentation elements.

- [ ] **Step 1: Replace the slide 06 workflow strip**

Replace the current `.workflow-security` block with:

```html
<div class="workflow-security deployment-constraints">
  <h2>Deployment constraints to validate</h2>
  <div><b>Data &amp; privacy</b><p>Approved fields only; confirm GDPR, supplier confidentiality, retention and regional processing.</p></div>
  <div><b>Identity &amp; governance</b><p>SSO, server-side roles, masking and a named reviewer for every high-impact action.</p></div>
  <div><b>Operations &amp; adoption</b><p>Fail-closed fallback, process owner, training, feedback and security / works-council checkpoints.</p></div>
  <p class="openai-data-note"><strong>OpenAI data control:</strong> API data is not used for model training unless the customer opts in. Retention and residency depend on eligible project, endpoint and configuration.</p>
</div>
```

- [ ] **Step 2: Replace the slide 08 POC note and cards**

Use the following slide 08 body after its `<h1>`:

```html
<p class="poc-note">Prove value, quality and control with a ZEISS SME-labelled gold set, trace review and explicit release gates.</p>
<div class="validation-layout">
  <div class="validation-panel roi-panel">
    <span>1</span>
    <h2>Illustrative value hypothesis</h2>
    <strong class="roi-total">€180K–€310K</strong>
    <p class="roi-caption">Potential annual gross value · validate against the ZEISS baseline</p>
    <div class="roi-drivers">
      <div><b>€15K–€25K</b><p>Analyst capacity</p><small>600–1,000 reviews × 20 min × €75/hour</small></div>
      <div><b>€101K–€151K</b><p>Avoided expedites</p><small>12–18 cases × €8,400</small></div>
      <div><b>€65K–€130K</b><p>Downtime exposure</p><small>0.35–0.70 events × €185,000</small></div>
    </div>
    <p class="roi-gate"><strong>Scale gate</strong> Net ROI = (validated benefit − annualized solution cost) ÷ annualized solution cost.</p>
  </div>
  <div class="criteria-panel evaluation-panel">
    <span>2</span>
    <h2>Evaluation loop and owned gates</h2>
    <div class="evaluation-loop">
      <div><b>1</b><p>SME-labelled gold set</p></div>
      <div><b>2</b><p>Graders</p></div>
      <div><b>3</b><p>Trace + SME review</p></div>
      <div><b>4</b><p>Regression set</p></div>
    </div>
    <div class="release-gates">
      <div><b>Process owner</b><p>≥25% faster · ≥80% useful</p></div>
      <div><b>Supply-chain SME</b><p>≥90% source-faithful · ≤5% critical false negatives</p></div>
      <div><b>Engineering owner</b><p>≥95% correct tool / trace path</p></div>
      <div><b>Risk owner</b><p>100% high-impact review</p></div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Add scoped CSS for slide 06**

After the existing `.workflow-security p` rule, add:

```css
.deployment-constraints {
  gap: 6px 16px;
  min-height: 102px;
  padding-bottom: 9px;
}

.deployment-constraints div {
  min-width: 0;
}

.deployment-constraints p {
  font-size: 8.9px;
  line-height: 1.18;
}

.deployment-constraints .openai-data-note {
  border-left: 0;
  border-top: 1px solid rgba(16, 16, 16, 0.1);
  color: var(--muted);
  font-size: 7.9px;
  grid-column: 1 / -1;
  line-height: 1.2;
  margin: 0;
  padding: 6px 0 0;
}

.deployment-constraints .openai-data-note strong {
  color: var(--ink);
  display: inline;
  font-size: inherit;
  margin: 0;
}
```

- [ ] **Step 4: Add scoped CSS for slide 08**

After the current `.criteria-panel p` rule, add:

```css
.poc-slide .validation-layout {
  grid-template-columns: 0.96fr 1.04fr;
  width: min(100%, 950px);
}

.roi-panel,
.evaluation-panel {
  min-height: 270px;
  padding: 15px 17px;
}

.roi-panel > span,
.evaluation-panel > span {
  margin-bottom: 7px;
}

.roi-panel h2,
.evaluation-panel h2 {
  font-size: 14.8px;
  margin-bottom: 6px;
}

.roi-total {
  color: var(--blue);
  display: block;
  font-size: 25px;
  font-weight: 720;
  letter-spacing: -0.03em;
  line-height: 1;
}

.roi-caption {
  color: var(--muted);
  font-size: 8.8px !important;
  margin: 4px 0 8px;
}

.roi-drivers {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.roi-drivers > div {
  background: rgba(11, 77, 255, 0.045);
  border-top: 2px solid rgba(11, 77, 255, 0.55);
  min-width: 0;
  padding: 7px 6px 6px;
}

.roi-drivers b {
  color: var(--blue);
  display: block;
  font-size: 10.8px;
  line-height: 1.05;
  margin-bottom: 4px;
}

.roi-drivers p {
  color: var(--ink);
  font-size: 8.4px;
  font-weight: 680;
  line-height: 1.1;
  margin-bottom: 3px;
}

.roi-drivers small {
  color: var(--muted);
  display: block;
  font-size: 6.9px;
  line-height: 1.15;
}

.roi-gate {
  border-top: 1px solid rgba(16, 16, 16, 0.12);
  font-size: 7.9px !important;
  line-height: 1.2 !important;
  margin-top: 8px;
  padding-top: 7px;
}

.roi-gate strong {
  color: var(--ink);
  display: inline;
  font-size: inherit;
  margin-right: 4px;
}

.criteria-panel.evaluation-panel {
  display: block;
}

.evaluation-loop {
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 7px 0 9px;
}

.evaluation-panel .evaluation-loop > div {
  align-items: center;
  background: rgba(11, 77, 255, 0.045);
  border-top: 0;
  display: flex;
  gap: 4px;
  min-width: 0;
  padding: 6px 5px;
}

.evaluation-loop b {
  align-items: center;
  background: var(--blue);
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 7px;
  height: 14px;
  justify-content: center;
  margin: 0;
  width: 14px;
}

.evaluation-loop p {
  color: var(--ink);
  font-size: 7.3px;
  font-weight: 650;
  line-height: 1.08;
}

.release-gates {
  display: grid;
  gap: 0 12px;
  grid-template-columns: 1fr 1fr;
}

.evaluation-panel .release-gates > div {
  border-top: 1px solid rgba(16, 16, 16, 0.12);
  min-width: 0;
  padding: 7px 2px 6px 0;
}

.release-gates b {
  color: var(--ink);
  font-size: 8.6px;
  margin-bottom: 3px;
}

.release-gates p {
  color: var(--blue);
  font-size: 8px;
  font-weight: 650;
  line-height: 1.14;
}
```

- [ ] **Step 5: Extend print-safe selectors**

Add `.print-slide-container .roi-drivers > div`, `.print-slide-container .evaluation-loop > div`, and `.print-slide-container .release-gates > div` to the existing print-safe background selector list so the new cards render white with no shadow in PDF output.

- [ ] **Step 6: Run the focused contract and verify it passes**

Run: `npm test -- slides.test.ts`

Expected: PASS with 5 tests and no failures.

- [ ] **Step 7: Check the source diff**

Run: `git diff --check && git diff -- slides.md style.css slides.test.ts`

Expected: exit 0; only the approved slide 06 and 08 HTML, scoped CSS, print selectors, and content contract appear.

---

### Task 3: Build, export, visually inspect, and regression-test

**Files:**
- Generate: `Supply_Chain_Hub_Lucie.pdf`
- Verify: `slides.md`, `style.css`, `slides.test.ts`, and application sources through existing commands

**Interfaces:**
- Consumes: the finished Slidev source and existing project scripts.
- Produces: an 11-page PDF plus fresh evidence that the deck and application remain buildable.

- [ ] **Step 1: Build the Slidev static site**

Run: `npm run slides:build`

Expected: exit 0 and generated output under `dist-slidev/`.

- [ ] **Step 2: Export the PDF**

Run: `npm exec slidev export slides.md -- --output Supply_Chain_Hub_Lucie.pdf --timeout 60000 --wait 1000`

Expected: exit 0 and `Supply_Chain_Hub_Lucie.pdf` updated.

- [ ] **Step 3: Confirm artifact structure**

Run: `pdfinfo Supply_Chain_Hub_Lucie.pdf`

Expected: `Pages: 11`, landscape page geometry, and no PDF parsing errors.

- [ ] **Step 4: Render all pages for inspection**

Run: `render_pdf.py Supply_Chain_Hub_Lucie.pdf --out_dir /tmp/supply-chain-deck-roi-evals`

Expected: 11 PNG files, one per slide.

- [ ] **Step 5: Inspect every rendered page**

Inspect all 11 PNGs at presentation size. Verify slide 06 and slide 08 have no clipped or overlapping text, the OpenAI data note and ROI assumptions remain legible, and all unchanged slides still render correctly. If any issue is visible, adjust only scoped CSS, rebuild, re-export, and repeat the full 11-page inspection.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`

Expected: all Vitest files and tests pass with zero failures.

- [ ] **Step 7: Run TypeScript validation**

Run: `npm run typecheck`

Expected: exit 0 with no TypeScript errors.

- [ ] **Step 8: Build the Next.js application**

Run: `npm run build`

Expected: exit 0 with all application routes compiled.

- [ ] **Step 9: Audit every requested requirement**

Verify from current files and rendered output:

- Gap 1: quantified euro value hypothesis, transparent assumptions, and an explicit net-ROI gate are visible.
- Gap 4: data/privacy, identity/governance, and operations/adoption constraints are visible and framed as validation topics.
- Gap 5: a gold set, graders, trace/human review, regression loop, metric owners, false-negative rate, and tool/trace success are visible.
- Flow/layout/design: the deck remains 11 pages, slide numbering and dividers are unchanged, and every slide passes visual inspection.
- Accuracy: OpenAI data-control claims match the approved spec and official documentation.
- No breakage: focused test, full test suite, typecheck, Slidev build, PDF export, and application build all pass.

- [ ] **Step 10: Commit the implementation**

Run:

```bash
git add slides.md style.css slides.test.ts Supply_Chain_Hub_Lucie.pdf
git commit -m "Add ROI and evaluation gates to deck"
```

Expected: one implementation commit containing only the deck source, scoped styles, contract test, and regenerated PDF.
