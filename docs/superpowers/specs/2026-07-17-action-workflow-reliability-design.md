# Action Workflow Reliability Design

## Goal

Keep the application in its intended mock-data demo mode while making action state honest and reliable. Demo personas remain switchable, approval cards appear only after a successful action response, and authorized actions retain a deterministic mock-data result when live Agents SDK orchestration fails.

## Root Causes

The client currently inserts an optimistic approval request before `/api/actions` completes. That makes **Submitted for review**, **Submitted requests**, and the recipient approval queue appear while the action is still loading, even though the server has not confirmed the action.

The action route builds its result from the static context in `lib/demo-data.ts`, but a configured live OpenAI key makes the route wait for Agents SDK orchestration. If orchestration throws, the route never returns the already-authorized deterministic result and the client shows **Action could not be completed. Please try again**.

`LOCK_DEMO_USER_ROLE` also allows server authorization to diverge from the browser-selected demo persona. This application uses mock personas and mock operational records, so demo persona selection must remain consistent across the client, chat route, and action route.

## Design

### Demo Persona Routing

Remove `LOCK_DEMO_USER_ROLE` branching from the chat and action routes. Both routes normalize the request's `demoPersona`, falling back to the server-provided default persona only when the request does not contain a valid demo persona. Existing workflow and source authorization still runs against that effective demo persona.

This is explicitly presentation-only behavior for the mock application. A production identity integration must replace the demo-persona boundary with server-derived claims rather than reusing this switch.

### Action Execution and Mock Fallback

The action route continues to validate the requested workflow, persona, sources, and action before execution. Unauthorized or unavailable actions still return `403` and never reach fallback handling.

For an authorized action with a live OpenAI key, the route first attempts Agents SDK orchestration. If that orchestration throws, the route returns `buildActionWorkflowResult(...)` with `orchestration: "demo-fallback"`. The result remains grounded in the same authorized `AppContext` and static mock records. A missing or sample key continues to use the deterministic path directly.

### Approval State

While `/api/actions` is pending, the UI shows only the existing action loading indicator. It does not insert an approval request into application state.

After a successful response, the client passes the result through `applyActionResult`. Reviewer actions create exactly one approval request at that point, using the response draft, reviewer, and recipient-facing label. Direct assignments and local actions retain their existing post-success behavior.

If the request returns a non-success response or the network fails, no approval or task is created. The existing error notice remains visible.

## Testing

- Replace the optimistic-approval test with a regression proving no submitted or incoming approval UI exists while the action request is unresolved, then proving it appears after success.
- Add an action-route regression where Agents SDK orchestration rejects and verify the authorized mock-data result returns `200` with `orchestration: "demo-fallback"` and the correct assignee metadata.
- Add route coverage proving a configured default demo role does not override the selected demo persona.
- Preserve existing tests for rejected actions, direct Dana-to-Lukas assignment, recipient-facing labels, approvals, and source authorization.

## Non-Goals

- Do not remove the optional Agents SDK demonstration path.
- Do not bypass action, workflow, persona, or source validation.
- Do not add persistence or replace the static mock records.
- Do not refactor unrelated chat, visualization, or portfolio behavior.
