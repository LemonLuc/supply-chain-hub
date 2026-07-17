# Slidev Deck Current-State Refresh Design

## Goal

Refresh the executive Supply Chain Hub deck so it reflects the application as of 17 July 2026, communicates a credible path from proof of concept to adoption, and explains security and evaluation without adding citation clutter.

## Narrative structure

The existing solution-proposal slide 05 is removed. Its narrative is already covered by the TL;DR and architecture slides. A new security-and-evaluation slide is inserted before the rollout slide, keeping the deck at 13 slides and preserving the current slide 11 and slide 13 positions after renumbering.

The final sequence is:

1. Cover
2. TL;DR
3. Status quo and validation needs
4. Business problem
5. Solution overview
6. Executive workflow
7. Demo divider
8. POC scorecard
9. Future potential
10. Secure by design, tested continuously
11. Time to value
12. Annex divider
13. Actual Supply Chain Hub stack

## Slide changes

### Slide 05: Solution overview

This is the current slide 06 after renumbering. It retains the four-zone reference architecture and Ground–Reason–Act rail while adding the application changes that now exist:

- GPT-5.6 model and reasoning controls in the intelligence layer;
- prompt-scope guardrails, server-side role enforcement, masking, and review paths in operating controls;
- a verified-source harness with freshness indicators and citations;
- persona-aware action workflows and explicit reviewer handoffs in the Agents SDK description.

The exact source-trust sentence is: “Verified-source harness shows freshness indicators and citations for every answer.”

### Slide 10: Secure by design, tested continuously

The new security slide uses three equally weighted panels:

1. **OpenAI platform:** business data is not used for training by default, encryption is applied in transit and at rest, qualifying enterprise configurations support European residency controls, Frontier Governance and Preparedness frameworks govern severe-risk assessment, and independent assurance is available.
2. **Application controls:** server-side role permissions, selected-source gating, masking, prompt-scope enforcement, explicit approval paths, and auditable action traces.
3. **Evaluation and red teaming:** task-specific eval cases, source-faithfulness and authorization checks, off-topic and prompt-injection attacks, regression testing, and human review of high-impact scenarios.

A bottom callout directs ZEISS security reviewers to the OpenAI Trust Portal. It is the only external destination in the deck and is presented as a due-diligence resource, not a citation. No supporting-source footnotes or bibliography are added.

### Slide 11: Time to value

The current five-week card timeline becomes a two-horizon roadmap:

- **POC · 4–6 weeks:** align scope and metrics, connect representative data and permissions, build one workflow, run evals and red-team cases, and deliver a go/no-go readout.
- **Adoption · through month 6:** harden identity, monitoring and operations; onboard user cohorts and process owners; expand to a second workflow only after quality and adoption gates are met.

The slide also clarifies support responsibilities:

- **OpenAI Solutions Engineering:** use-case framing, reference architecture, prototype guidance, eval design, and technical unblock support.
- **Enterprise success and support:** rollout planning, enablement, adoption measurement, and a contracted support path.
- **Optional Frontier / delivery services:** embedded forward-deployed engineering for production implementation, integration, governance operationalization, and reusable patterns for eligible strategic deployments.

The recommended ZEISS core team is 5–7 named contributors: one product/process owner, one or two supply-chain subject-matter experts, one or two platform/data engineers, one security/identity partner, and one change/adoption lead, with executive sponsorship outside the daily team. This is a project-sizing recommendation, not an OpenAI entitlement or guaranteed staffing model.

### Slide 13: Actual Supply Chain Hub stack

The annex retains a four-card layout and updates it with:

- GPT-5.6 Sol, Terra, and Luna plus six reasoning settings;
- answer copy and feedback controls;
- prompt-scope classification before context or tool loading;
- selected-source enforcement and deterministic fallback behavior;
- role-aware Microsoft 365 connector grouping;
- explicit persona eligibility, assignee, and reviewer metadata;
- direct cross-persona task assignment and human approval routing;
- savings-versus-relationship bubble and matrix views with server-derived decisions;
- Vitest coverage, strict TypeScript, OpenNext, Wrangler, and Cloudflare Workers.

## Visual design

The deck keeps the existing neutral OpenAI visual system, typography, eight-pixel card radius, blue accent, and compact executive density. New layouts use the existing card and callout vocabulary instead of introducing a new motif.

The security slide uses three cards and a single full-width trust callout. The time-to-value slide uses a two-row roadmap, followed by compact support and customer-team panels. All affected layouts include print-safe white backgrounds.

## Verification

- Build the Slidev static site with `npm run slides:build`.
- Export a PDF with Slidev and confirm there are 13 pages.
- Inspect slides 05, 10, 11, and 13 at presentation size for clipping, overlap, and legibility.
- Open the live Slidev preview in the in-app browser and show the finished deck.
