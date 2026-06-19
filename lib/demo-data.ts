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
  title: string;
  question: string;
  confidence: string;
  headline: string;
  summary: string;
  impacts: Array<[string, string]>;
  actions: string[];
  highlights: string[];
  before: string;
  beforeSystems: string[];
  withHub: string;
  hubSteps: Array<[string, string]>;
  sourceStatus: string;
  suggestedPrompts: string[];
};

export const suppliers: Supplier[] = [
  {
    name: "Supplier A",
    category: "Optical glass blanks",
    region: "Germany",
    risk: "High",
    signals: "Furnace capacity constraint, confirmed 14-day slip, single-qualified glass grade",
    impact: "€1.6M revenue at risk",
  },
  {
    name: "Supplier B",
    category: "Precision ceramics",
    region: "Czechia",
    risk: "Medium",
    signals: "Energy surcharge, on-time delivery trending down 8%",
    impact: "€420K expedite and rescheduling exposure",
  },
  {
    name: "Supplier C",
    category: "Motion-control assemblies",
    region: "Switzerland",
    risk: "High",
    signals: "Quality escapes on 3 lots, corrective action overdue",
    impact: "€950K rework and service-level exposure",
  },
  {
    name: "Supplier D",
    category: "Vacuum components",
    region: "Germany",
    risk: "Medium",
    signals: "Customs inspection increase, inventory cover at 18 days",
    impact: "€610K buffer inventory recommendation",
  },
  {
    name: "Supplier E",
    category: "CMOS image sensors",
    region: "Japan",
    risk: "Low",
    signals: "Stable lead time, second source technically approved",
    impact: "€90K routine watchlist",
  },
  {
    name: "Supplier F",
    category: "High-purity coatings",
    region: "Germany",
    risk: "Medium",
    signals: "Precious-metal price variance, alternate process qualified",
    impact: "€210K purchase-price variance",
  },
  {
    name: "Supplier G",
    category: "Industrial electronics",
    region: "Malaysia",
    risk: "High",
    signals: "Flood warning, 9 days inventory cover, no approved substitute",
    impact: "€1.2M production continuity exposure",
  },
  {
    name: "Supplier H",
    category: "Sterile packaging",
    region: "Poland",
    risk: "Low",
    signals: "High service level, excess validated capacity available",
    impact: "€40K normal operating risk",
  },
];

