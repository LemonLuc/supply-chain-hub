# Role-Aware Actions and Microsoft Tool Grouping Design

## Objective

Align follow-up actions and settings tools with the active persona's role-based access. Dana Narid must never be offered an action that asks Dana Narid to review her own work. The procurement carrier-recovery prompt must route to the supplier-alternatives workflow, where Dana can assign the recovery check directly to Lukas Weber and separately escalate the uncovered-build decision to Dr. Lucía López.

The settings panel must show Microsoft connectors at the authorization granularity of each persona: separate Outlook, SharePoint, and Word connectors for the Logistics Planner, and one Microsoft 365 Suite connector for the Procurement Team Lead and Chief Logistics Officer.

## Scope

This change includes:

- persona eligibility, assignee, and reviewer metadata for workflow actions;
- server-side and client-side enforcement of the same action policy;
- direct cross-persona task assignment from Dana to Lukas;
- corrected prompt routing for the procurement recovery-check prompt;
- separate default-on Microsoft connectors for Lukas;
- one default-on Microsoft 365 Suite connector for Dana and Lucía;
- logical connector selection that expands to the workflow's granular Microsoft source IDs;
- regression coverage for context construction, API authorization, UI actions, and settings.

Session expiry, token refresh, and reauthorization flows are out of scope. The demo session is treated as active.

## Root Cause

`resolveWorkflowForPrompt` currently recognizes `carrier` as a risk-workflow keyword but does not recognize `uncovered builds` or the procurement suggested prompt as supplier-alternatives context. As a result, Dana's prompt “Assign the carrier recovery check for the uncovered builds.” resolves to `risks` instead of `delay`.

The risk workflow exposes a static action named “Write Dana Narid for review.” Actions are filtered only by selected source IDs, not by persona eligibility. `getActionReviewer` then infers a reviewer from the requester's rank, so Dana can see a label addressed to herself even though execution would route the approval to Lucía. The visible label, permitted persona, and execution policy are therefore inconsistent.

Settings tools are currently deduplicated only by exact source ID. That supports shared sources such as SAP and Outlook, but cannot represent multiple granular workflow sources behind one role-level Microsoft 365 connector.

## Action Policy Model

`WorkflowAction` will gain explicit optional policy fields:

```ts
type WorkflowAction = {
  label: string;
  detail: string;
  kind: "draft" | "update" | "share" | "approval";
  sourceIds?: string[];
  allowedPersonas?: PersonaId[];
  assigneePersona?: PersonaId;
  reviewerPersona?: PersonaId;
};
```

The metadata is authoritative:

- `allowedPersonas` controls whether an action enters `recommendedActions`.
- `assigneePersona` represents direct task ownership and does not create an approval.
- `reviewerPersona` represents a human approval and creates an approval request.
- actions without an assignee or reviewer execute for the active persona.

The action definitions will encode these role-specific outcomes:

- “Write Dana Narid for review” is available only to `logistics` and is reviewed by `procurement`.
- “Assign recovery check to logistics” is available only to `procurement` and assigns a task to `logistics` without approval.
- “Ask Lucia Lopez for exception review” is available only to `procurement` and is reviewed by `executive`.
- executive consolidation actions are available only to `executive` and require no downstream reviewer.

`buildAppContext` will filter actions by both selected sources and persona eligibility. Because `/api/actions` finds actions only inside this filtered context, a manually submitted label outside the active persona's policy receives HTTP 403.

`getActionReviewer` will read the action's explicit `reviewerPersona` instead of inferring the next role from the active persona. A matching `getActionAssignee` helper will expose the explicit assignee.

## Prompt Routing

`resolveWorkflowForPrompt` will first compare the normalized input with the active persona's authorized suggested prompts. An exact suggested-prompt match selects that prompt's workflow before generic keyword matching.

The supplier-alternatives keyword set will also include `uncovered build`, `uncovered builds`, and `recovery check`. Because the delay candidate precedes the risk candidate, free-form procurement prompts containing both `recovery check` and `carrier` will resolve to `delay`.

This preserves general risk routing for ordinary carrier and shipment questions while making the procurement prompt deterministic.

## Direct Task Assignment

`ActionWorkflowResult` will add nullable assignee identity fields:

```ts
assigneePersona: PersonaId | null;
assigneeName: string | null;
```

For Dana's recovery-check action, the action API returns:

- `assigneePersona: "logistics"`;
- `assigneeName: "Lukas Weber"`;
- `reviewerPersona: null`;
- a notice beginning with “Task assigned to Lukas Weber.”

The client will create a `PersonalTask` owned by the assignee persona. The task remains in local application state across persona switching, so it appears in Lukas's task list when the logistics persona becomes active. It never appears in Dana's approval queue or submitted-approval list.

Only explicit reviewer actions create optimistic approval requests. If the API rejects an action or a network error occurs, optimistic state is rolled back and the UI reports that the action could not be completed. The client must not fabricate a successful assignment or approval after a failed server response.

## Microsoft Connector Model

