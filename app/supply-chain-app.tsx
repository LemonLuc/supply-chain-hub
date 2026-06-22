"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  ExternalLink,
  FileCheck2,
  ListChecks,
  Mail,
  RotateCcw,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Square,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { mockUsers, type CurrentUser } from "@/lib/auth";
import { supportedModels, thinkingLevels, type SupportedModel, type ThinkingLevel } from "@/lib/chat";
import { buildAppContext, buildRoleToolSources, resolveWorkflowForPrompt } from "@/lib/context";
import { workflows, type WorkflowAction, type WorkflowKey } from "@/lib/demo-data";
import { getPersonaPolicy, personas, type PersonaId } from "@/lib/permissions";

type ApprovalStatus = "pending" | "approved" | "denied";

type ApprovalRequest = {
  id: string;
  actionLabel: string;
  workflowKey: WorkflowKey;
  requesterPersona: PersonaId;
  reviewerPersona: PersonaId;
  draft: string;
  status: ApprovalStatus;
};

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<(typeof message.parts)[number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

function messageReasoningParts(message: UIMessage) {
  return message.parts.filter(
    (part): part is Extract<(typeof message.parts)[number], { type: "reasoning" }> =>
      part.type === "reasoning" && part.text.trim().length > 0,
  );
}

function ReasoningSummary({ message }: { message: UIMessage }) {
  const reasoningParts = messageReasoningParts(message);
  const isFinished = reasoningParts.length > 0 && reasoningParts.every((part) => part.state === "done");
  const [expanded, setExpanded] = useState(() => !isFinished);
  const reasoningText =
    reasoningParts.length > 0
      ? reasoningParts.map((part) => part.text)
      : ["Checked role permissions, selected tools, retrieved grounded records, and prepared the response summary."];

  useEffect(() => {
    setExpanded(!isFinished);
  }, [isFinished, message.id]);

  const label = `${expanded ? "Hide" : "Show"} reasoning`;

  return (
    <section className={`reasoning-summary ${expanded ? "expanded" : ""}`} aria-label="Reasoning">
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={label}
        onClick={() => setExpanded((current) => !current)}
      >
        <ChevronDown aria-hidden="true" />
        <span>
          <strong>Reasoning</strong>
          <small>{reasoningParts.length === 0 ? "Available" : isFinished ? "Finished" : "Streaming"}</small>
        </span>
      </button>
      {expanded && (
        <div className="reasoning-content">
          {reasoningText.map((text, index) => (
            <p key={`${message.id}-reasoning-${index}`}>{text}</p>
          ))}
        </div>
      )}
    </section>
  );
}

function AssistantMarkdown({ text }: { text: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

function actionIcon(action: WorkflowAction) {
  if (action.kind === "draft") return Mail;
  if (action.kind === "approval") return ShieldCheck;
  if (action.kind === "share") return ExternalLink;
  return FileCheck2;
}

function AiMark() {
  return (
    <div className="ai-mark" aria-label="Supply Chain Hub AI mark">
      <Sparkles aria-hidden="true" />
    </div>
  );
}

function actionReviewer(workflowKey: WorkflowKey, action: WorkflowAction): PersonaId {
  if (workflowKey === "consolidate" || action.kind === "approval") return "executive";
  return "procurement";
}

function approvalStatusText(request: ApprovalRequest) {
  const reviewer = mockUsers[request.reviewerPersona].name;
  if (request.status === "approved") return `Approved by ${reviewer}`;
  if (request.status === "denied") return `Denied by ${reviewer}`;
  return `Pending review by ${reviewer}`;
}

export function SupplyChainApp({ currentUser }: { currentUser: CurrentUser }) {
  const [persona, setPersona] = useState<PersonaId>(currentUser.persona);
  const [workflowKey, setWorkflowKey] = useState<WorkflowKey>("risks");
  const [model, setModel] = useState<SupportedModel>("gpt-5.4-mini");
  const [thinking, setThinking] = useState<ThinkingLevel>("high");
  const [input, setInput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sourceSelection, setSourceSelection] = useState<Record<string, boolean>>({});
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ transport });
  const activeUser = mockUsers[persona];
  const personaPolicy = getPersonaPolicy(persona);
  const roleToolSources = useMemo(() => buildRoleToolSources(persona), [persona]);
  const suggestedPrompts = useMemo(
    () => personaPolicy.allowedWorkflows.flatMap((key) => workflows[key].suggestedPrompts),
    [personaPolicy.allowedWorkflows],
  );
  const selectedToolCount = useMemo(
    () => roleToolSources.filter((source) => sourceIsSelected(source.toolId, source.selected)).length,
    [roleToolSources, sourceSelection],
  );
  const isBusy = status === "submitted" || status === "streaming";
  const selectedSourceIds = useMemo(
    () => getSelectedSourceIdsForWorkflow(workflowKey),
    [sourceSelection, roleToolSources, workflowKey],
  );
  const appContext = useMemo(
    () => buildAppContext(workflowKey, persona, selectedSourceIds),
    [workflowKey, persona, selectedSourceIds],
  );

  function sourceIsSelected(toolId: string, fallback: boolean) {
    return sourceSelection[toolId] ?? fallback;
  }

  function getSelectedSourceIdsForWorkflow(nextWorkflowKey: WorkflowKey) {
    return roleToolSources
      .filter((source) => source.workflowKey === nextWorkflowKey && sourceIsSelected(source.toolId, source.selected))
      .map((source) => source.id);
  }

  function resetRunState() {
    setHasRun(false);
    setActionNotice("");
    setActionMenuOpen(false);
    setMessages([]);
    clearError();
  }

  function changePersona(nextPersona: PersonaId) {
    setPersona(nextPersona);
    const nextPolicy = getPersonaPolicy(nextPersona);
    if (!nextPolicy.allowedWorkflows.includes(workflowKey)) setWorkflowKey(nextPolicy.allowedWorkflows[0] ?? "risks");
    setSourceSelection({});
    resetRunState();
  }

  async function submitPrompt(prompt: string) {
    const nextPrompt = prompt.trim();
    if (!nextPrompt || isBusy) return;
    const nextWorkflowKey = resolveWorkflowForPrompt(nextPrompt, persona);
    const nextSelectedSourceIds = getSelectedSourceIdsForWorkflow(nextWorkflowKey);

    clearError();
    setInput("");
    setWorkflowKey(nextWorkflowKey);
    setHasRun(true);
    setActionNotice("");
    setActionMenuOpen(false);
    await sendMessage(
      { text: nextPrompt },
      { body: { workflowKey: nextWorkflowKey, model, thinking, demoPersona: persona, selectedSourceIds: nextSelectedSourceIds } },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitPrompt(input);
  }

  function runAction(action: WorkflowAction) {
    const reviewerPersona = actionReviewer(workflowKey, action);
    const reviewer = mockUsers[reviewerPersona];
    const requester = mockUsers[persona];
    const evidence = appContext.rows.length
      ? appContext.rows.map((row) => `${row.subject}: ${row.evidence}`).join(" ")
      : appContext.answer.summary;
    const draft = [
      `${action.label}`,
      `From ${requester.name} to ${reviewer.name}.`,
      `${appContext.answer.headline}: ${appContext.answer.summary}`,
      `Evidence: ${evidence}`,
      `Requested action: ${action.detail}`,
    ].join("\n\n");
    const request: ApprovalRequest = {
      id: `approval-${approvalRequests.length + 1}`,
      actionLabel: action.label,
      workflowKey,
      requesterPersona: persona,
      reviewerPersona,
      draft,
      status: "pending",
    };

    setApprovalRequests((current) => [...current, request]);
    setActionMenuOpen(false);
    setActionNotice(`Approval request sent to ${reviewer.name}.`);
  }

  function decideApproval(id: string, status: Extract<ApprovalStatus, "approved" | "denied">) {
    setApprovalRequests((current) =>
      current.map((request) =>
        request.id === id && request.reviewerPersona === persona && request.status === "pending"
          ? { ...request, status }
          : request,
      ),
    );
  }

  const incomingApprovals = approvalRequests.filter((request) => request.reviewerPersona === persona);
  const submittedApprovals = approvalRequests.filter(
    (request) => request.requesterPersona === persona && request.reviewerPersona !== persona,
  );

  return (
    <main className="app-shell" data-theme={theme}>
      <section className="workspace">
        <header className="workspace-header">
          <div className="app-title">
            <AiMark />
            <h1>Ask Supply Chain Hub</h1>
          </div>
          <section className="top-user-controls" aria-label="User and role controls">
            <label className="identity-picker">
              <span>Demo identity</span>
              <select
                aria-label="Demo identity"
                value={persona}
                onChange={(event) => changePersona(event.target.value as PersonaId)}
              >
                {personas.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
            <div className="user-panel" aria-label="Signed-in user">
              <img className="user-avatar" src={activeUser.avatarSrc} alt={`${activeUser.name} avatar`} />
              <div className="user-details">
                <strong>{activeUser.name}</strong>
                <span>{activeUser.role}</span>
                <small>{activeUser.businessUnit}</small>
              </div>
            </div>
            <button
              className="theme-switch"
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            >
              <span className="theme-switch-track" aria-hidden="true">
                <span className="theme-switch-thumb" />
              </span>
            </button>
          </section>
        </header>

        <section className="chat-panel" aria-label="Ask Supply Chain Hub">
          <div className="chat-toolbar">
            <div>
              <span className="context-line">
                <span className="live-dot" aria-hidden="true" />
                {selectedToolCount} / {roleToolSources.length} data sources selected
              </span>
            </div>
            <div className="chat-controls">
              <button
                className="icon-button"
                type="button"
                aria-expanded={settingsOpen}
                aria-label={`${settingsOpen ? "Close" : "Open"} chat settings`}
                title={`${settingsOpen ? "Close" : "Open"} chat settings`}
                onClick={() => setSettingsOpen((current) => !current)}
              >
                <Settings2 aria-hidden="true" />
              </button>
              {(messages.length > 0 || hasRun) && (
                <button className="icon-button" type="button" aria-label="Clear conversation" title="Clear conversation" onClick={resetRunState}>
                  <RotateCcw aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {settingsOpen && (
            <section className="chat-settings-panel" aria-label="Chat settings">
              <div className="settings-heading">
                <div>
                  <h3>Settings</h3>
                  <p>Configure tools once, then reselect later when the workflow changes.</p>
                </div>
              </div>
              <div className="chat-selectors">
                <label>
                  <span>Model</span>
                  <select aria-label="Model" value={model} onChange={(event) => setModel(event.target.value as SupportedModel)}>
                    {supportedModels.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                </label>
                <label>
                  <span>Thinking level</span>
                  <select aria-label="Thinking level" value={thinking} onChange={(event) => setThinking(event.target.value as ThinkingLevel)}>
                    {thinkingLevels.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="source-grid settings-source-grid">
                {roleToolSources.map((source) => {
                  const checked = sourceIsSelected(source.toolId, source.selected);
                  return (
                    <label className={`source-item ${checked ? "selected" : ""}`} key={source.toolId}>
                      <input
                        aria-label={source.name}
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setSourceSelection((current) => ({
                          ...current,
                          [source.toolId]: event.target.checked,
                        }))}
                      />
                      <Database aria-hidden="true" />
                      <span><strong>{source.name}</strong><small>{source.category} · {source.detail}</small></span>
                      <span className="source-state">{checked ? "Authorized" : "Not used"}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          <div className="prompt-row" aria-label="Suggested questions">
            {suggestedPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => void submitPrompt(prompt)}>{prompt}</button>
            ))}
          </div>

          {messages.length > 0 && (
            <div className="message-list" aria-label="Chat messages" aria-live="polite">
              {messages.map((message) => (
                <div className={`message ${message.role}`} key={message.id}>
                  <span>{message.role === "user" ? "You" : "Supply Chain Hub"}</span>
                  {message.role === "assistant" && <ReasoningSummary message={message} />}
                  {messageText(message) &&
                    (message.role === "assistant" ? (
                      <AssistantMarkdown text={messageText(message)} />
                    ) : (
                      <p>{messageText(message)}</p>
                    ))}
                </div>
              ))}
              {status === "submitted" && <div className="thinking-state">Connecting to authorized tools and retrieving records...</div>}
            </div>
          )}

          {hasRun && appContext.recommendedActions.length > 0 && (
            <section className="chat-action-menu" aria-label="Agentic follow-up actions">
              <button
                className="action-menu-toggle"
                type="button"
                aria-expanded={actionMenuOpen}
                aria-label={`${actionMenuOpen ? "Close" : "Open"} action menu`}
                onClick={() => setActionMenuOpen((current) => !current)}
              >
                <ListChecks aria-hidden="true" />
                <span>Action</span>
                <ChevronDown aria-hidden="true" />
              </button>
              {actionMenuOpen && (
                <div className="action-menu-list">
                  {appContext.approval && (
                    <div className="approval-banner compact">
                      <ShieldCheck aria-hidden="true" />
                      <div><strong>{appContext.approval.label}</strong><span>{appContext.approval.detail}</span></div>
                    </div>
                  )}
                  {appContext.recommendedActions.map((action) => {
                    const Icon = actionIcon(action);
                    return (
                      <button key={action.label} type="button" onClick={() => runAction(action)}>
                        <Icon aria-hidden="true" />
                        <span><strong>{action.label}</strong><small>{action.detail}</small></span>
                        <ChevronRight aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              )}
              {actionNotice && <p className="action-notice" role="status"><Check aria-hidden="true" />{actionNotice}</p>}
            </section>
          )}

          {error && <p className="chat-error" role="alert">{error.message}</p>}

          <form className="chat-composer" onSubmit={handleSubmit}>
            <textarea
              aria-label="Message"
              placeholder="Ask about a part, delivery, supplier, order, or operational task"
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submitPrompt(input);
                }
              }}
            />
            {isBusy ? (
              <button className="send-button" type="button" aria-label="Stop response" title="Stop response" onClick={() => void stop()}>
                <Square aria-hidden="true" />
              </button>
            ) : (
              <button className="send-button" type="submit" aria-label="Send message" title="Send message" disabled={!input.trim()}>
                <Send aria-hidden="true" />
              </button>
            )}
          </form>
        </section>

        {(incomingApprovals.length > 0 || submittedApprovals.length > 0) && (
          <section className="approval-workflow" aria-label="Human approval workflow">
            {incomingApprovals.length > 0 && (
              <div>
                <div className="section-title">
                  <div><p className="eyebrow">Human in the loop</p><h3>Approval queue</h3></div>
                  <span className="source-note"><ShieldCheck aria-hidden="true" />Assigned to {activeUser.name}</span>
                </div>
                <div className="approval-list">
                  {incomingApprovals.map((request) => (
                    <article className={`approval-card status-${request.status}`} key={`incoming-${request.id}`}>
                      <div className="approval-card-heading">
                        <div>
                          <strong>{request.actionLabel}</strong>
                          <span>From {mockUsers[request.requesterPersona].name}</span>
                        </div>
                        <span className="status-chip">{approvalStatusText(request)}</span>
                      </div>
                      <p>{request.draft}</p>
                      {request.status === "pending" && (
                        <div className="approval-controls">
                          <button type="button" onClick={() => decideApproval(request.id, "approved")} aria-label={`Approve ${request.actionLabel}`}>
                            <Check aria-hidden="true" />
                            Approve
                          </button>
                          <button type="button" onClick={() => decideApproval(request.id, "denied")} aria-label={`Deny ${request.actionLabel}`}>
                            <Square aria-hidden="true" />
                            Deny
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {submittedApprovals.length > 0 && (
              <div>
                <div className="section-title">
                  <div><p className="eyebrow">Submitted for review</p><h3>Submitted requests</h3></div>
                </div>
                <div className="approval-list">
                  {submittedApprovals.map((request) => (
                    <article className={`approval-card status-${request.status}`} key={`submitted-${request.id}`}>
                      <div className="approval-card-heading">
                        <div>
                          <strong>{request.actionLabel}</strong>
                          <span>Reviewer: {mockUsers[request.reviewerPersona].name}</span>
                        </div>
                        <span className="status-chip">{approvalStatusText(request)}</span>
                      </div>
                      <p>{request.draft}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {hasRun && (
          <section className="results" aria-label="Supply Chain Hub results">
            <div className="result-grid">
              <article className="result-summary">
                <p className="eyebrow">Operational answer</p>
                <h3>{appContext.answer.headline}</h3>
                <p>{appContext.answer.summary}</p>
                <div className="metric-strip">
                  {appContext.answer.metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
                  {personaPolicy.canViewFinancials && appContext.answer.financialMetrics?.map(([label, value]) => (
                    <div className="financial-metric" key={label}><span>{label}</span><strong>{value}</strong></div>
                  ))}
                </div>
              </article>

            </div>

            {appContext.decisionSupport?.heatMap && (
              <section className="heatmap-section">
                <div className="section-title">
                  <div><p className="eyebrow">Decision support</p><h3>Supplier portfolio heat map</h3></div>
                  <span className="source-note">Cost versus resilience</span>
                </div>
                <div className="heatmap">
                  {appContext.decisionSupport.heatMap.map((item) => (
                    <article className={`heat-cell resilience-${item.resilience.toLowerCase()}`} key={item.supplier}>
                      <span>{item.supplier}</span>
                      <strong>{item.recommendation}</strong>
                      <small>Cost: {item.cost} · Resilience: {item.resilience}</small>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="records-section">
              <div className="section-title">
                <div><p className="eyebrow">Grounded records</p><h3>Evidence returned by authorized tools</h3></div>
                <span className="source-note"><Database aria-hidden="true" />Synthetic demo records</span>
              </div>
              <div className="records-table-wrap">
                <table className="records-table" aria-label="Synthetic demo records">
                  <thead>
                    <tr>
                      <th scope="col">Record</th>
                      <th scope="col">Status</th>
                      <th scope="col">Evidence</th>
                      {personaPolicy.canViewFinancials && <th scope="col">Financial</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {appContext.rows.map((row) => (
                      <tr key={row.subject}>
                        <td><strong>{row.subject}</strong><span>{row.detail}</span></td>
                        <td><span className={`status-chip status-${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span></td>
                        <td>{row.evidence}</td>
                        {personaPolicy.canViewFinancials && (
                          <td>{"financial" in row && row.financial && <strong className="financial-value">{row.financial}</strong>}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}
