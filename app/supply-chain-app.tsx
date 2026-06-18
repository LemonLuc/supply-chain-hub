"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { RotateCcw, Send, Square, WandSparkles } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { supportedModels, thinkingLevels, type SupportedModel, type ThinkingLevel } from "@/lib/chat";
import { buildAppContext } from "@/lib/context";
import { suppliers, workflows, type WorkflowKey } from "@/lib/demo-data";

const workflowLabels: Record<WorkflowKey, string> = {
  risks: "Weekly risk scan",
  delay: "Supplier A delay",
  consolidate: "Consolidation plan",
};

const suggestedPrompts = [
  "What should I do first?",
  "Summarize the evidence for an executive.",
  "What assumptions should I validate?",
];

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<(typeof message.parts)[number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export function SupplyChainApp() {
  const [workflowKey, setWorkflowKey] = useState<WorkflowKey>("risks");
  const [model, setModel] = useState<SupportedModel>("gpt-5.4-mini");
  const [thinking, setThinking] = useState<ThinkingLevel>("medium");
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ transport });
  const workflow = workflows[workflowKey];
  const appContext = buildAppContext(workflowKey);
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
        <div>
          <p className="eyebrow">Decision console</p>
          <h1>Supply Chain Hub</h1>
          <p className="lede">Supplier risk triage, scenario planning, and sourcing decisions.</p>
        </div>

        <nav className="workflow-nav" aria-label="Demo workflows">
          {(Object.keys(workflows) as WorkflowKey[]).map((key, index) => (
            <button
              className={`workflow-button ${workflowKey === key ? "active" : ""}`}
              key={key}
              type="button"
              onClick={() => setWorkflowKey(key)}
            >
              <span>{index + 1}</span>
              {workflowLabels[key]}
            </button>
          ))}
        </nav>

        <section className="status-panel" aria-label="Dataset status">
          <div><span className="metric-label">Suppliers</span><strong>{appContext.metrics.supplierCount}</strong></div>
          <div><span className="metric-label">Open alerts</span><strong>{appContext.metrics.openAlerts}</strong></div>
          <div><span className="metric-label">Revenue at risk</span><strong>{appContext.metrics.revenueAtRisk}</strong></div>
        </section>
      </aside>

      <section className="workspace">
        <section className="chat-panel" aria-labelledby="chat-title">
          <div className="chat-toolbar">
            <div>
              <p className="eyebrow">Copilot</p>
              <h2 id="chat-title"><WandSparkles aria-hidden="true" /> Chat with this workspace</h2>
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
            Context: {workflowLabels[workflowKey]}
          </div>

          {messages.length > 0 && (
            <div className="message-list" aria-live="polite">
              {messages.map((message) => (
                <div className={`message ${message.role}`} key={message.id}>
                  <span>{message.role === "user" ? "You" : "Copilot"}</span>
                  <p>{messageText(message)}</p>
                </div>
              ))}
              {status === "submitted" && <div className="thinking-state">Reviewing workspace context...</div>}
            </div>
          )}

          {messages.length === 0 && (
            <div className="prompt-row" aria-label="Suggested prompts">
              {suggestedPrompts.map((prompt) => (
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

        <header className="topbar">
          <div><p className="eyebrow">Active question</p><h2>{workflow.question}</h2></div>
          <span className="badge">{workflow.confidence}</span>
        </header>

        <section className="answer-grid" aria-label="Copilot answer">
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
          <div className="section-title"><div><p className="eyebrow">Architecture trace</p><h3>How the decision flows</h3></div></div>
          <div className="architecture-trace">
            {workflow.architecture.map(([layer, description]) => (
              <div className="architecture-node" key={layer}><span>{layer}</span><strong>{layer}</strong><p>{description}</p></div>
            ))}
          </div>
        </section>

        <section className="content-section">
          <div className="section-title"><div><p className="eyebrow">Evidence</p><h3>Supplier risk table</h3></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Category</th><th>Region</th><th>Risk</th><th>Signals</th><th>Impact</th></tr></thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr className={workflow.highlights.includes(supplier.name) ? "highlight-row" : ""} key={supplier.name}>
                    <td><strong>{supplier.name}</strong></td><td>{supplier.category}</td><td>{supplier.region}</td>
                    <td><span className={`risk-chip risk-${supplier.risk.toLowerCase()}`}>{supplier.risk}</span></td>
                    <td>{supplier.signals}</td><td>{supplier.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section">
          <div className="section-title"><div><p className="eyebrow">Demo prompts</p><h3>Talk track</h3></div></div>
          <div className="talk-track">
            {workflow.talk.map(([title, text]) => <div key={title}><strong>{title}</strong><p>{text}</p></div>)}
          </div>
        </section>
      </section>
    </main>
  );
}
