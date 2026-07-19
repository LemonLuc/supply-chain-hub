# Consolidated Presentation Talking Tracks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scattered rehearsal scripts with one natural, buyer-focused file containing three complete 30-minute Supply Chain Hub talking tracks, ten presentation Q&As, and preparation-derived OpenAI product feedback.

**Architecture:** Keep the current deck and application unchanged. Create one canonical Markdown rehearsal file whose three versions share the same click path and timing but change the sales emphasis. Remove the obsolete rehearsal files only after the new file passes content and reference checks.

**Tech Stack:** Markdown, the current Slidev deck in `slides.md`, the Next.js demo behavior in `app/` and `lib/`, shell-based content verification, Git.

## Global Constraints

- Use short, natural sentences and friendly language that matches the presenter's style.
- Avoid dense architecture language in the spoken script. Explain technical terms in plain English when they first appear.
- Each version totals 30 minutes: slides 1–6 for 9 minutes, demo for 18 minutes, slides 8–9 for 3 minutes.
- Slide 7 is only the demo divider. The annex stack slide is available for Q&A but not part of the timed presentation.
- Each version has two or three short audience pauses that speak to both the technical buyer and the solution/economic buyer.
- Follow the twelve demo checkpoints in the approved design and preserve their order.
- Name the relevant OpenAI capability during each demo stage while also naming the user pain and business value.
- Clearly distinguish mock data and mock external actions from a production ZEISS deployment.
- Treat manual-effort figures as proof-of-concept hypotheses to validate, never as proven ZEISS savings.
- Never present hidden chain-of-thought. Refer only to the visible reasoning summary, checks, evidence, and outcomes.
- Explain that a model identifier can be easy to change, but a production upgrade still needs evaluation and regression testing.
- Preserve unrelated local changes in `slides.md`, `slides.test.ts`, `style.css`, `Supply_Chain_Hub_Lucie.pdf`, `global-top.vue`, and the existing deck-refinement plan.

---

### Task 1: Create the presenter guide and balanced talking track

**Files:**
- Create: `talking-tracks-30min.md`
- Reference: `slides.md`
- Reference: `docs/superpowers/specs/2026-07-19-consolidated-presentation-talking-tracks-design.md`

**Interfaces:**
- Consumes: the current nine-slide presentation sequence and the exact application labels.
- Produces: the canonical document structure and a complete consultative 30-minute script that later tasks extend.

- [ ] **Step 1: Create the canonical heading and presenter guide**

Start the file with these sections and messages:

```markdown
# Supply Chain Hub — Three 30-Minute Talking Tracks

## How to use this file

- Choose one version for the room; do not mix versions during the live presentation.
- Keep audience answers short. If a pause runs long, shorten the next spoken block rather than skipping a demo action.
- Say clearly that identities, records, and external writes are mocked in this prototype.
- Use the appendix only when a buyer asks a question.

## Timing contract

- 0:00–9:00 — slides 1–6
- 9:00–27:00 — demo
- 27:00–30:00 — slides 8–9 and close
```

- [ ] **Step 2: Write Version 1 as a full rehearsal script**

Use these exact top-level timing blocks:

```markdown
## Version 1 — Consultative and balanced
### 0:00–9:00 — Slides 1–6
### 9:00–27:00 — Live demo
### 27:00–30:00 — Slides 8–9 and close
```

Within the first block, add one subsection for every slide from 1 through 6. Keep the opening friendly, establish the fragmented-decision pain, position OpenAI as a governed decision layer, and explain “ground, reason, act” in plain language.

Include three clearly marked pauses:

1. After slide 3: ask whether time-to-decision or another bottleneck is the bigger pain.
2. After Lukas's connected tools: ask the technical buyer which source or permission boundary must be included in a pilot.
3. On slide 8: ask the economic buyer which result would make the proof of concept worth scaling.

- [ ] **Step 3: Write all twelve demo checkpoints in the approved order**

For every checkpoint include four elements:

1. A visible click or typed prompt.
2. Natural words to say.
3. A short line beginning `OpenAI behind this:`.
4. A short line beginning `Without the Hub:` where a manual comparison applies.

Use the application's exact labels, including:

```text
Show me potential delivery risks for this week.
Create Microsoft Outlook recovery task
Write Dana Narid for review
visualize this
2x2
Show supplier consolidation options by savings and strategic relationship.
```

Correctly attribute the behavior:

- Responses API and the selected model for the grounded chat flow and visible reasoning summary.
- Agents SDK for action tools, reviewer handoff, and traces; application code owns durable tasks, approval state, and permission checks.
- OpenAI image generation for a live slide illustration; the no-key demo uses a deterministic SVG preview.
- Application policy plus a small model through the Responses API and structured output for the blocked off-topic calculation.
- A trusted application-rendered quantitative chart for the executive heat map, chosen instead of a generated image.

