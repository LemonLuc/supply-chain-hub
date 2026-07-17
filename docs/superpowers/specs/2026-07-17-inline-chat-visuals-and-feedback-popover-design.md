# Inline Chat Visuals and Feedback Popover Design

## Goal

Improve two related chat interactions:

1. Opening answer feedback must not resize or jump the transcript. The comment field opens in an anchored popover with an explicit close button.
2. An explicit request such as “visualize this” automatically produces one appropriate chart or slide-ready image inside the corresponding assistant message.

The work preserves the existing role, source-selection, authorization, and server-side trust boundaries.

## Approved product decisions

- The assistant automatically chooses between a chart and an image. There is no separate visualization mode or chart/image selector.
- A chart takes precedence whenever the authorized context contains suitable quantitative data.
- A generated image is reserved for conceptual, narrative, or presentation-oriented requests where exact plotted values are not the purpose.
- Each assistant response contains at most one visual.
- The visual appears inside the assistant message, directly beneath its text, rather than only in the later Results section.
- The feedback form appears in a non-modal popover anchored to the selected rating button.

## Feedback popover

### Interaction

Selecting Helpful or Not helpful opens a popover containing:

- a short heading that reflects the selected rating;
- a close icon button;
- the existing optional feedback textarea;
- Submit feedback and Cancel feedback buttons.

The textarea receives focus when the popover opens. Escape, the close button, Cancel feedback, and a pointer press outside the popover all dismiss it. Focus returns to the rating button that opened it.

Only one feedback popover can be open at a time. Changing the rating while the popover is open preserves the draft comment. Submitting closes the popover, retains the selected rating and comment, and shows the existing “Feedback received” status. Dismissing a new unsubmitted rating clears that draft selection. If already-submitted feedback is reopened, dismissing an unsubmitted change restores the last submitted value instead of deleting it.

### Layout

The popover is rendered through a portal and uses fixed positioning so it does not participate in message layout or get clipped by the scrollable transcript. It is positioned above the anchor by default, flips below when there is insufficient room, and is clamped to the viewport on narrow screens. Its position is recalculated while the transcript or viewport scrolls and when the viewport resizes.

The popover remains non-modal: the rest of the page is available, and `aria-modal` is not used. The form has an accessible dialog name, and the close button has a visible focus state and an explicit accessible label.

## Transcript scrolling

The message list becomes the only element changed by chat auto-scrolling. The existing call to `scrollIntoView` is removed because it can scroll the page as well as the transcript.

The message list tracks whether the user is near its bottom. Sending a prompt forces the transcript to the bottom once. New streamed content continues to follow only while the user remains near the bottom; if the user scrolls upward, their reading position is preserved. Reaching the bottom restores automatic following. Scrolling is smooth for a submitted prompt and immediate for frequent streaming updates to avoid repeated animations.

Opening, editing, submitting, or closing feedback never changes the transcript height and therefore never triggers an auto-scroll.

## Visual selection policy

An explicit visualization request instructs the model to choose exactly one of the following paths:

1. **Trusted chart:** use a server tool when the authorized application snapshot contains a relevant quantitative comparison.
2. **Slide visual:** use OpenAI’s hosted image-generation tool when the request is conceptual, illustrative, or presentation-oriented and no exact plotted comparison is required.

The chart path always wins when both paths could apply. Generated images must not be used to display exact operational measurements, financial figures, supplier scores, order identifiers, or other facts that require graphical accuracy. The accompanying text remains responsible for factual statements.

The first implementation supports the existing supplier matrix and bubble chart plus a reusable operational bar chart for compatible numeric measures such as affected, covered, and uncovered builds. Unsupported or mixed-unit measures do not become charts; the assistant falls back to a slide visual when that is suitable, or explains that the available data is not chart-ready.

## Trusted chart architecture

`lib/chat-extensions.ts` continues to expose server-executed visualization tools over the already-authorized `AppContext`.

- The existing supplier-portfolio tool remains responsible for matrix and bubble data.
- A small context-chart resolver derives supported bar-chart specifications from authorized metrics and rows.
- Tool input contains only a server-known visual identifier, presentation choice, and concise reason. It never accepts arbitrary labels or numeric values from the model.
- The tool validates the requested identifier against the visual catalog available for the current context and returns a discriminated, fully resolved chart specification.

The client receives only validated chart specifications. A generic operational bar-chart component renders simple comparisons, while the existing supplier visualization component continues to render matrix and bubble views. Shared visual extraction code accepts only completed, schema-valid tool output.

This boundary prevents the model from inventing chart data and keeps source selection and role-based financial filtering authoritative on the server.

## Generated-image architecture

In live mode, `app/api/chat/route.ts` adds the OpenAI Responses API hosted image-generation tool alongside the trusted chart tools. It requests one medium-quality landscape WebP suitable for a presentation, using the provider-supported `1536x1024` size. The main model decides whether to call it according to the visual selection policy. The image-generation result is returned as base64 data in the assistant’s tool part.

