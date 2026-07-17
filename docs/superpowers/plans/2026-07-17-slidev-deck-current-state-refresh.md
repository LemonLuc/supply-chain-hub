# Slidev Deck Current-State Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the 13-slide executive Supply Chain Hub deck with current application controls, a security-and-evaluation story, a credible time-to-value roadmap, and an accurate current-stack annex.

**Architecture:** Keep all presentation content in `slides.md` and all visual behavior in `style.css`. Remove the redundant proposal slide, insert a dedicated security slide before rollout, and use existing Slidev card and print conventions for the new layouts.

**Tech Stack:** Slidev 52, Markdown with embedded HTML, CSS, Playwright-backed Slidev export.

## Global Constraints

- Do not add citation footnotes, source pages, or a bibliography.
- Keep exactly 13 slides after removing the current slide 05.
- Preserve the existing OpenAI deck visual language.
- Keep the OpenAI Trust Portal as the only external destination and present it as a security-review resource.
- Use 4–6 weeks for the POC and six months for the initial adoption horizon.

---

### Task 1: Refresh slide content and numbering

**Files:**
- Modify: `slides.md`

**Interfaces:**
- Consumes: Existing Slidev HTML sections and `slide-number` labels.
- Produces: A 13-slide sequence with new `security-slide` and rebuilt `value-slide` markup.

- [ ] **Step 1: Remove the current solution-proposal section**

Delete the section whose visible slide number is `05`, including its separator.

- [ ] **Step 2: Update the architecture section**

Renumber it to `05`, mention GPT-5.6 controls, prompt-scope and role enforcement, and add this operating-controls sentence:

```html
<p class="source-control-line">Verified-source harness shows freshness indicators and citations for every answer.</p>
```

- [ ] **Step 3: Renumber existing slides through future potential**

Change the visible numbers for the executive workflow, POC scorecard, and future potential slides to `06`, `08`, and `09`. Divider slides remain unnumbered.

- [ ] **Step 4: Insert the security-and-evaluation slide**

Add a `security-slide` section with OpenAI platform, application controls, and evaluation/red-team cards plus a Trust Portal callout linking to `https://trust.openai.com/`.

- [ ] **Step 5: Replace slide 11 with the time-to-value roadmap**

Use a two-row roadmap for a 4–6 week POC and six-month adoption horizon, plus compact OpenAI support and 5–7-person customer-team panels.

- [ ] **Step 6: Refresh slide 13**

Replace outdated stack bullets with current model controls, guardrails, feedback, source enforcement, Microsoft 365 grouping, role-aware actions, the savings–relationship visualization, and current verification/runtime controls.

### Task 2: Style new and updated layouts

**Files:**
- Modify: `style.css`

**Interfaces:**
- Consumes: `source-control-line`, `security-grid`, `security-card`, `trust-review`, `value-roadmap`, `value-phase`, `value-support`, and `customer-team` classes from Task 1.
- Produces: Presentation-safe and print-safe layouts at the existing Slidev canvas size.

- [ ] **Step 1: Style the architecture source-control line**

Give the sentence a compact blue-tinted inset treatment within the operating-controls card.

- [ ] **Step 2: Style the security slide**

Use three equal cards with restrained blue, cyan, and green top borders and a full-width Trust Portal callout below them.

- [ ] **Step 3: Style the time-to-value slide**

Use two stacked roadmap rows with a duration rail and three phase blocks, followed by a two-column support/team band sized to fit without clipping.

- [ ] **Step 4: Extend print overrides**

Ensure every new card, roadmap block, and callout renders with a solid white background and no shadow in exported output.

### Task 3: Build, export, and visually verify

**Files:**
- Verify: `slides.md`
- Verify: `style.css`
- Generate: `Supply_Chain_Hub_Lucie.pdf`

**Interfaces:**
- Consumes: Completed Slidev source and CSS.
- Produces: A successful static build, a 13-page PDF, and an interactive browser preview.

- [ ] **Step 1: Build the deck**

Run: `npm run slides:build`

Expected: Slidev exits with code 0 and writes `dist-slidev`.

- [ ] **Step 2: Export the deck**

Run: `npm exec slidev export slides.md -- --output Supply_Chain_Hub_Lucie.pdf --timeout 60000 --wait 1000`

Expected: Slidev exits with code 0 and writes the PDF.

- [ ] **Step 3: Confirm slide count**

Run a PDF metadata or extraction command and verify exactly 13 pages.

- [ ] **Step 4: Inspect affected slides**

Render or preview slides 05, 10, 11, and 13 and verify that headings, cards, roadmap labels, and the Trust Portal callout are fully visible without overlap.

- [ ] **Step 5: Show the interactive preview**

Start the Slidev server on an available local port and open that URL in the in-app browser on slide 10 or slide 11.
