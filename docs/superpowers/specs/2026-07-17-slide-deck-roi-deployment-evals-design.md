# Slide Deck ROI, Deployment Constraints, and Evaluation Design

## Goal

Close assignment gaps 1, 4, and 5 in the existing Supply Chain Hub presentation without changing its 11-slide sequence, visual language, or live-demo flow. The result must read like an OpenAI Solutions Engineer proposal: commercially grounded, explicit about customer discovery assumptions, and precise about responsible OpenAI deployment.

## Scope

Only slides 06 and 08 change.

- Slide 06 adds customer-specific deployment constraints to the existing executive workflow.
- Slide 08 replaces the generic validation panel with a quantified euro value hypothesis and strengthens the evaluation method, success gates, and metric ownership.
- Slide count, numbering, section dividers, architecture, demo transition, time-to-value slide, annex, and application remain unchanged.

## Slide 06: Executive workflow

Keep the trigger-to-action workflow and before/after comparison intact. Replace the current three-column “Security built into the workflow” strip with “Deployment constraints to validate.” The strip retains the current card treatment and three-column geometry.

### Data and privacy

- Retrieve only approved SAP, Microsoft 365, supplier, and logistics fields.
- Validate GDPR, supplier-confidentiality, retention, and regional-processing requirements during discovery.
- State that data sent to the OpenAI API is not used to train or improve OpenAI models unless the customer explicitly opts in.
- State that retention and residency controls depend on customer eligibility, project configuration, endpoint, model, and feature support.

### Identity and governance

- Use enterprise SSO, server-side role enforcement, source-level authorization, field masking, and separation of duties.
- Require a named human reviewer before any high-impact supplier-facing or operational action.
- Present these controls as proposed design decisions to validate with ZEISS, not as claims about its current production environment.

### Operations and adoption

- Fail closed when permissions, evidence, or approval state is incomplete.
- Define an auditable incident and fallback path, a named process owner, user training, and a feedback cadence.
- Include security, privacy, and works-council review as discovery and rollout checkpoints where applicable.

## Slide 08: POC scorecard

Keep the existing title, explanatory note, two-card layout, slide number, and overall density. The left card becomes the euro value hypothesis; the right card becomes the evaluation loop and owned release gates.

### Euro value hypothesis

Show **€180K–€310K potential annual gross value** and label it as illustrative and subject to ZEISS baseline validation. Derive the rounded range from the existing demo economics:

| Value driver | Illustrative assumption | Annual value |
| --- | --- | ---: |
| Analyst capacity | 600–1,000 reviews × 20 minutes saved × €75/hour | €15K–€25K |
| Avoided expedites | 12–18 avoided cases × €8,400 | €101K–€151K |
| Reduced downtime exposure | 0.35–0.70 probability-weighted events × €185,000 | €65K–€130K |
| **Rounded total** | Validate volume, attribution, and frequency during the POC | **€180K–€310K** |

Do not claim a payback period or ROI multiple because solution implementation and run-rate costs have not been validated. Instead, state the scale gate explicitly:

`Net ROI = (validated annual benefit − annualized solution cost) ÷ annualized solution cost`

ZEISS should confirm the baseline, attribution assumptions, and annualized run cost before a scale decision.

### Evaluation loop

Present a compact four-step loop:

1. Build a representative SME-labelled gold set covering normal cases, edge cases, critical-risk misses, authorization boundaries, and prompt-injection attempts.
2. Run deterministic checks and model graders for answer quality, source faithfulness, and policy adherence.
3. Review agent traces and a human sample to inspect decisions, tool calls, handoffs, and approval behavior.
4. Add failures and production feedback to the regression set before each release.

This follows current OpenAI guidance that datasets should grow with discovered edge cases, annotations should encode desired behavior, automated graders support evaluation at scale, and trace grading exposes where agent decisions or tool calls succeeded or failed.

### Owned release gates

Use four compact success-gate blocks:

- **Process owner:** at least 25% faster weekly review and at least 80% of pilot users rating the workflow useful.
- **Supply-chain SME:** at least 90% source-faithful answers and no more than 5% false negatives on the critical-risk test set.
- **Engineering owner:** at least 95% correct tool and trace path across the evaluation set.
- **Risk owner:** 100% of high-impact actions routed to an accountable human review.

These are proposed POC thresholds, not existing ZEISS performance claims.

## OpenAI factual basis

Deck language must remain consistent with the following current OpenAI documentation:

- [Data controls in the OpenAI platform](https://developers.openai.com/api/docs/guides/your-data): API data is not used for model training unless the customer opts in; default retention and application-state behavior vary; eligible customers can configure additional retention and data-residency controls subject to endpoint and feature limitations.
- [Getting started with datasets](https://developers.openai.com/api/docs/guides/evaluation-getting-started): use datasets, ground-truth annotations, subject-matter experts, and graders; expand evaluation data as edge cases and blind spots emerge.
- [Trace grading](https://developers.openai.com/api/docs/guides/trace-grading): grade end-to-end agent decisions, tool calls, and reasoning steps to identify errors, compare versions, and detect regressions.
- [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety): constrain data flow, retain approvals for tool actions, use guardrails, and run trace graders and evals.

The slides will summarize these principles and avoid claims that ZEISS has purchased, enabled, or qualified for any specific OpenAI enterprise control.

## Visual design

- Preserve the existing neutral OpenAI presentation system, typography, blue accent, eight-pixel card radius, and compact executive density.
- Reuse the current workflow strip and POC two-card composition rather than introducing a new slide template.
- Keep the ROI headline prominent but subordinate to the slide title.
- Use smaller descriptive copy only where necessary; all footnotes and labels must remain readable in the exported PDF.
- Add print-safe CSS for every new element.

## Verification

- Confirm the deck remains 11 slides and the slide numbers remain unchanged.
- Build the static presentation with `npm run slides:build`.
- Export the deck to PDF using the existing Slidev pipeline.
- Render all 11 PDF pages to images and inspect every page for clipping, overlap, wrapping, contrast, and legibility, with particular attention to slides 06 and 08.
- Run `npm test`, `npm run typecheck`, and `npm run build` to ensure presentation changes do not break the application.
- Reconcile the final diff against gaps 1, 4, and 5 and confirm every monetary value on the new ROI content uses euros.