- [ ] **Step 4: Write the balanced close**

Use slide 8 to turn the demo into a proof plan. Use slide 9 to ask for one workflow, one owner, one evidence boundary, and one scorecard. End with a short line that connects the decision back to OpenAI:

```text
If we agree on those four things, we can test one clear question: can OpenAI help ZEISS move from a risk signal to a trusted, governed action faster?
```

- [ ] **Step 5: Check the first complete version**

Run:

```bash
RIPGREP_CONFIG_PATH= rg -n "Version 1|0:00–9:00|9:00–27:00|27:00–30:00|PAUSE|OpenAI behind this:|Without the Hub:" talking-tracks-30min.md
```

Expected: Version 1 has all three timing blocks, three pause markers, repeated OpenAI attribution, and manual-effort comparisons.

---

### Task 2: Add the economic-value-led and technical-trust-led versions

**Files:**
- Modify: `talking-tracks-30min.md`

**Interfaces:**
- Consumes: the canonical structure and demo order produced by Task 1.
- Produces: two more complete, independently usable 30-minute scripts.

- [ ] **Step 1: Add Version 2 — Economic-value-led**

Use the same three timing blocks and all twelve clicks. Change the emphasis:

- Lead with planner time, escalation delay, expedite exposure, and customer commitments.
- Keep technical explanations to one or two plain sentences.
- Repeat that approval routing gets faster but the human decision is not automated away.
- Use the manual baselines at the moment each task is shown.
- Ask three economic-buyer questions: where delay costs most, which value measure matters, and who should sponsor the first workflow.
- Close with a measurable four-week proof of concept and a decision to scale, adjust, or stop.

Use this final line:

```text
The next step is not a large transformation. It is one measured workflow that shows whether faster, better-grounded decisions create enough value to scale.
```

- [ ] **Step 2: Add Version 3 — Technical-trust-led**

Use the same three timing blocks and all twelve clicks. Change the emphasis:

- Lead with a custom decision interface above existing systems of record.
- Explain production SSO, server-side role policy, source selection, tool eligibility, and fail-closed behavior in plain English.
- Be precise about the split between Responses API, Agents SDK, image generation, model behavior, and application logic.
- Explain that citations and timestamps make an answer inspectable but do not guarantee truth.
- Ask three technical-buyer questions: identity source, sensitive action boundary, and required audit evidence.
- Close by proposing a joint architecture and evaluation workshop around one workflow.

Use this final line:

```text
If the architecture, evidence, and approval controls hold up in one real workflow, ZEISS has a safe pattern it can reuse.
```

- [ ] **Step 3: Check all three complete versions**

Run:

```bash
RIPGREP_CONFIG_PATH= rg -n "^## Version [123]|^### 0:00–9:00|^### 9:00–27:00|^### 27:00–30:00" talking-tracks-30min.md
```

Expected: three version headings and nine timed block headings, three for each version.

Run:

```bash
RIPGREP_CONFIG_PATH= rg -c "Show me potential delivery risks|Create Microsoft Outlook recovery task|Write Dana Narid for review|Show supplier consolidation options" talking-tracks-30min.md
```

Expected: every required label appears at least three times, once in each complete version.

---

### Task 3: Add the buyer Q&A and preparation-derived product feedback

**Files:**
- Modify: `talking-tracks-30min.md`

**Interfaces:**
- Consumes: current OpenAI documentation and the preparation friction documented in the approved design.
- Produces: a practical presenter appendix rather than extra spoken presentation content.

- [ ] **Step 1: Add exactly ten presentation Q&As**

Create `## Appendix A — Questions buyers may ask` and number the items 1 through 10. Label each as `Technical buyer`, `Solution/economic buyer`, or `Both`.

For every item provide:

- `Short answer:` for the live room.
- `If they ask deeper:` for follow-up.
- `Bridge back:` to connect the answer to the proposed proof of concept.

Cover these ten questions in order:

1. What agentic AI means here and whether agents log into portals.
2. Whether employees should choose the model and reasoning effort.
3. What changes when a new model arrives, who owns the upgrade, and how Codex helps.
4. How hallucinations and unsupported recommendations are controlled.
5. How feature and model deprecations are handled.
6. Time to value, professional-services needs, and the ZEISS team required.
7. Token, latency, and spend controls without open-ended autonomous loops.
8. SSO, role access, privacy, retention, and source permissions.
9. Autonomous action limits and human accountability.
10. Proof-of-concept measures for value, quality, adoption, reliability, and governance.

- [ ] **Step 2: Add preparation-derived OpenAI product feedback**

Create `## Appendix B — Product feedback for OpenAI` and write six to eight candid points in first person. Each point must use this pattern:

