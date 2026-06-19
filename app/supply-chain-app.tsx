"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowRight,
  CheckCircle2,
  CircleUserRound,
  History,
  LockKeyhole,
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

import type { CurrentUser } from "@/lib/auth";
import { supportedModels, thinkingLevels, type SupportedModel, type ThinkingLevel } from "@/lib/chat";
import { buildAppContext } from "@/lib/context";
import { suppliers, workflows, type WorkflowKey } from "@/lib/demo-data";
import { getPersonaPolicy } from "@/lib/permissions";

const workflowNavigation: Record<WorkflowKey, { label: string; icon: LucideIcon }> = {
  risks: { label: "Weekly risk scan", icon: ScanSearch },
  delay: { label: "14-day supplier delay", icon: Truck },
  consolidate: { label: "Procurement optimization", icon: ShieldCheck },
};

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<(typeof message.parts)[number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export function SupplyChainApp({ currentUser }: { currentUser: CurrentUser }) {
  const [workflowKey, setWorkflowKey] = useState<WorkflowKey>("risks");
  const [model, setModel] = useState<SupportedModel>("gpt-5.4-mini");
  const [thinking, setThinking] = useState<ThinkingLevel>("medium");
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ transport });
  const workflow = workflows[workflowKey];
  const appContext = buildAppContext(workflowKey, currentUser.persona);
  const personaPolicy = getPersonaPolicy(currentUser.persona);
  const isBusy = status === "submitted" || status === "streaming";

  async function submitPrompt(prompt: string) {
    const nextPrompt = prompt.trim();
    if (!nextPrompt || isBusy) return;

    clearError();
    setInput("");
    await sendMessage(
      { text: nextPrompt },
      { body: { workflowKey, model, thinking } },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitPrompt(input);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-main">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">SH</div>
            <div>
              <p className="eyebrow">Intranet operations</p>
              <h1>Supply Chain Hub</h1>
            </div>
          </div>
          <p className="lede">Grounded supplier decisions across planning, procurement and operations.</p>

          <nav className="workflow-nav" aria-label="Supply chain workflows">
            {(Object.keys(workflowNavigation) as WorkflowKey[]).map((key) => {
              const item = workflowNavigation[key];
              const Icon = item.icon;
              return (
                <button
                  className={`workflow-button ${workflowKey === key ? "active" : ""}`}
                  key={key}
                  type="button"
                  onClick={() => setWorkflowKey(key)}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <section className="status-panel" aria-label="Dataset status">
            <div><span className="metric-label">Suppliers</span><strong>{appContext.metrics.supplierCount}</strong></div>
            <div><span className="metric-label">Open alerts</span><strong>{appContext.metrics.openAlerts}</strong></div>
            <div><span className="metric-label">Revenue at risk</span><strong>{appContext.metrics.revenueAtRisk}</strong></div>
          </section>

          <section className="user-panel" aria-label="Signed-in user">
            <div className="user-avatar" aria-hidden="true">{currentUser.initials}</div>
            <div className="user-details">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.role}</span>
              <small>{currentUser.businessUnit}</small>
            </div>
            <LockKeyhole aria-label="Authenticated intranet session" />
          </section>
        </div>
      </aside>

      <section className="workspace">
        <section className="chat-panel" aria-labelledby="chat-title">
          <div className="chat-toolbar">
            <div>
              <p className="eyebrow">Supply Chain Hub</p>
              <h2 id="chat-title"><Sparkles aria-hidden="true" /> Ask Supply Chain Hub</h2>
            </div>
            <div className="chat-selectors">
              <label>
                <span>Model</span>
                <select value={model} onChange={(event) => setModel(event.target.value as SupportedModel)}>
                  {supportedModels.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </label>
              <label>
                <span>Thinking level</span>
                <select value={thinking} onChange={(event) => setThinking(event.target.value as ThinkingLevel)}>
                  {thinkingLevels.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </label>
              {messages.length > 0 && (
                <button className="icon-button" type="button" aria-label="Clear conversation" title="Clear conversation" onClick={() => setMessages([])}>
                  <RotateCcw aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="context-line">
            <span className="live-dot" aria-hidden="true" />
            {workflow.sourceStatus}
          </div>

          {messages.length > 0 && (
            <div className="message-list" aria-live="polite">
              {messages.map((message) => (
                <div className={`message ${message.role}`} key={message.id}>
                  <span>{message.role === "user" ? "You" : "Supply Chain Hub"}</span>
                  <p>{messageText(message)}</p>
                </div>
              ))}
              {status === "submitted" && <div className="thinking-state">Reviewing authorized enterprise sources...</div>}
            </div>
          )}

          {messages.length === 0 && (
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
              placeholder="Ask about suppliers, risks, scenarios, or recommendations"
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

        <section className="workflow-section" aria-labelledby="workflow-question">
          <div className="workflow-heading">
            <div>
              <p className="eyebrow">{workflow.title}</p>
              <h2 id="workflow-question">{workflow.question}</h2>
            </div>
            <span className="badge">{workflow.confidence}</span>
          </div>

          <div className="before-now-grid">
            <article className="process-panel before-panel">
              <div className="process-title"><History aria-hidden="true" /><h3>Before</h3></div>
              <p>{workflow.before}</p>
              <div className="system-list">
                {workflow.beforeSystems.map((system) => <span key={system}>{system}</span>)}
              </div>
            </article>

            <div className="journey-arrow" aria-hidden="true"><ArrowRight /></div>

            <article className="process-panel hub-panel">
              <div className="process-title"><Sparkles aria-hidden="true" /><h3>With Supply Chain Hub</h3></div>
              <p>{workflow.withHub}</p>
              <ol className="hub-steps">
                {workflow.hubSteps.map(([label, detail]) => (
                  <li key={label}>
                    <CheckCircle2 aria-hidden="true" />
                    <span><strong>{label}</strong>{detail}</span>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        <section className="answer-grid" aria-label="Supply Chain Hub analysis">
          <article className="answer-card main-answer">
            <p className="eyebrow">Decision brief</p>
            <h3>{workflow.headline}</h3>
            <p className="answer-summary">{workflow.summary}</p>
            <div className="impact-strip">
              {workflow.impacts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
          </article>
          <article className="answer-card actions-card">
            <p className="eyebrow">Recommended actions</p>
            <ol className="actions-list">{workflow.actions.map((action) => <li key={action}>{action}</li>)}</ol>
          </article>
        </section>

        <section className="content-section">
          <div className="section-title">
            <div><p className="eyebrow">Grounded evidence</p><h3>Supplier risk table</h3></div>
            <span className="source-note"><CircleUserRound aria-hidden="true" /> Access filtered for {currentUser.role}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Category</th><th>Region</th><th>Risk</th><th>Signals</th>{personaPolicy.canViewSupplierImpact && <th>Impact</th>}</tr></thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr className={workflow.highlights.includes(supplier.name) ? "highlight-row" : ""} key={supplier.name}>
                    <td><strong>{supplier.name}</strong></td><td>{supplier.category}</td><td>{supplier.region}</td>
                    <td><span className={`risk-chip risk-${supplier.risk.toLowerCase()}`}>{supplier.risk}</span></td>
                    <td>{supplier.signals}</td>{personaPolicy.canViewSupplierImpact && <td>{supplier.impact}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
