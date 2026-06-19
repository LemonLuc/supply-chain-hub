"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Activity,
  Bot,
  Boxes,
  Check,
  ChevronRight,
  CircleUserRound,
  Database,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  Mail,
  RotateCcw,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { mockUsers, type CurrentUser } from "@/lib/auth";
import { supportedModels, thinkingLevels, type SupportedModel, type ThinkingLevel } from "@/lib/chat";
import { workflows, type WorkflowAction, type WorkflowKey } from "@/lib/demo-data";
import { canAccessWorkflow, getPersonaPolicy, personas, type PersonaId } from "@/lib/permissions";

const workflowNavigation: Record<WorkflowKey, { icon: LucideIcon }> = {
  risks: { icon: ScanSearch },
  delay: { icon: Boxes },
  consolidate: { icon: ShieldCheck },
};

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<(typeof message.parts)[number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n");
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
      <Sparkles aria-hidden="true" />
      <Sparkles aria-hidden="true" />
    </div>
  );
}

export function SupplyChainApp({ currentUser }: { currentUser: CurrentUser }) {
  const [persona, setPersona] = useState<PersonaId>(currentUser.persona);
  const [workflowKey, setWorkflowKey] = useState<WorkflowKey>("risks");
  const [model, setModel] = useState<SupportedModel>("gpt-5.4-mini");
  const [thinking, setThinking] = useState<ThinkingLevel>("medium");
  const [input, setInput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [sourceSelection, setSourceSelection] = useState<Record<string, boolean>>({});
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ transport });
  const workflow = workflows[workflowKey];
  const activeUser = mockUsers[persona];
  const personaPolicy = getPersonaPolicy(persona);
  const isBusy = status === "submitted" || status === "streaming";

  function sourceIsSelected(id: string, fallback: boolean) {
    return sourceSelection[`${workflowKey}:${id}`] ?? fallback;
  }

  function resetRunState() {
    setHasRun(false);
    setActionNotice("");
    setMessages([]);
    clearError();
  }

  function changePersona(nextPersona: PersonaId) {
    setPersona(nextPersona);
    if (!canAccessWorkflow(nextPersona, workflowKey)) setWorkflowKey("risks");
    resetRunState();
  }

  function changeWorkflow(nextWorkflow: WorkflowKey) {
    if (!canAccessWorkflow(persona, nextWorkflow)) return;
    setWorkflowKey(nextWorkflow);
    resetRunState();
  }

  async function submitPrompt(prompt: string) {
    const nextPrompt = prompt.trim();
    if (!nextPrompt || isBusy || !canAccessWorkflow(persona, workflowKey)) return;

    clearError();
    setInput("");
    setHasRun(true);
    setActionNotice("");
    const selectedSourceIds = workflow.sources
      .filter((source) => sourceIsSelected(source.id, source.selected))
      .map((source) => source.id);
    await sendMessage(
      { text: nextPrompt },
      { body: { workflowKey, model, thinking, demoPersona: persona, selectedSourceIds } },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitPrompt(input);
  }

  function runAction(action: WorkflowAction) {
    const messagesByKind = {
      draft: `${action.label} prepared as a draft. Review is required before sending.`,
      update: `${action.label} staged. Confirmation is required before the SAP record changes.`,
      share: `${action.label} prepared. The recipient list is ready for review.`,
      approval: `${action.label} submitted to the executive review queue. No supplier change has been made.`,
    };
    setActionNotice(messagesByKind[action.kind]);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-main">
          <div className="brand-lockup">
            <AiMark />
            <div>
              <p className="eyebrow">Intranet operations</p>
              <h1>Supply Chain Hub</h1>
            </div>
          </div>
          <p className="lede">Operational answers and governed actions across the supply chain.</p>

          <nav className="workflow-nav" aria-label="Supply chain workflows">
            {(Object.keys(workflowNavigation) as WorkflowKey[]).map((key) => {
              const Icon = workflowNavigation[key].icon;
              const locked = !canAccessWorkflow(persona, key);
              return (
                <button
                  className={`workflow-button ${workflowKey === key ? "active" : ""}`}
                  disabled={locked}
                  key={key}
                  type="button"
                  onClick={() => changeWorkflow(key)}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    {workflows[key].navLabel}
                    <small>{locked ? "Restricted" : workflows[key].accessLabel}</small>
                  </span>
                  {locked ? <LockKeyhole aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <section className="access-demo" aria-label="Demo access">
            <div className="access-heading">
              <CircleUserRound aria-hidden="true" />
              <div><strong>Access simulation</strong><span>Mock intranet identity</span></div>
            </div>
            <label>
              <span>Demo identity</span>
              <select
                aria-label="Demo identity"
                value={persona}
                onChange={(event) => changePersona(event.target.value as PersonaId)}
              >
                {personas.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
          </section>

          <section className="user-panel" aria-label="Signed-in user">
            <div className="user-avatar" aria-hidden="true">{activeUser.initials}</div>
            <div className="user-details">
              <strong>{activeUser.name}</strong>
              <span>{activeUser.role}</span>
              <small>{activeUser.businessUnit}</small>
            </div>
            <LockKeyhole aria-label="Authenticated intranet session" />
          </section>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">{workflow.title}</p>
            <h2>{workflow.question}</h2>
            <p>{workflow.description}</p>
          </div>
          <span className="access-badge"><LockKeyhole aria-hidden="true" />{workflow.accessLabel}</span>
        </header>

        <section className="chat-panel" aria-labelledby="chat-title">
          <div className="chat-toolbar">
            <div>
              <h2 id="chat-title"><AiMark /> Ask Supply Chain Hub</h2>
              <span className="context-line"><span className="live-dot" aria-hidden="true" />{workflow.sourceStatus}</span>
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
              {(messages.length > 0 || hasRun) && (
                <button className="icon-button" type="button" aria-label="Clear conversation" title="Clear conversation" onClick={resetRunState}>
                  <RotateCcw aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {messages.length > 0 && (
            <div className="message-list" aria-live="polite">
              {messages.map((message) => (
                <div className={`message ${message.role}`} key={message.id}>
                  <span>{message.role === "user" ? "You" : "Supply Chain Hub"}</span>
                  <p>{messageText(message)}</p>
                </div>
              ))}
              {status === "submitted" && <div className="thinking-state">Connecting to authorized tools and retrieving records...</div>}
            </div>
          )}

          {!hasRun && (
            <div className="prompt-row" aria-label="Suggested questions">
              {workflow.suggestedPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => void submitPrompt(prompt)}>{prompt}</button>
              ))}
            </div>
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

        <section className="source-section" aria-labelledby="source-title">
          <div className="section-title">
            <div>
              <p className="eyebrow">Tool access</p>
              <h3 id="source-title">Choose authorized sources</h3>
            </div>
            <span className="source-note"><ShieldCheck aria-hidden="true" />Filtered for {activeUser.role}</span>
          </div>
          <div className="source-grid">
            {workflow.sources.map((source) => {
              const checked = sourceIsSelected(source.id, source.selected);
              return (
                <label className={`source-item ${checked ? "selected" : ""}`} key={source.id}>
                  <input
                    aria-label={source.name}
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => setSourceSelection((current) => ({
                      ...current,
                      [`${workflowKey}:${source.id}`]: event.target.checked,
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

        {!hasRun ? (
          <section className="empty-state" aria-label="No analysis yet">
            <Bot aria-hidden="true" />
            <div>
              <h3>Ask a question to retrieve authorized live data</h3>
              <p>Results, records, recommendations and actions appear only after the request is evaluated against your identity and selected tools.</p>
            </div>
          </section>
        ) : (
          <section className="results" aria-label="Supply Chain Hub results">
            <div className="result-grid">
              <article className="result-summary">
                <p className="eyebrow">Operational answer</p>
                <h3>{workflow.headline}</h3>
                <p>{workflow.summary}</p>
                <div className="metric-strip">
                  {workflow.metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
                  {personaPolicy.canViewFinancials && workflow.financialMetrics?.map(([label, value]) => (
                    <div className="financial-metric" key={label}><span>{label}</span><strong>{value}</strong></div>
                  ))}
                </div>
              </article>

              <article className="activity-panel">
                <div className="panel-heading">
                  <Activity aria-hidden="true" />
                  <div><h3>Agent activity</h3><span>Auditable tool trace, not private model reasoning</span></div>
                </div>
                <ol>
                  {workflow.activity
                    .filter((step) => workflow.sources.some((source) =>
                      sourceIsSelected(source.id, source.selected) &&
                      step.tool.toLowerCase().includes(source.name.split(" ")[0].toLowerCase()),
                    ) || step.tool.includes("Policy") || step.tool.includes("Quality"))
                    .map((step) => (
                      <li key={step.tool}>
                        <span className="activity-check"><Check aria-hidden="true" /></span>
                        <div><strong>{step.tool}</strong><p>{step.detail}</p><small>{step.result}</small></div>
                      </li>
                    ))}
                </ol>
              </article>
            </div>

            {workflow.heatMap && (
              <section className="heatmap-section">
                <div className="section-title">
                  <div><p className="eyebrow">Decision support</p><h3>Supplier portfolio heat map</h3></div>
                  <span className="source-note">Cost versus resilience</span>
                </div>
                <div className="heatmap">
                  {workflow.heatMap.map((item) => (
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
              <div className="record-list">
                {workflow.rows.map((row) => (
                  <article className="record-row" key={row.subject}>
                    <div><strong>{row.subject}</strong><span>{row.detail}</span></div>
                    <span className={`status-chip status-${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span>
                    <p>{row.evidence}</p>
                    {personaPolicy.canViewFinancials && row.financial && <strong className="financial-value">{row.financial}</strong>}
                  </article>
                ))}
              </div>
            </section>

            <section className="actions-section">
              <div className="section-title">
                <div><p className="eyebrow">Agentic follow-up</p><h3>Available actions</h3></div>
                <span className="source-note"><ShieldCheck aria-hidden="true" />Human confirmation before external changes</span>
              </div>
              {workflow.approval && (
                <div className="approval-banner">
                  <ShieldCheck aria-hidden="true" />
                  <div><strong>{workflow.approval.label}</strong><span>{workflow.approval.detail}</span></div>
                </div>
              )}
              <div className="action-grid">
                {workflow.actions.map((action) => {
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
              {actionNotice && <p className="action-notice" role="status"><Check aria-hidden="true" />{actionNotice}</p>}
            </section>
          </section>
        )}
      </section>
    </main>
  );
}
