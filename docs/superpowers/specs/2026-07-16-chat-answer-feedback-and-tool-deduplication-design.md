# Chat Answer Feedback and Tool Deduplication Design

## Goal

Ensure each user sees every authorized tool only once in chat settings, and add compact copy and feedback controls below each generated answer.

## Scope

This change covers the chat settings source list and per-answer actions in the existing Supply Chain Hub interface. Feedback is an MVP interaction stored only in React state for the current page lifetime. It does not add an API, database, analytics event, or cross-session persistence.

## Tool Settings Design

`buildRoleToolSources` will produce one logical tool entry per stable source ID across all workflows authorized for the active persona. Each logical entry records every workflow in which the source is available. When duplicate workflow definitions have different descriptions, the first authorized workflow supplies the displayed name, category, and detail.

Tool selection will be keyed by the stable source ID instead of a workflow-qualified ID. A single checkbox therefore configures a tool once for the active persona and applies that selection to every authorized workflow that contains the source. A logical tool is selected by default when at least one of its authorized workflow definitions is selected by default. This preserves access to tools that were already active in any authorized workflow while removing conflicting duplicate toggles.

When a prompt resolves to a workflow, the request will include only selected logical tool IDs that are present in that workflow. Switching personas will continue to clear custom source selections because each persona has a different authorization boundary.

## Answer Action Design

Every assistant message containing text will render a small action row below the generated answer. The row will be left-aligned and contain, in order:

1. Copy answer
2. Helpful (thumbs up)
3. Not helpful (thumbs down)

The existing copy action will move from the message heading into this row. Clicking it writes the full plain-text answer to the Clipboard API and temporarily changes the icon and accessible label to confirm success.

Clicking either feedback button selects that rating for the specific assistant message and opens an inline feedback form immediately below the action row. The selected button has a visible pressed state. The form contains an optional text field, Submit feedback, and Cancel. Changing from thumbs up to thumbs down, or the reverse, keeps the form open and updates the selected rating.

Submitting records the rating and optional comment in component state for the current page lifetime, closes the form, and displays `Feedback received` for that message. Cancel closes the form and clears the unsubmitted rating and comment. A user may select a feedback button again after submission to replace the page-local response.

Only assistant messages with non-empty text receive these actions. User messages, loading indicators, reasoning summaries, and tool-only messages do not receive feedback controls.

## Component and State Boundaries

The existing `SupplyChainApp` remains the state owner because messages, clipboard confirmation, and reset behavior already live there. A small answer-actions component will encapsulate the per-message buttons and inline form so that the message rendering loop stays readable.

Feedback state will be keyed by message ID and contain the selected rating, optional comment, form visibility, and submission status. Clearing the conversation or switching persona naturally removes message-specific UI; feedback state will also be reset to prevent stale entries from accumulating.

## Failure and Accessibility Behavior

Clipboard calls will be awaited. If the Clipboard API is unavailable or rejects, the control will not show a false success state. The current MVP will keep the failure silent rather than adding a global error surface.

All icon buttons will have descriptive `aria-label` and `title` text. Feedback buttons will expose `aria-pressed`, the text field will be associated with its message-specific label, and feedback confirmation will use a polite status region. Submit and Cancel will be keyboard accessible native buttons.

## Styling

The action row will use small borderless or minimally bordered icon buttons consistent with the current theme tokens. It will sit below the markdown answer with restrained spacing, matching the familiar compact ChatGPT-style placement requested by the user. The feedback form will remain visually subordinate to the answer and fit within the assistant message width in both light and dark themes.

## Testing

Unit tests for `buildRoleToolSources` will verify that procurement receives one entry for shared SAP and Outlook tools, that logical IDs are unique, and that workflow membership is retained.

UI tests will verify that:

- settings render no duplicate accessible tool labels for a persona;
- one shared tool toggle affects requests for every workflow containing that tool;
- Copy answer appears below assistant content and writes the correct plain text;
- helpful and not-helpful buttons open the optional form and expose their pressed state;
- Submit shows `Feedback received` and closes the form;
- Cancel clears an unsubmitted response;
- user messages do not receive answer actions; and
- clearing the conversation or switching persona removes message feedback UI.

The completed change will be checked with the focused Vitest files, the full test suite, TypeScript type checking, and a production build.