Workflow source IDs remain granular because rows, documents, and actions depend on specific products. The settings layer will project those workflow sources into logical role tools.

`RoleToolSource` will represent one visible connector and the underlying sources it controls:

```ts
type RoleToolSource = WorkflowSource & {
  toolId: string;
  sourceIds: string[];
  workflowKeys: WorkflowKey[];
  workflowLabels: string[];
};
```

For ordinary connectors, `sourceIds` contains one source ID. For the elevated Microsoft 365 Suite connector, `sourceIds` contains every Microsoft-backed source reachable through the persona's allowed workflows.

### Logistics Planner

The risk workflow will expose these separate default-on Microsoft sources:

- Outlook (`outlook`);
- Microsoft SharePoint (`sharepoint`);
- Microsoft Word (`word`).

They appear as three independent settings items and can be enabled or disabled separately. The demo session starts with all three authorized.

### Procurement Team Lead

Dana sees one default-on logical connector:

- `toolId`: `microsoft-365`;
- name: `Microsoft 365 Suite`;
- category: `Microsoft 365 MCP`;
- detail: `SharePoint, Word, Outlook, PowerPoint, Teams, Excel, and authorized Microsoft 365 apps`.

It aggregates the Microsoft-backed sources used by the risk and delay workflows, including Outlook, Teams, the SharePoint-hosted Excel register, SharePoint, and Word. PowerPoint and the remaining suite applications are represented by the suite authorization even when the current demo workflows do not consume a separate source ID for them.

### Chief Logistics Officer

Lucía sees the same single default-on Microsoft 365 Suite connector. It controls the granular Microsoft sources used by the executive workflow, currently including Word, while representing authorization to the whole suite.

## Connector Selection Data Flow

The settings state remains keyed by logical `toolId`. `getSelectedSourceIdsForWorkflow` will:

1. find selected logical tools that apply to the target workflow;
2. expand each logical tool to its `sourceIds`;
3. retain only source IDs present in the target workflow;
4. return them in the workflow's native source order.

Turning off `microsoft-365` therefore removes all Microsoft-backed sources from the request for Dana or Lucía. Turning it on restores them together. Turning off one of Lukas's separate Microsoft tools removes only that product.

Documents and actions keep their granular `sourceIds`, so disabling the logical suite consistently hides every dependent Microsoft-backed document and action without changing their domain definitions.

## UI Behavior

The settings panel continues to render one checkbox per `RoleToolSource` and continues to use “Authorized” and “Not used” as selection states. These labels describe the active demo session and connector use; they do not implement session expiry.

After Dana runs the procurement recovery-check prompt, the actions menu shows the supplier-alternatives actions, including:

- “Assign recovery check to logistics”;
- “Ask Lucia Lopez for exception review.”

It does not show “Write Dana Narid for review.” Clicking the assignment closes the menu, shows a successful assignment notice, and creates Lukas's task. Clicking the Lucia action creates an executive approval request.

## Error Handling and Security

- The API returns 403 when the action label is unavailable for the persona, workflow, or selected sources.
- Client non-2xx responses and network failures show an error and do not create an assignment, approval, or success notice.
- Persona changes clear conversation-local action notices while preserving already-created cross-persona tasks and approval requests.
- Unknown personas and workflows retain the existing safe normalization behavior.
- Source expansion is restricted to sources declared by the selected workflow, preventing a logical suite connector from injecting unrelated source IDs.

## Testing Strategy

### Context and routing tests

- The exact procurement recovery-check prompt resolves to `delay`.
- A free-form uncovered-build recovery prompt resolves to `delay` despite containing `carrier`.
- Procurement context excludes “Write Dana Narid for review.”
- Logistics context includes that action only when Outlook is selected.
- Each action exposes the expected assignee or reviewer metadata.

### Tool projection tests

- Logistics receives unique `outlook`, `sharepoint`, and `word` logical tools, all selected by default.
- Procurement receives exactly one `microsoft-365` logical tool for all Microsoft sources across risk and delay.
- Executive receives exactly one `microsoft-365` logical tool for the executive workflow.
- Logical tools remain unique and preserve workflow membership and native request ordering.

### API tests

- Dana cannot submit “Write Dana Narid for review,” even with Outlook selected.
- Dana's recovery-check assignment returns Lukas as assignee and no reviewer.
- Dana's Lucia escalation returns Lucía as reviewer and no assignee.
- Lukas's Dana escalation remains authorized.

### UI tests

- Dana's suggested recovery-check prompt sends `workflowKey: "delay"`.
- Dana sees role-appropriate actions and no self-review action.
- Direct assignment creates a task visible to Lukas and no approval queue item for Dana.
- Logistics settings show three separate Microsoft connectors.
- Procurement and executive settings show one Microsoft 365 Suite connector and no individual Microsoft product connectors.
- Disabling the suite removes every Microsoft-backed source ID from outgoing workflow requests.

### Final verification

Run the focused tests during red-green cycles, followed by:

```bash
npm test
npm run typecheck
npm run build
```

