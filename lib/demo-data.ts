export type RiskLevel = "High" | "Medium" | "Low";

export type Supplier = {
  name: string;
  category: string;
  region: string;
  risk: RiskLevel;
  signals: string;
  impact: string;
};

export type WorkflowKey = "risks" | "delay" | "consolidate";

export type Workflow = {
  question: string;
  confidence: string;
  headline: string;
  summary: string;
  impacts: Array<[string, string]>;
  actions: string[];
  highlights: string[];
  talk: Array<[string, string]>;
  architecture: Array<[string, string]>;
};

export const suppliers: Supplier[] = [
  {
    name: "Supplier A",
    category: "Semiconductors",
    region: "Taiwan",
    risk: "High",
    signals: "Port congestion, 2-week capacity slip, single-sourced component",
    impact: "$1.6M revenue at risk",
  },
  {
    name: "Supplier B",
    category: "Packaging",
    region: "Poland",
    risk: "Medium",
    signals: "Energy price spike, on-time delivery trending down 8%",
    impact: "$420K expedited freight exposure",
  },
  {
    name: "Supplier C",
    category: "Aluminum housings",
    region: "Mexico",
    risk: "High",
    signals: "Quality escapes on 3 lots, labor disruption near plant",
    impact: "$950K rework and missed service-level risk",
  },
  {
    name: "Supplier D",
    category: "Batteries",
    region: "South Korea",
    risk: "Medium",
    signals: "Customs inspections increasing, inventory cover at 18 days",
    impact: "$610K buffer inventory recommendation",
  },
  {
    name: "Supplier E",
    category: "Sensors",
    region: "Germany",
    risk: "Low",
    signals: "Stable lead time, dual tooling available",
    impact: "$90K routine watchlist",
  },
  {
    name: "Supplier F",
    category: "Fasteners",
    region: "Vietnam",
    risk: "Medium",
    signals: "Currency volatility, alternate supplier qualified",
    impact: "$210K price variance exposure",
  },
  {
    name: "Supplier G",
    category: "Circuit boards",
    region: "Malaysia",
    risk: "High",
    signals: "Flood warning, 9 days inventory cover, no approved substitute",
    impact: "$1.2M production continuity risk",
  },
  {
    name: "Supplier H",
    category: "Labels",
    region: "United States",
    risk: "Low",
    signals: "High service level, excess capacity available",
    impact: "$40K normal operating risk",
  },
];

export const workflows: Record<WorkflowKey, Workflow> = {
  risks: {
    question: "What are the current top supply chain risks across all suppliers this week?",
    confidence: "High confidence",
    headline: "Three suppliers need attention this week.",
    summary:
      "The copilot ranks Supplier A, Supplier G, and Supplier C as the highest-priority risks because each combines a disruption signal with low recovery options. Supplier A is the most urgent because a delay affects a single-sourced semiconductor component.",
    impacts: [
      ["Highest risk", "Supplier A"],
      ["Revenue at risk", "$4.8M"],
      ["Fastest action", "Approve expedites"],
    ],
    actions: [
      "Escalate Supplier A with procurement and planning today.",
      "Place Supplier G on daily monitoring until weather risk clears.",
      "Open a corrective-action request for Supplier C quality escapes.",
    ],
    highlights: ["Supplier A", "Supplier G", "Supplier C"],
    talk: [
      ["Frame", "Ask the copilot for a weekly risk view across the supplier base."],
      ["Evidence", "Show how it blends supplier status, logistics signals, inventory cover, and business impact."],
      ["Decision", "End with the concrete triage list: escalate, monitor, and open corrective action."],
    ],
    architecture: [
      ["Users", "Planner / executive asks for this week's supplier risks."],
      ["ChatGPT", "Control tower turns the question into a structured supply-chain task."],
      ["Responses API", "Agent layer plans retrieval, risk scoring, and answer format."],
      ["File Search", "Grounding layer retrieves supplier notes, scorecards, and policies."],
      ["Risk Engine", "Analysis ranks suppliers by disruption, recoverability, and business impact."],
      ["Policy Engine", "Guardrails require evidence, confidence, and human-owned actions."],
    ],
  },
  delay: {
    question: "What happens if Supplier A is delayed by 2 weeks?",
    confidence: "Scenario model",
    headline: "A 2-week Supplier A delay creates a week-3 production gap.",
    summary:
      "The scenario projects a shortage after current inventory is consumed. The recommended mitigation is to split demand across expedited shipments, temporary product-mix changes, and customer-priority allocation.",
    impacts: [
      ["Production gap", "5 days"],
      ["At-risk orders", "18%"],
      ["Mitigation cost", "$310K"],
    ],
    actions: [
      "Expedite 40% of Supplier A volume by air to protect strategic customers.",
      "Shift two lower-margin SKUs into week 4 to free constrained chips.",
      "Ask engineering to approve the prequalified alternate for the next build cycle.",
    ],
    highlights: ["Supplier A", "Supplier E"],
    talk: [
      ["Frame", "Switch from monitoring to what-if planning: same data, different decision."],
      ["Evidence", "Call out inventory cover, single-source exposure, and the projected production gap."],
      ["Decision", "Explain the mitigation package and why the copilot balances service level against cost."],
    ],
    architecture: [
      ["Users", "Planner asks about a 2-week Supplier A delay."],
      ["ChatGPT", "Control tower captures the scenario in business language."],
      ["Responses API", "Agent layer calls retrieval plus simulation tools."],
      ["File Search", "Grounding layer pulls part criticality, inventory cover, and customer priority rules."],
      ["Scenario Engine", "Simulation estimates shortage timing, cost, and affected orders."],
      ["Policy Engine", "Guardrails keep recommendations within approval and allocation rules."],
    ],
  },
  consolidate: {
    question: "Which suppliers should we consolidate, and what is the risk impact?",
    confidence: "Recommendation",
    headline: "Consolidate low-risk tail spend, but keep semiconductor redundancy.",
    summary:
      "The copilot recommends consolidating labels, fasteners, and packaging where alternates exist and switching costs are low. It does not recommend consolidating Supplier A or Supplier G because concentration would raise continuity risk.",
    impacts: [
      ["Savings range", "$720K-$1.1M"],
      ["Risk impact", "-9% weighted risk"],
      ["Do not merge", "A + G"],
    ],
    actions: [
      "Move Supplier H labels into Supplier B's packaging contract after service-level checks.",
      "Consolidate fastener spend with Supplier F while preserving one qualified backup.",
      "Keep Supplier A and Supplier G separate until alternates are qualified.",
    ],
    highlights: ["Supplier B", "Supplier F", "Supplier H", "Supplier A", "Supplier G"],
    talk: [
      ["Frame", "Ask for a strategic recommendation, not just an alert list."],
      ["Evidence", "Show which categories have low switching cost and available backup capacity."],
      ["Decision", "Make the tradeoff visible: savings where safe, resilience where fragile."],
    ],
    architecture: [
      ["Users", "Procurement leader asks where consolidation is safe."],
      ["ChatGPT", "Control tower frames the tradeoff between savings and resilience."],
      ["Responses API", "Agent layer compares suppliers, risks, and policy constraints."],
      ["File Search", "Grounding layer retrieves contracts, scorecards, and category strategy."],
      ["Risk Engine", "Analysis estimates concentration risk before and after consolidation."],
      ["Policy Engine", "Guardrails block recommendations that remove critical redundancy."],
    ],
  },
};

export const workflowKeys = Object.keys(workflows) as WorkflowKey[];
