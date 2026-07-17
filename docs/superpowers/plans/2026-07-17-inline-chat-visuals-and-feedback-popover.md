# Inline Chat Visuals and Feedback Popover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver non-jumping feedback popovers and automatically selected, trustworthy charts or slide-ready images inside assistant messages.

**Architecture:** Feedback uses a body portal anchored to the selected rating button, while transcript scrolling is managed only by the message-list element. Visuals use server-derived chart specifications for quantitative facts and the OpenAI Responses image-generation tool for conceptual slide imagery; demo mode streams the same tool-part shapes with deterministic chart or SVG output.

**Tech Stack:** Next.js App Router, React, TypeScript, Vercel AI SDK, OpenAI Responses provider tools, Vitest, React Testing Library, inline SVG, CSS.

## Global Constraints

- Automatically choose one chart or image for an explicit visualization request.
- Prefer server-derived charts whenever accurate quantitative data is available.
- Never accept raw chart values from the model or use generated images for exact operational facts.
- Render visuals in the assistant message that produced them and do not duplicate them in Results.
- Preserve role, source-selection, authorization, and financial filtering boundaries.
- Keep generated output to one visual per response.
- Preserve unrelated user changes already present in the worktree.
- Follow test-first red-green-refactor cycles.

---

### Task 1: Feedback popover and contained transcript scrolling

**Files:**
- Modify: `app/answer-actions.tsx`
- Modify: `app/supply-chain-app.tsx`
- Modify: `app/globals.css`
- Test: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: existing `AnswerFeedback`, rating callbacks, `UIMessage[]`, and chat status.
- Produces: portal-backed `AnswerActions`, submitted-value restoration, and message-list-only scrolling.

- [ ] **Step 1: Write failing feedback tests**

Add tests that open Helpful, assert `role="dialog"`, an autofocus textarea, and `Close feedback`; then verify Escape, outside pointer, Cancel, and close-button dismissal restore focus and do not leave a selected draft. Add a submitted-feedback test that reopens, changes the draft, closes, and observes the saved value.

- [ ] **Step 2: Run the focused test and verify red**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: FAIL because feedback is inline, has no dialog/close button, and cannot restore submitted state.

- [ ] **Step 3: Implement the portal and saved feedback state**

Extend the feedback value with an optional saved snapshot:

```ts
saved?: { rating: FeedbackRating; comment: string };
```

Render the form with `createPortal`, `role="dialog"`, fixed coordinates derived from the active trigger, a close icon button, Escape/outside-pointer listeners, textarea focus, and trigger-focus restoration. Update selection, submit, and cancel handlers so cancel deletes a new draft but restores `saved` feedback after reopening.

- [ ] **Step 4: Write and verify failing scrolling tests**

Replace the existing `scrollIntoView` expectation with message-list `scrollTo` expectations. Set `scrollHeight`, `clientHeight`, and `scrollTop` in the test, simulate scrolling upward, stream another update, and assert the position is preserved.

- [ ] **Step 5: Implement contained auto-follow**

Use `messageListRef`, a near-bottom ref, and a force-scroll-after-submit ref. Smooth-scroll once after submission and use immediate scrolling for stream updates only while near the bottom. Remove the latest-message `scrollIntoView` ref.

- [ ] **Step 6: Style and verify green**

Add theme-aware popover, header, close-button, responsive clamping, and focus styles; remove the inline form’s layout contribution. Run `npm test -- app/supply-chain-app.test.tsx` and expect PASS.

### Task 2: Trusted operational chart schemas and demo visual routing

**Files:**
- Create: `lib/chat-visuals.ts`
- Create: `lib/chat-visuals.test.ts`
- Modify: `lib/chat-extensions.ts`
- Modify: `lib/chat.ts`

**Interfaces:**
- Produces: `OperationalBarChart`, `DemoSlideVisual`, `ChatVisual`, `asksForVisualization(question)`, `resolveOperationalChart(context)`, `createDemoSlideVisual(context)`, `parseOperationalBarChart(value)`, `parseDemoSlideVisual(value)`, and `getDemoChatVisual(question, context)`.
- Consumes: authorized `AppContext` and existing supplier-portfolio resolver.

- [ ] **Step 1: Write failing resolver tests**

Cover delay coverage (`14`, `8`, `6` builds), risk shipment quantities from authorized rows, rejection of incompatible data, explicit visualization phrase detection, supplier visualization precedence, and deterministic slide SVG metadata.

- [ ] **Step 2: Run resolver tests and verify red**

