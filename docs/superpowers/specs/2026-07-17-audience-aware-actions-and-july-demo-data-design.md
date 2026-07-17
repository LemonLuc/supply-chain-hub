# Audience-Aware Actions and July Demo Data Design

## Goal

Make every directed Supply Chain Hub action read correctly for both the person initiating it and the person receiving it, while refreshing Lukas's Microsoft Outlook naming and all active mock dates to July 2026 / calendar week 30.

## Approaches Considered

1. **Audience-aware action metadata (selected).** Keep the existing `label` as the initiator-facing command and add one general `recipientLabel` for any task assignment or approval handoff. Store both labels on approval requests and select the correct one at render time. This is explicit, testable, and works for every persona without attempting to rewrite natural language.
2. **Automatic verb rewriting.** Derive recipient copy from labels such as “Write Dana Narid for review.” This would be brittle across names, verbs, languages, and future action wording.
3. **Persona- or label-specific UI conditions.** Special-case Dana, Lukas, and Lucía in the component. This would repeat the bug for every new action and is rejected.

## Action Model

`WorkflowAction.label` remains the initiator-facing label used in menus, requests, audit drafts, notices, and submitted-request cards. `WorkflowAction.recipientLabel` is the recipient-facing action and is required by the TypeScript model whenever `assigneePersona` or `reviewerPersona` is present. Directed actions may target an assignee or a reviewer, never both. Local/self-task actions may optionally provide a recipient label for the personal task card.

A shared `getRecipientActionLabel` helper resolves recipient copy. Assignment cards and incoming approval cards use this helper, while submitted approvals retain the initiator label. The API action result also returns `recipientActionLabel` so all clients receive the same audience-aware semantics.

Current directed labels become:

- Dana: “Assign recovery check to logistics” → Lukas: “Run recovery check”.
- Lukas: “Write Dana Narid for review” → Dana: “Review delivery risk summary”.
- Dana: “Ask Lucia Lopez for exception review” → Lucía: “Review six-build coverage exception”.

## Approval Status

Submitted cards remain relative to the sender: “Pending review by Dana Narid”, “Approved by Dana Narid”, or “Denied by Dana Narid”. Incoming cards are relative to the reviewer: “Review pending”, “Approved”, or “Denied”. Approve and deny button accessible names use the recipient-facing label.

Optimistic approval requests and completed API results populate the same two labels. Rejected workflows still remove optimistic requests and show the existing error notice.

## Microsoft Outlook Naming

Lukas's risk workflow shows “Microsoft Outlook” in source settings and “Create Microsoft Outlook recovery task” in the action menu. The stable connector id remains `outlook`, so permissions and request payloads do not change. Procurement and executive Microsoft 365 aggregation remains unchanged.

## July 2026 Demo Calendar

The operational demo is anchored to Friday, 17 July 2026. The risk radar covers next week, calendar week 30 (20–26 July 2026):

- FedEx backup delivery: Tuesday, 21 July 2026 at 10:30.
- Original DHL delivery: Wednesday, 22 July 2026.
- Delayed DHL delivery: Thursday, 23 July 2026.
- Supplier workbook modifications: 16–17 July 2026.
- Supplier follow-up reviews and reservation deadlines: 20–24 July 2026.

Risk questions, prompts, summaries, metrics, evidence, workbook versions, timestamps, and next-review fields use these dates. Static June references are removed from active `app/` and `lib/` mock content.

## Testing

- Action workflow tests prove every directed action has recipient copy and the API result exposes it.
- UI tests prove initiator and recipient profiles render different labels and statuses for the same approval.
- Existing assignment tests continue proving Lukas can complete “Run recovery check”.
- Source tests prove Lukas sees “Microsoft Outlook” while connector id `outlook` remains stable.
- Demo-data tests prove the active data contains CW 30 / July dates and no June-era mock timestamps.
- Run the full Vitest suite, strict TypeScript check, and production build before completion.
