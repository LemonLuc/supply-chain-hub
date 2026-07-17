# Slide 03 Pain and Slide 08 Consolidation Design

## Communication job

By the end, the ZEISS economic and technical buyers should understand that the POC targets a concrete decision bottleneck discovered in the initial technical session and should agree that one workflow can be evaluated against a credible, governed value hypothesis.

## Scope

- Keep the existing 11-slide sequence and established visual system.
- Keep slide 08 as one slide.
- Revise slide 03 so the discovery content expresses a tangible working pain hypothesis rather than generic discovery questions.
- Consolidate slide 08 around one workflow, remove visible formulas and component-value calculations, and preserve those calculations in the presenter talking track.
- Do not present the working assumptions as verified ZEISS production facts.

## Narrative flow

The revised sequence should read as one causal story:

1. Slide 03 turns the completed technical discovery into a working pain hypothesis: teams reconcile fragmented information before they can decide, conflicting sources create an expert bottleneck, and delayed decisions create operational cost.
2. Slide 04 expands that pain into the underlying data fragmentation and its consequences.
3. Slides 05–07 show the technical pattern and the customer-delivery exception workflow that addresses the bottleneck with evidence and governed approvals.
4. Slide 08 defines how ZEISS would validate value, decision quality, technical reliability and governance before scaling one workflow.

## Slide 03: Make the discovered pain tangible

Keep the left-hand “Known operating context” panel unchanged. Replace the right-hand discovery-question box with:

**Working pain hypothesis from technical discovery**

- Risk reviews can start with roughly 20 minutes spent reconciling SAP, supplier, logistics and workbook updates before a decision can begin.
- When sources conflict, scarce domain experts become the bottleneck and escalation quality depends on who is available.
- The result is slower mitigation, avoidable expedite spend, schedule churn and unclear approval ownership.

The wording is deliberately framed as a working hypothesis. It reflects the pain detected by the Solutions Engineer during the prior technical discovery without claiming that the POC has already verified the ZEISS baseline.

## Slide 08: One-workflow value and decision gates

Replace the current dense scorecard with the same two-column structure and substantially less copy.

### Framing line

**Validate value and control before scaling one workflow.**

### Left side

**Annual value hypothesis · one workflow**

**€0.2M–€0.3M**

- Faster risk review
- Fewer urgent expedites
- Lower disruption exposure

Footer: **ZEISS confirms the baseline, attribution and annual run cost.**

The rounded range communicates the appropriate level of precision for a pre-POC hypothesis. It is explicitly scoped to one workflow and must not be presented as enterprise-wide ZEISS value.

### Right side

**POC decision gates**

Setup line: **Test routine cases, high-impact exceptions and permission boundaries.**

- **Process:** ≥25% faster review · ≥80% useful
- **Decision quality:** ≥90% source-backed · <5% serious risks missed
- **Technical reliability:** ≥95% correct approved system and workflow
- **Governance:** 100% human review for high-impact actions

Remove the three explanatory proof-step paragraphs. Present the four decision gates as compact, evenly spaced items with enough whitespace and body type for projected readability.

## Presenter talking track

Preserve the detailed arithmetic outside the visible slide:

- Faster review work: 600–1,000 reviews × 20 minutes saved × €75 per hour = approximately €15K–€25K.
- Fewer urgent expedites: 12–18 avoided cases × €8,400 = approximately €101K–€151K.
- Lower disruption exposure: 0.35–0.70 probability-weighted events × €185,000 = approximately €65K–€130K.
- Combined value: approximately €181K–€306K, presented on the slide as €0.2M–€0.3M.

The presenter should describe these figures as conservative assumptions for one repeatable workflow or operating scope. They are not intended to represent ZEISS-wide value; broader value must be derived only after ZEISS confirms volumes, costs, adoption and rollout scope.

## Layout and styling

- Preserve the deck’s current typography, colors, panel treatment and slide numbering.
- Reuse slide 03’s split layout and rebalance the new pain-hypothesis bullets without reducing body type.
- Reuse slide 08’s two-column composition, but replace the dense nested cards and paragraphs with a flat value summary on the left and four concise decision gates on the right.
- Increase whitespace and maintain clear separation from the slide number.
- Do not introduce new images, diagrams or visual assets.

## Verification

- Update `slides.test.ts` to require the new slide 03 pain language, the rounded one-workflow range and the concise slide 08 gates.
- Add negative assertions for the removed discovery questions, component euro values, formulas and verbose proof-step copy.
- Update `executive-presentation.md` with the detailed slide 03 framing and slide 08 arithmetic so the removed information remains available in the talking track.
- Run `npm test`, `npm run typecheck` and `npm run slides:build`.
- Export the PDF, confirm the deck remains 11 pages, and inspect slides 03 and 08 at full size for clipping, wrapping, density, alignment and unintended overlap.
- Keep the local Slidev development server on port 3030 available for user review.
