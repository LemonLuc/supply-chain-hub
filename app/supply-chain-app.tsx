"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleX,
  Clock3,
  Database,
  ExternalLink,
  FileCheck2,
  ListChecks,
  Mail,
  Moon,
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
import {
  buildActionDraft,
  getActionAssignee,
  getActionReviewer,
  getRecipientActionLabel,
  type ActionWorkflowResult,
} from "@/lib/action-workflows";
import {
  defaultModel,
  defaultThinkingLevel,
  supportedModels,
  thinkingLevels,
  type SupportedModel,
  type ThinkingLevel,
} from "@/lib/chat";
import { buildAppContext, buildRoleToolSources, resolveWorkflowForPrompt } from "@/lib/context";
import { workflows, type WorkflowAction, type WorkflowKey } from "@/lib/demo-data";
import { getPersonaPolicy, personas, type PersonaId } from "@/lib/permissions";

import { AnswerActions, type AnswerFeedback, type FeedbackRating } from "./answer-actions";
import { ChatMessageVisual, getMessageVisual } from "./chat-message-visual";

type ApprovalStatus = "pending" | "approved" | "denied";

type ApprovalRequest = {
  id: string;
  requesterActionLabel: string;
  reviewerActionLabel: string;
  workflowKey: WorkflowKey;
  requesterPersona: PersonaId;
  reviewerPersona: PersonaId;
  draft: string;
  status: ApprovalStatus;
};

type PersonalTask = {
  id: string;
  actionLabel: string;
  workflowKey: WorkflowKey;
  ownerPersona: PersonaId;
  detail: string;
  status: "open" | "done";
};

type ActionNoticeTone = "success" | "pending" | "error";

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

const personaRecommendations: Record<PersonaId, Array<{ label: string; source: string }>> = {
  logistics: [
    { label: "Open DHL tracking delay for N-FK5 shipment", source: "Shipping providers" },
    { label: "Check Oberkochen receiving buffer", source: "EWM warehouse" },
    { label: "Review PO 4500872319 promised date", source: "SAP S/4HANA" },
  ],
  procurement: [
    { label: "Review MT-440B alternate reservation", source: "Supplier capacity portal" },
    { label: "Check supplier risk register changes", source: "SharePoint workbook" },
    { label: "Prepare Lucia exception review note", source: "Outlook" },
  ],
  executive: [
    { label: "Open consolidation opportunity heat map", source: "Resilience signals" },
    { label: "Review contract notice windows", source: "Contract repository" },
    { label: "Check savings guardrails for protected categories", source: "Procurement policy" },
  ],
};

const personaPromptSets: Record<PersonaId, string[]> = {
  logistics: [
    "Show me potential delivery risks for this week.",
    "Check whether any carrier milestone changed overnight.",
    "Which shipments need pickup confirmation before noon?",
    "Create a Monday follow-up plan for delayed freight.",
  ],
  procurement: [
    "What approved alternates can cover the delayed turret assemblies?",
    "Which production orders can use an approved alternate turret?",
    "Assign the carrier recovery check for the uncovered builds.",
    "Which supplier decision needs Lucia Lopez's review?",
  ],
  executive: [
    "Show supplier consolidation options by savings and strategic relationship.",
    "Which supplier relationships should we consolidate without weakening continuity?",
    "Where can we capture savings while protecting strategic supply continuity?",
    "Draft a board-level decision record for supplier consolidation.",
  ],
};

function submittedApprovalStatusText(request: ApprovalRequest) {
  const reviewer = mockUsers[request.reviewerPersona].name;
  if (request.status === "approved") return `Approved by ${reviewer}`;
  if (request.status === "denied") return `Denied by ${reviewer}`;
  return `Pending review by ${reviewer}`;
}

function incomingApprovalStatusText(status: ApprovalStatus) {
  if (status === "approved") return "Approved";
  if (status === "denied") return "Denied";
  return "Review pending";
}

function personalTaskTitle(action: WorkflowAction) {
  return getRecipientActionLabel(action);
}

