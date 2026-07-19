# Consolidated 30-Minute Presentation Talking Tracks Design

## Objective

Create one canonical, rehearsal-ready presentation document containing three distinct 30-minute talking-track versions for the current Supply Chain Hub deck. Each version must sell the OpenAI solution portfolio to technical and economic buyers while showing how the application reduces the manual effort, delay, and governance risk in supply-chain decisions.

The document will replace the project's superseded talking-track and demo-script files. `slides.md` remains the authoritative visual sequence, and `executive-presentation.md` remains supporting presentation guidance rather than a competing rehearsal script.

## Approaches Considered

1. **Three complete scripts in one canonical file — selected.** Each version is usable by itself in rehearsal and follows the same click path. Repetition makes the file longer, but minimizes presenter error and supports direct comparison.
2. **One master script plus variant notes.** This is shorter, but requires the presenter to mentally merge two sections during rehearsal.
3. **A modular line library.** This is flexible for experienced sellers, but does not satisfy the request for three complete, timed versions.

## Canonical Deliverable

Add `talking-tracks-30min.md` with:

1. A presenter guide and timing rules.
2. Version 1: consultative and balanced for both buyers.
3. Version 2: economic-value-led for the solution/economic buyer.
4. Version 3: technical-trust-led for the technical buyer.
5. One shared appendix with ten likely presentation Q&As.
6. A final section containing OpenAI product feedback drawn from preparing the deck and demo.

Remove these superseded scripts after the canonical file is complete:

- `talking-track-12min.md`
- `talking-track-12min-final.md`
- `customer-role-play-30min.md`
- `demo-script.md`
- `demo-video-scripts.md`

## Version Positioning

### Version 1: Consultative and balanced

Use for a mixed room. Lead with the customer's fragmented decision process, validate the pain, explain OpenAI in business language, and balance value with technical trust. The close asks ZEISS to choose one workflow, owner, evidence boundary, and scorecard.

### Version 2: Economic-value-led

Use when the solution or economic buyer is dominant. Make time-to-decision, avoided expedite exposure, adoption, repeatability, and the four-week proof of concept the main narrative. Technical explanations remain accurate but concise. The close asks for sponsorship and a measurable proof of value.

### Version 3: Technical-trust-led

Use when enterprise architecture, security, or IT is dominant. Emphasize server-side identity, least privilege, source selection, grounded evidence, tool eligibility, Agents SDK orchestration, human approval, guardrails, traces, and upgrade governance. The close asks for a joint architecture and evaluation workshop around one workflow.

## Timing Contract

Every version must total 30 minutes and use the current deck numbering:

- `0:00–9:00`: slides 1–6.
- `9:00–27:00`: live demo, with slide 7 serving only as the demo divider.
- `27:00–30:00`: slides 8–9 and a strong close.
- The annex stack slide is available for Q&A but is not part of the timed 30 minutes.

Each version includes two or three short audience pauses. Questions must address both personas: a technical buyer responsible for architecture, security, integration, and maintainability; and a solution/economic buyer responsible for workflow value, adoption, ROI, and sponsorship. Each pause includes a time-box cue so audience interaction does not consume the demo.

## Required 18-Minute Demo Sequence

All three versions use this sequence and approximate allocation:

1. `9:00–10:20` — Open the tool; state that data, identities, source results, and external-system actions are mocked. Explain that production identity would come from ZEISS SSO and be enforced server-side rather than selected in a browser dropdown. Introduce Lukas Weber, Dana Narid, and Dr. Lucía López.
2. `10:20–11:10` — Open settings and show Lukas's six visible data sources.
3. `11:10–13:25` — Run “Show me potential delivery risks for this week.” Explain the exception, evidence, role filtering, reasoning summary, and the Responses API/model layer.
4. `13:25–14:55` — Open Actions, create the Microsoft Outlook recovery task, mark it done, then deselect Outlook and show that source-dependent actions disappear. Re-enable Outlook before continuing.
5. `14:55–16:35` — Select “Write Dana Narid for review.” Explain Agents SDK tools, reviewer handoff, traceability, and application-owned authorization. Switch to Dana, compare her tools, then approve or deny the incoming request.
6. `16:35–18:25` — Return to Lukas, type “visualize this,” wait for the slide-ready image, and show the download control. Explain live OpenAI image generation and the deterministic no-key fallback accurately.
7. `18:25–19:10` — Run `2x2`. Explain that a server-side scope policy blocks unrelated work using a deterministic pre-check plus a structured-output classifier through the Responses API; the application fails closed if the live classifier is unavailable.
8. `19:10–20:20` — Switch to Dr. Lucía López. Explain that server-side persona policy unlocks executive financial and strategic context and a different source set.
9. `20:20–22:25` — Click “Show supplier consolidation options by savings and strategic relationship.” Explain evidence, source freshness, citations/provenance, policy checks, and auditability.
10. `22:25–24:20` — Ask to visualize the result. Show the authorized portfolio heat map and findings. Explain that a trusted quantitative application chart is preferred over generative imagery when the numbers already exist.
11. `24:20–26:15` — Show thumbs-up, thumbs-down, and comment feedback. Position it as proof-of-concept evidence that can be converted into a regression evaluation set; do not claim the current in-memory demo feedback is already a production evaluation platform.
12. `26:15–27:00` — Enable dark mode as a brief closing touch, then transition immediately back to slide 8.

## OpenAI Product Attribution Rules

The talk tracks must distinguish the OpenAI platform component from customer/application controls:

- **Responses API:** model interaction, reasoning controls, multimodal/tool-using response flow, and the foundation used by the chat route.
- **Models:** synthesize authorized context and trade-offs. They are not the source of truth and do not receive unrestricted enterprise data.
- **Tools, connectors, and MCP:** the production integration pattern for approved external systems. The current app displays mock source/tool results and does not prove live ZEISS, SAP, carrier, or Microsoft connectivity.
- **Agents SDK:** tool-backed action orchestration, reviewer handoffs, and traces. The durable task and approval UI remains application logic.
- **Image generation:** creates a presentation illustration when explicitly requested and when a trusted data chart is not the better representation. With no live key the demo renders a deterministic SVG preview.
- **Scope guardrail:** combines an application policy, deterministic filters, a small OpenAI model through the Responses API, and structured output. It is not described as an autonomous model deciding enterprise policy.
- **Codex:** accelerates implementation and future migrations, but the maintainer still owns code review, tests, evaluation, deployment, and rollback.

## Manual-Effort Comparisons

Every script will compare the demonstrated workflow with a plausible manual baseline while labeling the figures as proof-of-concept hypotheses to validate with ZEISS:

- Reconstructing one delivery-risk view across ERP, carrier, and warehouse systems: about 20–45 minutes manually versus under two minutes in the demo.
- Creating and tracking a follow-up task: about 5–10 minutes manually versus seconds once the evidence is assembled.
- Preparing and routing an approval package: about 10–30 minutes of coordination versus under one minute to route; the human decision time remains human.
- Creating a slide-ready illustration: about 15–30 minutes manually versus up to one minute for live image generation.
- First-pass supplier consolidation analysis: several analyst hours across spend, contracts, quality, and resilience data versus minutes to assemble an initial evidence-backed view; final validation and decision remain with accountable people.

No script presents these ranges as proven ZEISS savings. Slide 8 defines how the proof of concept will establish the real baseline and attribution.

## Appendix A: Presentation Q&A

The appendix contains exactly ten questions that are likely to be asked of the OpenAI Solutions Engineer during this presentation. Each item identifies the likely buyer and provides:

- a short answer suitable for the room;
- a deeper answer if the buyer probes;
- a bridge back to the demonstrated proof-of-concept decision.