The client validates the completed output, constructs a WebP data URL, and renders it with concise alternative text and a Download image action. No arbitrary HTML, external image URL, or script from tool output is rendered.

The system prompt tells image generation to create a clean executive presentation visual, avoid embedding precise operational facts, and avoid confidential identifiers. It also limits the response to one visual tool call.

OpenAI documents the hosted image-generation tool as a Responses API tool whose completed call returns a base64 image result: <https://developers.openai.com/api/docs/guides/tools-image-generation>.

## Demo behavior

The feature remains demonstrable without a live API key.

- Quantitative visualization requests use the same deterministic, server-derived chart specifications as live mode.
- Presentation-image requests return a clearly labeled deterministic slide-style SVG preview derived from non-sensitive workflow themes. The preview is not presented as an AI-generated image.
- The mock and live responses normalize to the same client-facing visual schema so rendering behavior does not diverge.

## Rendering inside messages

A focused message-visual component examines each assistant message rather than deriving a single visualization from the latest conversation state. It renders completed chart or image output immediately after that message’s Markdown content and before answer actions.

Assistant messages containing a visual may use the full transcript width; text-only messages retain their current width. Charts and images fit the available width without widening the transcript. Images retain their aspect ratio. Existing chart accessibility descriptions, semantic tables, decision labels, and dark-theme tokens remain in use.

When a supplier tool output has already rendered inside a message, the same visualization is not repeated in the separate Results section. Findings, action menus, and other existing results remain unchanged.

## Failure handling

- Incomplete, failed, stale, or malformed tool output does not render.
- A chart resolver that cannot produce a valid same-unit numeric comparison returns no chart rather than coercing strings or inventing values.
- An image result must be non-empty base64 and must remain within the expected image tool shape.
- A visual tool failure leaves the assistant’s text response intact and shows a compact, retryable visual status in the message when the SDK provides an error part.
- A failed visual never produces a broken image element, unsafe URL, or duplicate fallback visual.

## Component and file boundaries

- `app/answer-actions.tsx`: popover interaction, focus management, dismissal, and feedback controls.
- `app/supply-chain-app.tsx`: active feedback state, transcript scroll policy, and per-message visual placement.
- `app/chat-message-visual.tsx`: schema-valid inline chart/image rendering and image download behavior.
- `app/operational-bar-chart.tsx`: accessible generic bar-chart presentation.
- `lib/chat-visuals.ts`: trusted context-chart schemas, catalog derivation, validation, and demo selection.
- `lib/chat-extensions.ts`: model-callable trusted chart tools.
- `lib/chat.ts`: visual selection and image-safety prompt instructions plus deterministic demo reply behavior.
- `app/api/chat/route.ts`: live image-generation tool registration and mock visual streaming.
- `app/globals.css`: popover, inline visual, responsive, focus, and theme styles.

The exact number of files may be reduced during implementation if a module remains small, but chart derivation, visual rendering, and feedback positioning remain separate responsibilities.

## Testing

Test-driven implementation adds or updates coverage for:

### Feedback and scrolling

- opening the selected rating in an accessible popover;
- close-button, Cancel, Escape, and outside-pointer dismissal;
- initial focus and focus restoration;
- draft comment retention while switching ratings;
- submitted feedback retention and restoration;
- only one open feedback popover;
- no transcript-height expansion;
- page-independent transcript scrolling;
- following while near the bottom and preserving position after scrolling upward.

### Visual selection and trust

- chart catalogs contain only authorized, server-derived data;
- incompatible, missing, non-finite, or mixed-unit measures are rejected;
- supplier portfolio output continues to validate;
- the system prompt prefers trusted charts and limits explicit visual requests to one tool;
- the live route registers the image-generation tool only when a live key is available;
- demo requests produce deterministic chart or clearly labeled SVG preview output.

### Inline rendering

- the visual appears in the assistant message that produced it;
- charts use the full resolved values and accessible labels;
- completed base64 image output renders with alternative text and a download action;
- partial, failed, stale, and malformed outputs do not render;
- inline supplier visuals are not duplicated in Results;
- visual messages stay within the transcript at desktop and mobile widths.

## Verification

After the red-green-refactor cycles, run:

1. focused Vitest files during development;
2. `npm test`;
3. `npm run typecheck`;
4. `npm run build`;
5. browser checks for feedback positioning, streaming scroll behavior, inline charts, demo slide previews, light/dark themes, keyboard navigation, and a 390-pixel viewport.

## Out of scope

- Arbitrary user-authored chart datasets or CSV uploads.
- Editing a previously generated image.
- Multiple visuals in one assistant response.
- Persisting generated images outside the current chat message.
- Exporting a complete PowerPoint deck.
- Adding image-generation settings or a manual chart/image mode selector.