```markdown
### [Short product area]

**What I found difficult:** [A plain account of the preparation or implementation friction.]

**What would help:** [A generic product improvement for Responses API, Agents SDK, model operations, evaluation, cost controls, traces, or visualization provenance.]
```

Keep the feedback generic. Do not turn it into ZEISS requirements or claim a roadmap commitment.

- [ ] **Step 3: Verify the appendix structure and count**

Run:

```bash
RIPGREP_CONFIG_PATH= rg -n "^## Appendix A|^### (Question )?[0-9]+\.|Short answer:|If they ask deeper:|Bridge back:|^## Appendix B|What I found difficult:|What would help:" talking-tracks-30min.md
```

Expected: ten numbered Q&As with all three response layers, followed by six to eight product-feedback items with both required fields.

---

### Task 4: Retire superseded scripts and update references

**Files:**
- Delete: `talking-track-12min.md`
- Delete: `talking-track-12min-final.md`
- Delete: `customer-role-play-30min.md`
- Delete: `demo-script.md`
- Delete: `demo-video-scripts.md`
- Modify only if needed: `README.md`
- Modify only if needed: `AGENTS.md`

**Interfaces:**
- Consumes: the completed canonical file from Tasks 1–3.
- Produces: one authoritative rehearsal source with no stale project links.

- [ ] **Step 1: Search for references before deleting**

Run:

```bash
RIPGREP_CONFIG_PATH= rg -n "talking-track-12min|customer-role-play-30min|demo-script\.md|demo-video-scripts\.md" . --glob '!node_modules/**' --glob '!.next/**' --glob '!docs/superpowers/plans/2026-07-19-consolidated-presentation-talking-tracks.md'
```

Expected: identify every live reference. Update only a user-facing repository guide that still points to a deleted file; leave historical implementation plans unchanged.

- [ ] **Step 2: Delete the five superseded Markdown files with `apply_patch`**

Delete the exact five files listed above. Do not remove `executive-presentation.md`; it remains the supporting runbook.

- [ ] **Step 3: Confirm the canonical source is the only rehearsal script**

Run:

```bash
RIPGREP_CONFIG_PATH= rg --files | RIPGREP_CONFIG_PATH= rg "talk|demo-script|role-play"
```

Expected: `talking-tracks-30min.md` is the only root-level rehearsal script. Historical design and implementation documents under `docs/superpowers/` may still mention prior work.

---

### Task 5: Complete the content and repository verification

**Files:**
- Verify: `talking-tracks-30min.md`
- Verify: `slides.md`
- Verify: `executive-presentation.md`

**Interfaces:**
- Consumes: the completed canonical document and retired source set.
- Produces: evidence that the user-visible deliverable matches the approved objective without disturbing unrelated work.

- [ ] **Step 1: Run terminology and placeholder checks**

Run:

```bash
RIPGREP_CONFIG_PATH= rg -n "economical buyer|Response API|AgentsSDK|Lucia Lopez|Slide 10|Post-demo|12-minute|T[B]D|T[O]DO" talking-tracks-30min.md
```

Expected: no matches. Use `Responses API`, `Agents SDK`, `Dr. Lucía López`, current slide numbers, and the 30-minute structure.

- [ ] **Step 2: Check mock-versus-production language and key safeguards**

Run:

```bash
RIPGREP_CONFIG_PATH= rg -n "mock|SSO|server-side|source of truth|human|fail closed|deterministic|hypothesis|validate with ZEISS" talking-tracks-30min.md
```

Expected: all concepts are present in each relevant version or appendix answer.

- [ ] **Step 3: Check formatting**

Run:

```bash
git diff --check -- talking-tracks-30min.md talking-track-12min.md talking-track-12min-final.md customer-role-play-30min.md demo-script.md demo-video-scripts.md README.md AGENTS.md
```

Expected: no whitespace errors.

- [ ] **Step 4: Run the relevant repository test**

Run:

```bash
npm test -- --run slides.test.ts
```

Expected: the presentation/runbook suite passes, proving the collateral cleanup did not break the current deck contract.

- [ ] **Step 5: Review only the intended diff and commit**

Run:

```bash
git diff -- talking-tracks-30min.md talking-track-12min.md talking-track-12min-final.md customer-role-play-30min.md demo-script.md demo-video-scripts.md README.md AGENTS.md
git status --short
```

Expected: the talk-track diff contains the canonical file, the five approved deletions, and only any necessary reference update. Existing unrelated deck changes remain unstaged.

Commit only the talk-track files and any necessary `README.md` or `AGENTS.md` reference update:

```bash
git add talking-tracks-30min.md talking-track-12min.md talking-track-12min-final.md customer-role-play-30min.md demo-script.md demo-video-scripts.md
git commit -m "Consolidate presentation talking tracks"
```
