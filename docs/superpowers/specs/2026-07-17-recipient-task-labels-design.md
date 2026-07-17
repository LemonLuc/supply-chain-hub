# Recipient-Facing Task Labels Design

## Goal

Show actions from the correct persona’s perspective. Dana Narid should initiate **Assign recovery check to logistics**, while Lukas Weber should receive an executable task titled **Run recovery check**.

## Design

Extend `WorkflowAction` with an optional recipient-facing task label. Assignment and audit surfaces continue using the existing action label, while personal task creation uses the recipient label when present and falls back to the action label otherwise.

For the recovery-check action:

- Sender action: `Assign recovery check to logistics`
- Recipient task: `Run recovery check`
- Owner: logistics persona / Lukas Weber
- Assignment notice: unchanged, preserving who assigned the task and to whom

The existing Outlook recovery task title will use the same metadata instead of a UI-only label special case. This keeps task naming declarative and avoids unreliable verb rewriting.

## Data Flow

1. Dana selects the assignment action.
2. The action workflow returns Lukas as `assigneePersona`.
3. The app creates a personal task owned by Lukas.
4. The task title comes from the action’s recipient-facing label.
5. Switching to Lukas’s profile shows **Run recovery check** with a **Mark done** control.

## Error Handling and Compatibility

Actions without a recipient-facing label retain their current title. Rejected action workflows create no task. Assignment notices, drafts, authorization checks, and approval behavior remain unchanged.

## Testing

Update the existing Dana-to-Lukas UI workflow test to assert that:

- Dana still sees and invokes **Assign recovery check to logistics**.
- Lukas sees **Run recovery check**, not the assignment command.
- The task can be marked done using the recipient-facing title.

Keep existing action-workflow and authorization tests green.