export function SupplyChainApp({ currentUser }: { currentUser: CurrentUser }) {
  const [persona, setPersona] = useState<PersonaId>(currentUser.persona);
  const [workflowKey, setWorkflowKey] = useState<WorkflowKey>("risks");
  const [model, setModel] = useState<SupportedModel>(defaultModel);
  const [thinking, setThinking] = useState<ThinkingLevel>(defaultThinkingLevel);
  const [input, setInput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [actionNoticeTone, setActionNoticeTone] = useState<ActionNoticeTone>("success");
  const [actionInFlightLabel, setActionInFlightLabel] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activePrompt, setActivePrompt] = useState("");
  const [sourceSelection, setSourceSelection] = useState<Record<string, boolean>>({});
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState("");
  const [answerFeedback, setAnswerFeedback] = useState<Record<string, AnswerFeedback>>({});
  const [recommendationNotice, setRecommendationNotice] = useState("");
  const [openedRecommendationSource, setOpenedRecommendationSource] = useState("");
  const [localDateTime] = useState(() =>
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    }).format(new Date()),
  );
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ transport });
  const activeUser = mockUsers[persona];
  const personaPolicy = getPersonaPolicy(persona);
  const roleToolSources = useMemo(() => buildRoleToolSources(persona), [persona]);
  const suggestedPrompts = personaPromptSets[persona];
  const selectedToolCount = useMemo(
    () => roleToolSources.filter((source) => sourceIsSelected(source.toolId, source.selected)).length,
    [roleToolSources, sourceSelection],
  );
  const isBusy = status === "submitted" || status === "streaming";
  const canShowResults = hasRun && !isBusy;
  const selectedSourceIds = useMemo(
    () => getSelectedSourceIdsForWorkflow(workflowKey),
    [sourceSelection, roleToolSources, workflowKey],
  );
  const appContext = useMemo(
    () => buildAppContext(workflowKey, persona, selectedSourceIds, activePrompt),
    [workflowKey, persona, selectedSourceIds, activePrompt],
  );
  function sourceIsSelected(toolId: string, fallback: boolean) {
    return sourceSelection[toolId] ?? fallback;
  }

  function getSelectedSourceIdsForWorkflow(nextWorkflowKey: WorkflowKey) {
    const selectedSourceIds = new Set(
      roleToolSources
        .filter(
          (source) =>
            source.workflowKeys.includes(nextWorkflowKey) &&
            sourceIsSelected(source.toolId, source.selected),
        )
        .flatMap((source) => source.sourceIds),
    );

    return workflows[nextWorkflowKey].sources
      .filter((source) => selectedSourceIds.has(source.id))
      .map((source) => source.id);
  }

  function resetRunState() {
    setHasRun(false);
    setActionNotice("");
    setActionNoticeTone("success");
    setActionInFlightLabel("");
    setActionMenuOpen(false);
    setActivePrompt("");
    setRecommendationNotice("");
    setOpenedRecommendationSource("");
    setCopiedMessageId("");
    setAnswerFeedback({});
    setMessages([]);
    clearError();
  }

  function changePersona(nextPersona: PersonaId) {
    setPersona(nextPersona);
    const nextPolicy = getPersonaPolicy(nextPersona);
    if (!nextPolicy.allowedWorkflows.includes(workflowKey)) setWorkflowKey(nextPolicy.allowedWorkflows[0] ?? "risks");
    setSourceSelection({});
    setSettingsOpen(false);
    resetRunState();
  }

  async function submitPrompt(prompt: string) {
    const nextPrompt = prompt.trim();
    if (!nextPrompt || isBusy) return;
    const nextWorkflowKey = resolveWorkflowForPrompt(nextPrompt, persona, workflowKey);
    const nextSelectedSourceIds = getSelectedSourceIdsForWorkflow(nextWorkflowKey);

    clearError();
    setInput("");
    setWorkflowKey(nextWorkflowKey);
    setActivePrompt(nextPrompt);
    setHasRun(true);
    setActionNotice("");
    setActionMenuOpen(true);
    await sendMessage(
      { text: nextPrompt },
      { body: { workflowKey: nextWorkflowKey, model, thinking, demoPersona: persona, selectedSourceIds: nextSelectedSourceIds } },
    );
  }

  async function copyAnswer(message: UIMessage) {
    const text = messageText(message);
    if (!text || typeof navigator.clipboard?.writeText !== "function") return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    setCopiedMessageId(message.id);
    window.setTimeout(() => setCopiedMessageId((current) => (current === message.id ? "" : current)), 1800);
  }

  function selectAnswerFeedback(messageId: string, rating: FeedbackRating) {
    setAnswerFeedback((current) => {
      const next: Record<string, AnswerFeedback> = {};

      for (const [id, value] of Object.entries(current)) {
        if (id === messageId) continue;
        if (!value.formOpen) {
          next[id] = value;
        } else if (value.saved) {
          next[id] = {
            ...value,
            ...value.saved,
            formOpen: false,
            submitted: true,
          };
        }
      }

      const previous = current[messageId];
      next[messageId] = {
        rating,
        comment: previous?.comment ?? previous?.saved?.comment ?? "",
        formOpen: true,
        submitted: false,
        saved: previous?.saved,
      };
      return next;
    });
  }

  function updateAnswerFeedbackComment(messageId: string, comment: string) {
    setAnswerFeedback((current) => {
      const feedback = current[messageId];
      return feedback ? { ...current, [messageId]: { ...feedback, comment } } : current;
    });
  }

  function submitAnswerFeedback(messageId: string) {
    setAnswerFeedback((current) => {
      const feedback = current[messageId];
      return feedback
        ? {
            ...current,
            [messageId]: {
              ...feedback,
              formOpen: false,
              submitted: true,
              saved: { rating: feedback.rating, comment: feedback.comment },
            },
          }
        : current;
    });
  }

  function cancelAnswerFeedback(messageId: string) {
    setAnswerFeedback((current) => {
      const feedback = current[messageId];
      if (feedback?.saved) {
        return {
          ...current,
          [messageId]: {
            ...feedback,
            ...feedback.saved,
            formOpen: false,
            submitted: true,
          },
        };
      }
      const remaining = { ...current };
      delete remaining[messageId];
      return remaining;
    });
  }

  function openRecommendedSource(source: string) {
    setOpenedRecommendationSource(source);
    setRecommendationNotice(`Opened ${source} in a new tab.`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitPrompt(input);
  }

  function applyActionResult(action: WorkflowAction, result?: ActionWorkflowResult) {
    const requester = mockUsers[persona];
    const reviewerPersona = result?.reviewerPersona ?? getActionReviewer(action);
    const assigneePersona = result?.assigneePersona ?? getActionAssignee(action);
    if (!reviewerPersona) {
      const createsTask =
        Boolean(assigneePersona) ||
        (action.kind === "update" && action.label.toLowerCase().includes("task"));
      if (createsTask) {
        setPersonalTasks((current) => [
          ...current,
          {
            id: `task-${crypto.randomUUID()}`,
            actionLabel: personalTaskTitle(action),
            workflowKey,
            ownerPersona: assigneePersona ?? persona,
            detail: action.detail,
            status: "open",
          },
        ]);
      }
      setActionMenuOpen(false);
      setActionNotice(
        result?.notice ??
          `${action.kind === "draft" ? "Draft prepared" : action.kind === "share" ? "Mandate prepared" : action.label.toLowerCase().includes("task") ? "Task created" : "Action staged"} for ${requester.name}. ${action.detail}`,
      );
      setActionNoticeTone("success");
      return;
    }

    const reviewer = mockUsers[reviewerPersona];
    const request: ApprovalRequest = {
      id: `approval-${crypto.randomUUID()}`,
      requesterActionLabel: action.label,
      reviewerActionLabel:
        result?.recipientActionLabel ?? getRecipientActionLabel(action),
      workflowKey,
      requesterPersona: persona,
      reviewerPersona,
      draft: result?.draft ?? buildActionDraft(appContext, workflowKey, persona, action, reviewerPersona),
      status: "pending",
    };

    setApprovalRequests((current) => [...current, request]);
    setActionMenuOpen(false);
    setActionNotice(result?.notice ?? `Approval request sent to ${reviewer.name}.`);
    setActionNoticeTone("pending");
  }

  async function runAction(action: WorkflowAction) {
    if (actionInFlightLabel) return;

    const reviewerPersona = getActionReviewer(action);
    const optimisticApprovalId = `approval-${crypto.randomUUID()}`;

    if (reviewerPersona) {
      setApprovalRequests((current) => [
        ...current,
        {
          id: optimisticApprovalId,
          requesterActionLabel: action.label,
          reviewerActionLabel: getRecipientActionLabel(action),
          workflowKey,
          requesterPersona: persona,
          reviewerPersona,
          draft: buildActionDraft(appContext, workflowKey, persona, action, reviewerPersona),
          status: "pending",
        },
      ]);
    }

    setActionInFlightLabel(action.label);
    setActionNotice("");
    setActionNoticeTone("pending");

    try {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workflowKey,
          demoPersona: persona,
          selectedSourceIds,
          actionLabel: action.label,
          model,
          thinking,
        }),
      });

      if (!response.ok) throw new Error("Action workflow rejected.");

      const result = (await response.json()) as ActionWorkflowResult;

      if (reviewerPersona) {
        setApprovalRequests((current) =>
          current.map((request) =>
            request.id === optimisticApprovalId
              ? {
                  ...request,
                  draft: result.draft,
                  reviewerActionLabel:
                    result.recipientActionLabel ?? request.reviewerActionLabel,
                  reviewerPersona:
                    result.reviewerPersona ?? reviewerPersona,
                }
              : request,
          ),
        );
        setActionMenuOpen(false);
        setActionNotice(result.notice);
        setActionNoticeTone("pending");
      } else {
        applyActionResult(action, result);
      }
    } catch {
      if (reviewerPersona) {
        setApprovalRequests((current) =>
          current.filter((request) => request.id !== optimisticApprovalId),
        );
      }
      setActionMenuOpen(false);
      setActionNotice("Action could not be completed. Please try again.");
      setActionNoticeTone("error");
    } finally {
      setActionInFlightLabel("");
    }
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

  function completeTask(id: string) {
    setPersonalTasks((current) =>
      current.map((task) =>
        task.id === id && task.ownerPersona === persona ? { ...task, status: "done" } : task,
      ),
    );
  }

  const incomingApprovals = approvalRequests.filter((request) => request.reviewerPersona === persona);
  const submittedApprovals = approvalRequests.filter(
    (request) => request.requesterPersona === persona && request.reviewerPersona !== persona,
  );
  const ownedTasks = personalTasks.filter((task) => task.ownerPersona === persona);

  return (
    <main className="app-shell" data-theme={theme}>
      <section className="workspace">
        <div className="top-datetime">
          <Clock3 aria-hidden="true" />
          <span>{localDateTime} · Oberkochen HQ</span>
        </div>
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
                <span className="theme-switch-thumb"><Moon aria-hidden="true" /></span>
              </span>
            </button>
          </section>
        </header>

        <section className="recommendations-box" aria-label="Recommended for you">
          <div className="recommendations-heading">
            <h2>Recommended for you</h2>
          </div>
          <ul>
            {personaRecommendations[persona].map((item) => (
              <li key={item.label}>
                <button type="button" onClick={() => openRecommendedSource(item.source)}>
                  <span>{item.label}</span>
                  <small>{item.source}</small>
                </button>
              </li>
            ))}
          </ul>
          {recommendationNotice && (
            <p className="recommendation-notice" role="status">
              {recommendationNotice}
              {openedRecommendationSource && (
                <button type="button" onClick={() => undefined}>
                  Go to {openedRecommendationSource}
                  <ExternalLink aria-hidden="true" />
                </button>
              )}
            </p>
          )}
        </section>

        <section className={`chat-panel ${hasRun ? "has-run" : ""}`} aria-label="Ask Supply Chain Hub">
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
            <div
              className="message-list"
              aria-label="Chat messages"
              aria-live="polite"
            >
              {messages.map((message) => {
                const visual = message.role === "assistant" ? getMessageVisual(message) : undefined;
                return (
                  <div
                    className={`message ${message.role}${visual ? " has-visual" : ""}`}
                    key={message.id}
                  >
                    <div className="message-heading">
                      <span>{message.role === "user" ? "You" : "Supply Chain Hub"}</span>
                    </div>
                    {message.role === "assistant" && <ReasoningSummary message={message} />}
                    {messageText(message) &&
                      (message.role === "assistant" ? (
                        <AssistantMarkdown text={messageText(message)} />
                      ) : (
                        <p>{messageText(message)}</p>
                      ))}
                    {message.role === "assistant" && <ChatMessageVisual visual={visual} />}
                    {message.role === "assistant" && messageText(message) && (
                      <AnswerActions
                        copied={copiedMessageId === message.id}
                        feedback={answerFeedback[message.id]}
                        onCopy={() => void copyAnswer(message)}
                        onSelectFeedback={(rating) => selectAnswerFeedback(message.id, rating)}
                        onCommentChange={(comment) => updateAnswerFeedbackComment(message.id, comment)}
                        onSubmitFeedback={() => submitAnswerFeedback(message.id)}
                        onCancelFeedback={() => cancelAnswerFeedback(message.id)}
                      />
                    )}
                  </div>
                );
              })}
              {status === "submitted" && <div className="thinking-state">Connecting to authorized tools and retrieving records...</div>}
            </div>
          )}

          {canShowResults && appContext.recommendedActions.length > 0 && (
            <section className="chat-action-menu" aria-label="Agentic follow-up actions">
              <button
                className="action-menu-toggle"
                type="button"
                aria-expanded={actionMenuOpen}
                aria-label={`${actionMenuOpen ? "Close" : "Open"} actions`}
                onClick={() => setActionMenuOpen((current) => !current)}
              >
                <ListChecks aria-hidden="true" />
                <span>Actions</span>
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
                    const isActionLoading = actionInFlightLabel === action.label;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        disabled={Boolean(actionInFlightLabel)}
                        aria-busy={isActionLoading}
                        onClick={() => void runAction(action)}
                      >
                        <Icon aria-hidden="true" />
                        <span><strong>{action.label}</strong><small>{action.detail}</small></span>
                        <ChevronRight aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              )}
              {actionInFlightLabel && (
                <div className="action-loading" role="status" aria-live="polite">
                  <span>Running action workflow for {actionInFlightLabel}</span>
                  <div aria-hidden="true"><span /></div>
                </div>
              )}
              {actionNotice && (
                <p className={`action-notice tone-${actionNoticeTone}`} role="status">
                  {actionNoticeTone === "error" ? (
                    <CircleX aria-hidden="true" />
                  ) : (
                    <Check aria-hidden="true" />
                  )}
                  {actionNotice}
                </p>
              )}
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

        {ownedTasks.length > 0 && (
          <section className="task-workflow" aria-label="Personal task list">
            <div className="section-title">
              <div><p className="eyebrow">Personal follow-up</p><h3>My tasks</h3></div>
              <span className="source-note"><Check aria-hidden="true" />Assigned to {activeUser.name}</span>
            </div>
            <div className="task-list">
              {ownedTasks.map((task) => (
                <article className={`task-card status-${task.status}`} key={task.id}>
                  <div>
                    <strong>{task.actionLabel}</strong>
                    <span>{task.detail}</span>
                  </div>
                  {task.status === "open" ? (
                    <button type="button" onClick={() => completeTask(task.id)} aria-label={`Mark ${task.actionLabel} done`}>
                      <Check aria-hidden="true" />
                      Mark done
                    </button>
                  ) : (
                    <span className="status-chip status-on-schedule">Done</span>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

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
                          <strong>{request.reviewerActionLabel}</strong>
                          <span>From {mockUsers[request.requesterPersona].name}</span>
                        </div>
                        <span className="status-chip">{incomingApprovalStatusText(request.status)}</span>
                      </div>
                      <p>{request.draft}</p>
                      {request.status === "pending" && (
                        <div className="approval-controls">
                          <button type="button" onClick={() => decideApproval(request.id, "approved")} aria-label={`Approve ${request.reviewerActionLabel}`}>
                            <Check aria-hidden="true" />
                            Approve
                          </button>
                          <button type="button" onClick={() => decideApproval(request.id, "denied")} aria-label={`Deny ${request.reviewerActionLabel}`}>
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
                          <strong>{request.requesterActionLabel}</strong>
                          <span>Reviewer: {mockUsers[request.reviewerPersona].name}</span>
                        </div>
                        <span className="status-chip">{submittedApprovalStatusText(request)}</span>
                      </div>
                      <p>{request.draft}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {canShowResults && (
          <section className="results" aria-label="Supply Chain Hub results">
            <section className="records-section">
              <div className="section-title">
                <div><h3>Findings</h3></div>
              </div>
              <div className="records-table-wrap">
                <table className="records-table" aria-label="Supply Chain Hub findings">
                  <thead>
                    <tr>
                      <th scope="col">Affected material</th>
                      <th scope="col">Status</th>
                      <th scope="col">Expected arrival</th>
                      <th scope="col">Production buffer</th>
                      {personaPolicy.canViewFinancials && <th scope="col">Financial impact</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {appContext.rows.map((row) => (
                      <tr key={row.subject}>
                        <td><strong>{row.affectedMaterial ?? row.detail}</strong><span>{row.subject}</span></td>
                        <td><span className={`status-chip status-${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span></td>
                        <td>{row.expectedArrival ?? row.evidence}</td>
                        <td>{row.productionBuffer ?? row.evidence}</td>
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
