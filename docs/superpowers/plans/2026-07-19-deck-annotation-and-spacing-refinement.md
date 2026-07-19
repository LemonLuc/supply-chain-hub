# Deck Annotation and Spacing Refinement Plan

**Goal:** Apply the approved slide 03, 06, 08, 09, and 11 refinements and add a live-presentation pen whose annotations disappear after leaving a slide.

**Approach:** Preserve the existing Slidev narrative and design system. Tighten only the requested copy, rebalance the affected CSS grids, keep slide 08 measurement detail visible but compact, and use Slidev's public drawing state with a single global layer to clear the previous slide on navigation.

**Verification:** Protect the content and behavior with `slides.test.ts`, then run the full Vitest suite, TypeScript check, Slidev build, PDF export/render inspection, and live-browser checks on the affected slides.

## Tasks

- [x] Update source-level tests for the approved copy, spacing, actual stack, and ephemeral drawing contract.
- [x] Revise slide 03 hypotheses and slide 08 value/success-criteria wording.
- [x] Rebalance slide 06, 08, and 09 layouts and typography.
- [x] Correct slide 11 title and live-stack explanation.
- [x] Add a Slidev global layer that clears annotations when the current slide changes.
- [x] Run automated and visual verification, regenerate the deck PDF, and leave the live server ready for review.
