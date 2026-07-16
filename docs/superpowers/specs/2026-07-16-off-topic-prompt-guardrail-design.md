# Off-Topic Prompt Guardrail Design

## Goal

Prevent Supply Chain Hub from processing prompts that are outside the application's business scope, including standalone requests such as `calculate 2x2`, while preserving legitimate supply-chain calculations, contextual follow-ups, and all existing chat workflows.

## Scope

The guardrail applies to every request handled by `POST /api/chat`, including live model responses, deterministic demo responses, and workbook review responses. It runs before application context construction, external-source loading, tool registration, or the main response generation.

Allowed requests include:

- Procurement, sourcing, suppliers, supplier risk, supplier capacity, supplier quality, inventory, logistics, shipments, purchase orders, demand forecasting, and production planning.
- Financial or mathematical analysis that materially supports one of those supply-chain topics.
- Questions about using Supply Chain Hub.
- Greetings, clarifications, and contextual follow-ups that support an allowed conversation.

Blocked requests include:

- Standalone general mathematics such as `calculate 2x2` or `calcualte 2x2`.
- General trivia, unrelated writing, unrelated programming, and other requests with no material connection to the application.
- Requests that add incidental supply-chain language only to disguise an otherwise unrelated task.

## Architecture

Add a focused `lib/prompt-scope.ts` module. It owns the scope policy, the user-facing refusal text, model-backed classification, the deterministic demo fallback, and removal of previously blocked prompt/refusal pairs from conversation history.

The live classifier uses the existing Vercel AI SDK and OpenAI Responses provider. It requests a structured decision from `gpt-5.4-nano` containing an allowed flag, confidence, and category. A request is blocked only when the model classifies it as off-topic with confidence greater than or equal to `0.7`. Ambiguous or low-confidence results continue.

The deterministic fallback runs when there is no live API key. It blocks obvious standalone arithmetic and other explicitly recognized off-topic request patterns, but permits recognized supply-chain terms, application-help prompts, and known conversational follow-ups. Unrecognized demo prompts continue so the MVP remains usable.

The route sanitizes conversation history before classification and before passing messages to the main model. When it finds the exact guardrail refusal in an assistant message, it removes that message and the immediately preceding user message. This prevents rejected content from contaminating later turns without requiring changes to the current client-side chat state.

## Request Flow

1. Parse and validate the request body and latest user message.
2. Remove previously blocked prompt/refusal pairs from the submitted message history.
3. Classify the latest prompt using recent sanitized conversation context.
4. If the prompt is confidently off-topic, return a normal Vercel UI message stream containing the refusal text.
5. If the prompt is allowed, ambiguous, or the guardrail failed, continue through the existing context, demo, workbook, tool, and live-response paths.
6. Pass only sanitized messages to the main model.

## Failure Behavior

The MVP fails open. If guardrail model execution, structured-output parsing, or another classifier dependency fails, the application logs a concise warning and continues with the existing chat flow. The warning must not contain the user's prompt or conversation content.

A successful off-topic classification is not an execution failure and always blocks the request.

## User Experience

Blocked prompts receive this assistant response:

> I can only help with supply-chain operations and analysis. Please connect your question to suppliers, procurement, inventory, logistics, shipments, demand planning, production, or this application.

The response uses the existing chat stream protocol and therefore appears like any other assistant answer. No new UI state or styling is required.

## Testing

Unit tests cover:

- Blocking standalone arithmetic, including the user's misspelled example.
- Allowing supply-chain calculations even when they contain arithmetic.
- Allowing application help and contextual follow-ups.
- Blocking high-confidence live off-topic classifications.
- Continuing on low-confidence decisions and classifier failures.
- Removing rejected prompt/refusal pairs from history.

Route tests cover:

- Short-circuiting before the main model when a prompt is blocked.
- Returning the refusal through the existing UI stream protocol.
- Passing sanitized history to the main model on a later allowed turn.
- Continuing normally when the guardrail reports an execution failure.

The final verification runs the focused tests, full Vitest suite, TypeScript typecheck, and production build.

## Non-Goals

- Replacing the existing Vercel AI SDK chat implementation with the OpenAI Guardrails client or Agents SDK.
- Adding moderation, jailbreak, PII, or output guardrails.
- Persisting guardrail decisions outside the submitted conversation.
- Adding a guardrail administration UI or runtime configuration panel.
