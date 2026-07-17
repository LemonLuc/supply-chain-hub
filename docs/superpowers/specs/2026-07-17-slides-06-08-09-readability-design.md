# Slides 06, 08, and 09 Readability Design

## Goal

Improve the presentation's spoken-flow support and projected readability without changing the 11-slide sequence or the established visual system. Slide 08 remains one slide.

## Slide 06: Executive workflow

- Remove the OpenAI data-control note from the deployment-constraints box.
- Preserve the three buyer-relevant constraint categories: data and privacy, identity and governance, and operations and adoption.
- Move the lower constraints box upward by reducing excess vertical margins and the space it previously reserved for the removed note.
- Keep clear separation from the slide number and avoid changing the workflow narrative above it.

## Slide 08: Impact validation and success criteria

Use the approved balanced buyer narrative: business value on the left and the proof plan on the right.

### Business-value card

- Keep the illustrative annual gross-value range and its three transparent value drivers.
- Use complete, presentation-ready sentences to explain what the range means and which assumptions ZEISS would validate.
- Keep the scale-decision formula, but describe it in plain language and make clear that the range is a hypothesis rather than a promised outcome.

### Proof-plan card

Replace evaluation-team shorthand with language that an economic buyer and a technical buyer can understand during the presentation:

1. Agree realistic test scenarios with the business and IT teams, including routine cases, high-impact exceptions, and permission boundaries.
2. Compare the assistant's answers and proposed actions with the expected business outcome, checking evidence, risk coverage, system behavior, and approvals.
3. Review failures together, correct the workflow, and rerun the same scenarios before release.

Express the four decision gates in plain language:

- Business value: the process owner confirms at least 25% faster review work and at least 80% user usefulness.
- Decision quality: the supply-chain lead confirms at least 90% of answers are supported by approved sources and fewer than 5% of serious risks are missed.
- Technical reliability: the IT or AI owner confirms at least 95% of runs use the correct approved systems and workflow path.
- Governance: the risk owner confirms every sensitive or high-impact action receives accountable human review.

Do not use the terms “SME-labelled gold set,” “graders,” “trace + SME review,” “regression set,” “false negatives,” or “tool / trace path” on the slide. Increase the minimum body-copy size and use spacing, short labels, and restrained emphasis so the slide supports the talking track without becoming a wall of text.

## Slide 09: Time to value

- Remove “Looking forward to shaping the collaboration.”
- Remove “Lean customer core: one business owner + one technical lead; sponsor and SMEs join checkpoints.”
- Preserve the five-week proof timeline, the post-POC adoption path, and OpenAI support options.
- Reallocate the freed space across the remaining sections with consistent vertical gaps and balanced row padding.

## Verification

- Update presentation tests to require the new buyer-friendly language and explicitly reject the removed copy and internal evaluation jargon.
- Run the presentation tests, typecheck, Slidev build, and PDF export.
- Render slides 06, 08, and 09 and inspect them for clipping, overlap, alignment, readable type, and density.
- Keep the local Slidev development server available on port 3030 for review.