export const workflows: Record<WorkflowKey, Workflow> = {
  risks: {
    title: "Weekly supply risk",
    question: "What are the current top supply risks across all critical suppliers this week?",
    confidence: "Grounded · 6 sources",
    headline: "Three suppliers require action before the next planning cycle.",
    summary:
      "Supply Chain Hub correlates open purchase orders, inventory cover, supplier commitments, quality events and logistics signals. Supplier A is most urgent because the delayed optical glass grade has no approved substitute.",
    impacts: [
      ["Highest exposure", "Supplier A"],
      ["Revenue at risk", "€4.8M"],
      ["Decision window", "Today"],
    ],
    actions: [
      "Open a joint recovery call with Supplier A, procurement and production planning today.",
      "Place Supplier G on daily monitoring until the flood and transport risk clears.",
      "Escalate Supplier C's overdue corrective action with quality ownership and due date.",
    ],
    highlights: ["Supplier A", "Supplier G", "Supplier C"],
    before:
      "Planner checks SAP open purchase orders and inventory, supplier portals, Excel scorecards, quality notifications, logistics updates and email to assemble one weekly view.",
    beforeSystems: ["SAP S/4HANA", "Supplier portals", "Excel scorecards", "Email & quality notices"],
    withHub:
      "Supply Chain Hub retrieves authorized records, reconciles conflicting supplier signals and uses OpenAI to explain the ranked exposure with evidence and human-owned actions.",
    hubSteps: [
      ["Retrieve", "Authorized ERP, supplier, quality and logistics records"],
      ["Reconcile", "Normalize suppliers, parts, dates and conflicting signals"],
      ["Decide", "Rank exposure and propose approval-ready actions"],
    ],
    sourceStatus: "6 connected sources · refreshed 08:42 CET",
    suggestedPrompts: [
      "Which supplier needs action today?",
      "Show the evidence behind Supplier A's ranking.",
      "Draft the morning escalation brief.",
    ],
  },
  delay: {
    title: "Supplier A: 14-day delay",
    question: "Supplier A slips by 14 days. What is the operational and customer risk?",
    confidence: "Scenario · policy checked",
    headline: "The 14-day slip creates a five-day production gap in week three.",
    summary:
      "Current inventory protects priority production through day nine. The recommended response combines selective air freight, product-mix changes and accelerated approval of the qualified alternate glass grade.",
    impacts: [
      ["Production gap", "5 days"],
      ["At-risk orders", "18%"],
      ["Mitigation cost", "€310K"],
    ],
    actions: [
      "Expedite 40% of Supplier A volume to protect regulated and strategic customer orders.",
      "Move two lower-priority builds into week four to preserve constrained glass inventory.",
      "Request engineering and quality approval for the qualified alternate before the next build release.",
    ],
    highlights: ["Supplier A", "Supplier E"],
    before:
      "Planner exports BOM and inventory data, searches affected production orders, emails procurement and production planning, then builds a spreadsheet scenario by hand.",
    beforeSystems: ["SAP BOM where-used", "MRP & inventory", "Customer order backlog", "Email coordination"],
    withHub:
      "One question retrieves BOM where-used, inventory cover, open production and customer orders, qualified alternates and allocation policy before a deterministic scenario engine calculates exposure.",
    hubSteps: [
      ["Trace", "Map the delayed material through BOMs and released production orders"],
      ["Simulate", "Calculate shortage timing, customer exposure and mitigation cost"],
      ["Mitigate", "Compare expedites, allocation and alternate-material options"],
    ],
    sourceStatus: "5 connected sources · scenario calculated 08:44 CET",
    suggestedPrompts: [
      "Which production orders are exposed?",
      "Compare air freight with order reallocation.",
      "What approval is needed for the alternate?",
    ],
  },
  consolidate: {
    title: "Procurement optimization",
    question: "Where can we consolidate spend without weakening supply resilience?",
    confidence: "Guardrails applied",
    headline: "Consolidate selected tail spend while preserving critical optical and electronic redundancy.",
    summary:
      "The opportunity is concentrated in packaging, coatings and standard components where qualified alternatives and capacity exist. Supplier A and Supplier G remain protected because consolidation would increase continuity risk.",
    impacts: [
      ["Savings range", "€720K–€1.1M"],
      ["Risk impact", "-9% weighted risk"],
      ["Protected sources", "A + G"],
    ],
    actions: [
      "Combine sterile packaging volumes after validation and service-level checks.",
      "Bundle high-purity coating spend while retaining one qualified backup process.",
      "Keep Supplier A and Supplier G outside consolidation until substitutes are approved.",
    ],
    highlights: ["Supplier B", "Supplier F", "Supplier H", "Supplier A", "Supplier G"],
    before:
      "Procurement reviews spend cubes and contracts periodically, often separately from delivery, quality, capacity, disruption and resilience signals.",
    beforeSystems: ["SAP spend cube", "Contract repository", "Supplier scorecards", "Risk spreadsheets"],
    withHub:
      "Supply Chain Hub combines spend, contracts, performance, capacity and operational risk. Guardrails preserve critical redundancy and block savings that create unacceptable concentration.",
    hubSteps: [
      ["Combine", "Join category spend, contracts, performance and capacity"],
      ["Constrain", "Apply quality, redundancy and critical-part guardrails"],
      ["Recommend", "Rank savings opportunities with risk before and after"],
    ],
    sourceStatus: "7 connected sources · policy set v3.4 applied",
    suggestedPrompts: [
      "Where is consolidation safe this quarter?",
      "Why are Supplier A and G protected?",
      "Show savings after resilience guardrails.",
    ],
  },
};

export const workflowKeys = Object.keys(workflows) as WorkflowKey[];
