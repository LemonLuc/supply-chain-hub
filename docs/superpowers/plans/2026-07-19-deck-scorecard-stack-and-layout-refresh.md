# Deck Scorecard, Stack, and Layout Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh slides 02, 03, 06, 08, 09, and 11, remove Slidev recording controls, and deliver a verified live deck and regenerated PDF.

**Architecture:** Keep the existing 11-slide Slidev narrative and design system. Implement copy and layout changes in `slides.md` and `style.css`, keep supporting ROI arithmetic in `executive-presentation.md`, remove the recording-only Slidev integration, and protect the requested behavior with source-level Vitest assertions plus full visual QA.

**Tech Stack:** Slidev, Markdown/HTML, CSS, Vitest, Next.js/React/TypeScript, Vercel AI SDK with OpenAI Responses, OpenAI Agents SDK, OpenAI image generation tool, OpenNext, Cloudflare Workers, Poppler.

## Global Constraints

- Preserve the existing 11-slide order, visual language, titles, and slide-number treatment unless explicitly changed below.
- Visible slide copy must be written for ZEISS economic and technical buyers.
- Slide 08 must retain the one-workflow ROI range while moving calculation detail to the talking track.
- Slide 11 must describe only technology evidenced in the repository.
- Do not add new dependencies or unrelated application changes.
- Keep the live Slidev navigation available while removing microphone, audio, and recording controls.

---

### Task 1: Deck content and recording-control contract

**Files:**
- Modify: `slides.test.ts`
- Modify: `slides.md`
- Modify: `package.json`
- Delete: `custom-nav-controls.vue`
- Delete: `scripts/patch-slidev-recording-audio.mjs`

**Interfaces:**
- Consumes: numbered-slide extraction from `slides.test.ts`.
- Produces: source-level guarantees for the requested copy, actual stack, and recording-free presentation mode.

- [ ] **Step 1: Write failing tests**

Add assertions that:

- slide 03 is titled `Hypotheses from the technical discovery` and covers time to decision, data accuracy/evidence confidence, and governed ownership/approval;
- slide 06 omits `masking and` and `works-council checkpoints` and contains the approved operations/adoption wording;
- slide 08 removes the ZEISS confirmation sentence, keeps `€0.2M–€0.3M`, exposes three balanced ROI levers, and pairs all four quantitative/qualitative gates with an explicit `How measured` method;
- slide 11 contains Responses API, Agents SDK, `gpt-5.4-nano`, fail-closed guardrails, conditional OpenAI image generation, and the actual app/runtime stack;
- deck headmatter has `record: false`, `custom-nav-controls.vue` is absent, and slide scripts no longer run the recording patch.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- slides.test.ts`

Expected: FAIL because the requested copy, measurement methods, real stack wording, and recording-free configuration are not yet present.

- [ ] **Step 3: Implement the minimal content and configuration changes**

Update the specified slides and package scripts. Remove the two recording-only files. Use these slide 03 hypotheses:

1. Time to decision is extended by reconciling conflicting source updates.
2. Decision confidence is limited when current, permitted, traceable evidence is not immediately visible.
3. Mitigation slows when ownership and approval paths are unclear, increasing expedite spend, schedule churn, and customer-delivery risk.

For slide 08, show each success criterion as `Target` plus `How measured`:

- Process value: `≥25% faster review · ≥80% useful`; timestamp comparison and post-case user rating.
- Decision quality: `≥90% source-backed · <5% serious risks missed`; expert-reviewed benchmark scenarios and evidence review.
- Technical reliability: `≥95% correct approved system and workflow`; tool-call and trace-log inspection.
- Governance: `100% human review for high-impact actions`; approval audit-log verification.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- slides.test.ts`

Expected: PASS.

### Task 2: Layout refinement and presenter track

**Files:**
- Modify: `slides.test.ts`
- Modify: `style.css`
- Modify: `executive-presentation.md`

**Interfaces:**
- Consumes: the revised HTML structure from Task 1.
- Produces: balanced slide 02/08/09/11 layouts and an aligned presenter narrative.

- [ ] **Step 1: Write failing style and runbook tests**

Add assertions that:

- slide 02 lower-card body copy is slightly larger;
- slide 08 uses equal-height ROI levers and measured-gate rows with even distribution;
- slide 09 top timeline cards are shorter, the lower panel is moved upward, and lower-panel text is larger;
- the talk track explains the slide 08 measurement approach and clarifies that image generation is conditional in the application stack.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- slides.test.ts`

Expected: FAIL on the new style and runbook requirements.

- [ ] **Step 3: Implement minimal CSS and presenter-track changes**

Increase slide 02 card body size by approximately one pixel. Rebuild slide 08 as a clean two-column composition with three evenly distributed ROI lever rows and four compact target/measurement rows. Reduce slide 09 top cards, move the lower panel upward, increase its heading/body type, and preserve five equal timeline columns. Keep slide 11 within the existing two-by-two grid.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- slides.test.ts`

Expected: PASS.

### Task 3: Full verification and delivery

**Files:**
- Modify: `Supply_Chain_Hub_Lucie.pdf`

**Interfaces:**
- Consumes: final Slidev sources.
- Produces: tested source, static build, regenerated PDF, and live browser preview.

- [ ] **Step 1: Run repository verification**

Run: `npm test`

Expected: all Vitest files pass.

Run: `npm run typecheck`

Expected: exit 0.

Run: `npm run slides:build`

Expected: exit 0 without recording patch execution.

- [ ] **Step 2: Export and inspect the PDF**

Run: `npx slidev export slides.md --output Supply_Chain_Hub_Lucie.pdf --wait 2000 --timeout 60000`

Verify with `pdfinfo` that the PDF has 11 pages. Render every page with `pdftoppm`, inspect each page individually at full size, and correct any clipping, overlap, weak spacing, or page-number collision.

- [ ] **Step 3: Verify the live deck**

Inspect slides 02, 03, 06, 08, 09, and 11 at `http://localhost:3030`. Confirm the microphone/audio controls are absent and leave slide 08 open for review.

- [ ] **Step 4: Commit the complete revision**

Stage only the deck, presenter-track, test, recording-control cleanup, and regenerated PDF files. Commit with an imperative summary such as `Refresh presentation scorecard and solution stack`.