The ten topics are:

1. What “agentic AI” means here and whether agents log into portals.
2. Whether employees should choose models and reasoning effort themselves.
3. What changes when a new model is released, who upgrades it, and where Codex helps.
4. How hallucinations and unsupported recommendations are controlled.
5. How model or platform feature deprecations are managed.
6. Time to value, professional-services needs, and the customer team required.
7. How token usage, latency, and spend are controlled without unrestricted autonomous loops.
8. How ZEISS SSO, role access, data privacy, retention, and system permissions work.
9. Whether an agent can execute high-impact actions autonomously and who is accountable.
10. How value, accuracy, adoption, and governance will be measured during the proof of concept.

Answers will use current official OpenAI documentation where platform details matter and will avoid roadmap promises.

## Appendix B: OpenAI Product Feedback From Preparation

This section is written as candid, generic feedback to an OpenAI product manager based on preparing this presentation and implementing the prototype. It will focus on difficulties encountered with the Responses API, Agents SDK, and surrounding developer experience, including:

- Product boundaries and naming are difficult to explain simply when Responses API, Agents SDK, model capabilities, provider SDKs, application guardrails, and custom UI all contribute to one visible result.
- Enterprise approval and durable task state require substantial application logic around the Agents SDK; a first-class durable human-approval primitive would reduce repeated implementation work.
- Business-readable traces and standardized provenance/freshness metadata would make technical traces easier to turn into executive evidence and audit views.
- Model and reasoning selection need clearer enterprise policy patterns so administrators can constrain choices by persona and workflow while developers retain flexibility.
- Model upgrades can be a one-line identifier change but not a one-line production migration; compatibility reports across prompts, tools, structured outputs, latency, and evaluations would help.
- Token, latency, and cost controls are fragmented across model choice, reasoning effort, output limits, tool loops, usage dashboards, and application policy; a unified per-workflow budget control would be valuable.
- Turning in-product thumbs feedback into a governed evaluation and regression workflow takes extra plumbing; a simpler feedback-to-evaluation path would improve proof-of-concept iteration.
- It is too easy for audiences to confuse a generative image with a data-faithful visualization; stronger platform patterns for provenance labeling and chart-first routing would help.

The feedback must be framed as product improvement opportunities, not as claims that current OpenAI features are broken or as customer-specific commitments.

## Accuracy and Presentation Constraints

- Use `OpenAI`, `Responses API`, and `Agents SDK` consistently.
- Preserve the names Lukas Weber, Dana Narid, and Dr. Lucía López from the application.
- Say `economic buyer` or `solution buyer`, not “economical buyer.”
- Never claim the mock demo is connected to production ZEISS systems.
- Never claim a cited source guarantees truth. Citations, timestamps, authorization, deterministic checks, and human review make outputs inspectable; evaluations measure how reliably the system uses them.
- Never expose hidden chain-of-thought. Describe the visible reasoning summary and analysis trace as a concise account of checks and outcomes.
- Never promise that a model upgrade is only one line in production.
- Keep the spoken scripts conversational and suitable for rehearsal rather than turning them into architecture documentation.

## Verification

Before completion:

1. Confirm all three scripts contain the `9 + 18 + 3` timing contract and total 30 minutes.
2. Confirm each script covers all twelve demo checkpoints in the prescribed order.
3. Confirm each script contains two or three explicit audience pauses addressing both buyer types.
4. Confirm every demo stage names the relevant OpenAI capability and states the Supply Chain Hub pain/value.
5. Confirm manual-effort comparisons are present and labeled as hypotheses.
6. Confirm the appendix contains exactly ten buyer questions and preparation-derived OpenAI product feedback.
7. Confirm superseded talking-track files are removed and no remaining project file links to them.
8. Run a terminology and placeholder scan for incorrect slide numbers, `TBD`, `TODO`, stale 12-minute timing, and unsupported live-integration claims.
