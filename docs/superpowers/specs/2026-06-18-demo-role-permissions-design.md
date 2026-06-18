# Demo Role Permissions Design

## Goal

Add a lightweight persona selector that demonstrates least-privilege dataset access. Standard logistics employees must not receive supplier-level impact data, while procurement leads may view and discuss it. Remove the architecture trace from the application.

## Personas And Policy

The demo has two personas:

- `logistics`: Standard logistics employee. This is the default persona and cannot view supplier-level impact data.
- `procurement`: Procurement lead. This persona can view supplier-level impact data.

A shared role-policy module maps each persona to capabilities. The initial capability is `canViewSupplierImpact`. This keeps the demo small while providing one place to add future dataset permissions.

## Interface

Place a labeled Persona selector in the left sidebar between the application identity and workflow navigation. It displays the full persona names and defaults to Standard logistics employee.

The supplier evidence table conditionally renders the Impact header and cells when `canViewSupplierImpact` is true. Switching persona applies immediately and clears the current chat conversation so privileged content cannot remain visible after moving to a lower-privilege role.

Aggregate metrics and workflow decision summaries remain visible to both personas. The permission applies specifically to the supplier-level impact dataset represented by the table's Impact column.

Remove the architecture trace section from the workspace. Remove its context payload and unused styles as part of the same focused cleanup.

## Server Boundary And Chat Context

Chat requests include the selected persona ID. The server normalizes unknown or missing persona values to `logistics`, rebuilds the application context, and applies the role policy before constructing the model prompt.

For logistics users, supplier objects omit the `impact` field. For procurement users, supplier objects include it. The browser is not trusted to provide capability flags or prefiltered data.

The deterministic mock response uses the same redacted context, so demo mode and live OpenAI mode follow identical access rules.

## Error Handling

- Missing or invalid persona IDs fall back to `logistics`.
- Role changes clear existing messages before future requests.
- No permission-denied error is shown because restricted fields are absent from the user's dataset rather than presented as unavailable actions.

## Testing

- Policy tests verify the least-privilege fallback and procurement capability.
- Context tests verify logistics supplier records omit impact and procurement records include it.
- UI tests verify the default persona, hidden Impact column, procurement visibility after switching, and removal of the architecture trace.
- API tests verify the route uses the supplied valid persona and defaults invalid values to logistics.
- The browser smoke test starts a conversation, changes persona, and verifies that the conversation is cleared.
- Existing test, typecheck, build, desktop browser, and mobile overflow checks remain required.

## Scope

This is a simulated permission system for demonstration. It does not add authentication, persistent sessions, identity providers, audit storage, or production authorization middleware.