Run: `npm test -- lib/chat-visuals.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement strict visual schemas and resolvers**

Define discriminated outputs with finite non-negative values and same-unit bars. Derive values only from `AppContext`; expose tool inputs containing identifiers/reasons, never numeric values. Build a non-sensitive SVG preview and base64-encode it for the demo image shape.

- [ ] **Step 4: Expose the operational chart tool and prompt policy**

Add `renderOperationalChart` only when an explicit visual request has a compatible chart. Extend `buildSystemPrompt` with chart-first, one-visual, image-safety instructions while preserving the existing supplier tool behavior.

- [ ] **Step 5: Run tests and verify green**

Run: `npm test -- lib/chat-visuals.test.ts lib/chat.test.ts`

Expected: PASS.

### Task 3: Inline chart and image rendering

**Files:**
- Create: `app/operational-bar-chart.tsx`
- Create: `app/chat-message-visual.tsx`
- Create: `app/chat-message-visual.test.tsx`
- Modify: `app/supply-chain-app.tsx`
- Modify: `app/globals.css`
- Modify: `app/supplier-portfolio-visualization.tsx`

**Interfaces:**
- Produces: `getMessageVisual(message)`, `ChatMessageVisual`, and `OperationalBarChartView`.
- Consumes: completed `tool-renderSupplierPortfolio`, `tool-renderOperationalChart`, and `tool-generateSlideVisual` parts.

- [ ] **Step 1: Write failing message-visual tests**

Construct UI messages for valid portfolio, operational bar, live base64 WebP, and demo SVG output. Assert the corresponding chart/image, alternative text, and download link appear. Assert partial, failed, malformed, and older-message outputs are ignored.

- [ ] **Step 2: Run component tests and verify red**

Run: `npm test -- app/chat-message-visual.test.tsx`

Expected: FAIL because the renderer does not exist.

- [ ] **Step 3: Implement the renderers**

Render an accessible SVG horizontal bar chart with direct values and a screen-reader description. Validate completed tool output before constructing a fixed MIME data URL. Render a download link and a visible “Demo preview” label only for deterministic output.

- [ ] **Step 4: Place visuals in their producing messages**

Call `getMessageVisual(message)` for each assistant message, add `has-visual` to that message, and render `ChatMessageVisual` after Markdown and before answer actions. Stop deriving a latest global portfolio visual and remove its duplicate Results rendering.

- [ ] **Step 5: Add responsive and theme styles**

Let visual messages use full transcript width; keep charts, labels, images, and actions inside the container at 390 pixels and in dark mode.

- [ ] **Step 6: Run component and app tests**

Run: `npm test -- app/chat-message-visual.test.tsx app/supplier-portfolio-visualization.test.tsx app/supply-chain-app.test.tsx`

Expected: PASS.

### Task 4: Live image-generation and deterministic mock streaming

**Files:**
- Modify: `app/api/chat/route.ts`
- Modify: `app/api/chat/route.test.ts`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: `asksForVisualization`, `getDemoChatVisual`, `getChatTools`, and `openai.tools.imageGeneration`.
- Produces: live `generateSlideVisual` provider tool and demo UI tool parts matching the inline renderer.

- [ ] **Step 1: Write failing route tests**

Assert that a live explicit visual request registers `generateSlideVisual` with `1536x1024`, medium quality, and WebP output; a normal request does not register it; an operational request registers a trusted chart tool; and demo requests stream deterministic chart/image tool output.

- [ ] **Step 2: Run route tests and verify red**

Run: `npm test -- app/api/chat/route.test.ts`

Expected: FAIL because live image generation and mock visual tool parts are absent.

- [ ] **Step 3: Register live tools**

Build the OpenAI provider before the `streamText` call. Merge trusted chart tools with:

```ts
generateSlideVisual: openai.tools.imageGeneration({
  model: "gpt-image-2",
  size: "1536x1024",
  quality: "medium",
  outputFormat: "webp",
});
```

Register the image tool only for explicit visualization requests and retain the two-step limit.

- [ ] **Step 4: Stream demo tool output**

Extend the mock response writer to emit `tool-input-available` and `tool-output-available` around the deterministic visual before completing the text response.

- [ ] **Step 5: Verify route and integration tests**

Run: `npm test -- app/api/chat/route.test.ts app/supply-chain-app.test.tsx`

Expected: PASS.

### Task 5: Full verification and browser delivery

**Files:**
- Modify only if verification exposes a scoped defect.

**Interfaces:**
- Produces: a verified development server and browser-open finished app.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`

Expected: all Vitest files pass with no unhandled errors.

- [ ] **Step 2: Run static and production verification**

Run: `npm run typecheck`

Expected: exit 0.

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 3: Start the development server**

Run: `npm run dev`

Expected: the server reports a local URL and remains running.

- [ ] **Step 4: Inspect the finished app in the browser**

Open the local URL, run a demo “visualize this” prompt in chart-capable and image-preview contexts, open and close feedback, verify scrolling, switch themes, and check a 390-pixel viewport. Capture final screenshots only after correcting any visible defects.

- [ ] **Step 5: Final completion audit**

Confirm every approved requirement has direct evidence from tests, build output, and browser behavior. Leave unrelated user changes unstaged and report the running URL.
