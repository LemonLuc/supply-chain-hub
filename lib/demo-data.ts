import type { PersonaId } from "./permissions";

export type WorkflowKey = "risks" | "delay" | "consolidate";

export type WorkflowSource = {
  id: string;
  name: string;
  category: string;
  detail: string;
  selected: boolean;
};

export type ActivityStep = {
  tool: string;
  detail: string;
  result: string;
};

export type WorkflowAction = {
  label: string;
  detail: string;
  kind: "draft" | "update" | "share" | "approval";
};

export type ResultRow = {
  subject: string;
  detail: string;
  status: string;
  evidence: string;
  financial?: string;
};

export type HeatMapItem = {
  supplier: string;
  cost: "Low" | "Medium" | "High";
  resilience: "Low" | "Medium" | "High";
  recommendation: string;
};

export type Workflow = {
  navLabel: string;
  title: string;
  question: string;
  description: string;
  minimumPersona: PersonaId;
  accessLabel: string;
  sourceStatus: string;
  suggestedPrompts: string[];
  sources: WorkflowSource[];
  activity: ActivityStep[];
  headline: string;
  summary: string;
  metrics: Array<[string, string]>;
  financialMetrics?: Array<[string, string]>;
  actions: WorkflowAction[];
  rows: ResultRow[];
  heatMap?: HeatMapItem[];
  approval?: {
    label: string;
    detail: string;
  };
};

export const workflows: Record<WorkflowKey, Workflow> = {
  risks: {
    navLabel: "Risk radar",
    title: "Monday delivery radar",
    question: "Is there any delivery risk this week for N-FK5 optical glass blanks used in the Axioscan 7 objective module?",
    description:
      "Checks open purchase orders and live carrier milestones, then reports only operational exceptions relevant to your role.",
    minimumPersona: "logistics",
    accessLabel: "Available to logistics and procurement",
    sourceStatus: "6 available tools · live demo data",
    suggestedPrompts: [
      "Is there any delivery risk this week for N-FK5 optical glass blanks used in the Axioscan 7 objective module?",
      "Which incoming shipment needs attention before Wednesday?",
      "Check whether any carrier milestone changed overnight.",
    ],
    sources: [
      { id: "sap", name: "SAP S/4HANA", category: "ERP MCP", detail: "POs, material master, promised dates", selected: true },
      { id: "dhl", name: "DHL Freight", category: "Carrier MCP", detail: "Road freight milestones and exceptions", selected: true },
      { id: "fedex", name: "FedEx", category: "Carrier MCP", detail: "Priority shipment tracking", selected: true },
      { id: "ups", name: "UPS", category: "Carrier MCP", detail: "Parcel and customs events", selected: false },
      { id: "warehouse", name: "EWM warehouse", category: "SAP MCP", detail: "Goods receipts and available stock", selected: true },
      { id: "outlook", name: "Outlook", category: "Microsoft 365 MCP", detail: "Draft operational follow-ups", selected: false },
    ],
    activity: [
      { tool: "SAP S/4HANA MCP", detail: "Read PO 4500872319 and material N-FK5-110-32", result: "480 blanks due 24 June" },
      { tool: "DHL Freight MCP", detail: "Checked shipment 00340434161094000012", result: "Hub departure missed by 19 hours" },
      { tool: "FedEx MCP", detail: "Checked backup parcel 771924603189", result: "On schedule for 23 June" },
      { tool: "SAP EWM MCP", detail: "Read Jena receiving stock and reservations", result: "2.5 production days available" },
    ],
    headline: "Delivery exception found",
    summary:
      "DHL Freight shipment 00340434161094000012, containing 480 N-FK5 blanks, missed its Leipzig hub departure and is now expected on Thursday, 25 June. The smaller FedEx priority shipment remains on schedule. Current stock covers production until Thursday afternoon.",
    metrics: [
      ["Affected material", "N-FK5-110-32"],
      ["Expected arrival", "Thu, 25 Jun"],
      ["Production buffer", "2.5 days"],
    ],
    financialMetrics: [
      ["Expedite option", "€8,400"],
      ["Avoided downtime", "€185,000"],
    ],
    actions: [
      { label: "Draft email to DHL Freight", detail: "Ask for recovery routing and confirmed ETA.", kind: "draft" },
      { label: "Notify logistics team lead", detail: "Prepare a concise Teams and email update.", kind: "draft" },
      { label: "Update SAP promised date", detail: "Write 25 June to PO 4500872319 after confirmation.", kind: "update" },
    ],
    rows: [
      {
        subject: "PO 4500872319 · DHL Freight",
        detail: "480 N-FK5 optical glass blanks",
        status: "Attention",
        evidence: "Leipzig departure missed; ETA moved from 24 to 25 June",
        financial: "€185K downtime exposure",
      },
      {
        subject: "PO 4500872481 · FedEx Priority",
        detail: "60 N-FK5 optical glass blanks",
        status: "On schedule",
        evidence: "Departed Frankfurt; delivery due 23 June, 10:30",
        financial: "€8.4K expedite charge",
      },
    ],
  },
  delay: {
    navLabel: "Supplier alternatives",
    title: "Operational alternate sourcing",
    question: "What are our approved alternatives if the objective turret supplier for Axioscan 7 is delayed by 12 days?",
    description:
      "Traces the affected orders, checks qualified substitutes and prepares the operational handoffs needed to keep production moving.",
    minimumPersona: "procurement",
    accessLabel: "Team lead or procurement access required",
    sourceStatus: "6 available tools · restricted workflow",
    suggestedPrompts: [
      "What are our approved alternatives if the objective turret supplier for Axioscan 7 is delayed by 12 days?",
      "Which production orders can use an approved alternate turret?",
      "Prepare the supplier overview update for the logistics lead.",
    ],
    sources: [
      { id: "sap", name: "SAP S/4HANA", category: "ERP MCP", detail: "BOM where-used, orders, inventory", selected: true },
      { id: "quality", name: "Supplier qualification database", category: "Quality MCP", detail: "Approved parts and deviations", selected: true },
      { id: "excel", name: "Supplier overview.xlsx", category: "SharePoint MCP", detail: "Operational supplier tracker", selected: true },
      { id: "capacity", name: "Supplier capacity portal", category: "Supplier MCP", detail: "Available capacity and lead time", selected: true },
      { id: "outlook", name: "Outlook", category: "Microsoft 365 MCP", detail: "Draft supplier and team emails", selected: true },
      { id: "teams", name: "Microsoft Teams", category: "Microsoft 365 MCP", detail: "Share approved operational update", selected: false },
    ],
    activity: [
      { tool: "SAP S/4HANA MCP", detail: "Ran BOM where-used for turret assembly 000113-8821", result: "14 released Axioscan 7 orders affected" },
      { tool: "Quality MCP", detail: "Checked approved manufacturer list and deviations", result: "One alternate approved with a torque-test condition" },
      { tool: "Supplier capacity MCP", detail: "Requested current capacity from Mechatronik Süd", result: "Eight units available within six days" },
      { tool: "SharePoint MCP", detail: "Opened supplier overview.xlsx", result: "Row and comment targets identified" },
    ],
    headline: "One approved alternate can protect the first eight builds",
    summary:
      "Mechatronik Süd assembly MT-440B is approved for Axioscan 7 with an incoming torque-test requirement. Eight units can arrive within six days. The remaining six orders should be resequenced while the primary supplier recovers.",
    metrics: [
      ["Affected builds", "14"],
      ["Alternate units", "8"],
      ["Coverage gap", "6 builds"],
    ],
    financialMetrics: [
      ["Alternate premium", "€21,600"],
      ["Expedite estimate", "€4,900"],
    ],
    actions: [
      { label: "Add comment to supplier overview", detail: "Update the primary supplier row with delay, owner and next review.", kind: "update" },
      { label: "Share overview with logistics lead", detail: "Prepare the current Excel view for the department lead.", kind: "share" },
      { label: "Draft alternate capacity request", detail: "Ask Mechatronik Süd to reserve eight MT-440B units.", kind: "draft" },
    ],
    rows: [
      {
        subject: "Mechatronik Süd · MT-440B",
        detail: "Approved alternate objective turret",
        status: "Conditional approval",
        evidence: "8 units in 6 days; incoming torque test required",
        financial: "€2,700 premium per unit",
      },
      {
        subject: "OptoMotion Brno · OM-17",
        detail: "Potential second alternate",
        status: "Not approved",
        evidence: "Dimensional review complete; endurance validation still open",
        financial: "Commercial quote pending",
      },
    ],
  },
  consolidate: {
    navLabel: "Executive supplier portfolio",
    title: "Supplier portfolio governance",
    question: "Give me a cost-versus-resilience heat map and recommend where we can consolidate suppliers without weakening continuity.",
    description:
      "Combines commercial and operational evidence, applies resilience guardrails, and routes consequential actions to accountable human reviewers.",
    minimumPersona: "procurement",
    accessLabel: "Procurement lead view · executive approval enforced",
    sourceStatus: "7 available tools · governance policy active",
    suggestedPrompts: [
      "Give me a heat map of suppliers showing cost versus resilience and recommend where we can consolidate.",
      "Which tail-spend suppliers can be consolidated under our dual-source guardrail?",
      "Prepare an executive review pack for the recommended changes.",
    ],
    sources: [
      { id: "sap", name: "SAP spend analytics", category: "ERP MCP", detail: "Category spend and purchase history", selected: true },
      { id: "contracts", name: "Contract repository", category: "Legal RAG", detail: "Terms, notice periods and obligations", selected: true },
      { id: "quality", name: "Supplier scorecards", category: "Quality MCP", detail: "OTD, defects and corrective actions", selected: true },
      { id: "resilience", name: "Resilience signals", category: "Risk MCP", detail: "Capacity, geography and single-source data", selected: true },
      { id: "policy", name: "Procurement policy", category: "Policy RAG", detail: "Approval and dual-source guardrails", selected: true },
      { id: "word", name: "Microsoft Word", category: "Microsoft 365 MCP", detail: "Draft review documents only", selected: false },
    ],
    activity: [
      { tool: "SAP Spend MCP", detail: "Aggregated 12 months of spend by category and supplier", result: "42 active suppliers across 9 categories" },
      { tool: "Contract RAG", detail: "Retrieved notice periods and volume commitments", result: "Three contracts eligible for review this quarter" },
      { tool: "Resilience MCP", detail: "Scored capacity, location and qualification redundancy", result: "Two consolidation options pass dual-source policy" },
      { tool: "Policy RAG", detail: "Applied procurement policy SC-17 and approval matrix", result: "Contract termination requires C-level approval" },
    ],
    headline: "Two consolidation candidates pass the resilience guardrails",
    summary:
      "Sterile packaging and standard machined brackets show overlapping capacity, stable quality and qualified backups. Optical glass and motion-control assemblies remain protected. The tool may prepare review materials, but it cannot terminate a supplier contract.",
    metrics: [
      ["Candidates", "2"],
      ["Protected categories", "4"],
      ["Policy checks", "12 passed"],
    ],
    financialMetrics: [
      ["Annual opportunity", "€740K–€960K"],
      ["Transition budget", "€180K"],
    ],
    actions: [
      { label: "Prepare executive review pack", detail: "Create the evidence summary, heat map and decision record.", kind: "draft" },
      { label: "Request executive review", detail: "Route the recommendation to the C-level approval queue.", kind: "approval" },
      { label: "Draft contract termination", detail: "Prepare a non-binding draft; no notice is sent.", kind: "draft" },
    ],
    rows: [
      {
        subject: "Sterile packaging",
        detail: "Suppliers H, J and K",
        status: "Consolidation candidate",
        evidence: "Validated capacity at two suppliers; stable service and quality",
        financial: "€410K–€520K opportunity",
      },
      {
        subject: "Standard machined brackets",
        detail: "Suppliers M, N and P",
        status: "Consolidation candidate",
        evidence: "Interchangeable drawings; three qualified sources in Germany",
        financial: "€330K–€440K opportunity",
      },
      {
        subject: "Optical glass blanks",
        detail: "Suppliers A and Q",
        status: "Protected",
        evidence: "Limited qualified furnace capacity; dual-source guardrail applies",
        financial: "No consolidation recommended",
      },
    ],
    heatMap: [
      { supplier: "Supplier H", cost: "High", resilience: "High", recommendation: "Consolidate volume" },
      { supplier: "Supplier J", cost: "Medium", resilience: "High", recommendation: "Retain as primary" },
      { supplier: "Supplier M", cost: "High", resilience: "Medium", recommendation: "Renegotiate or consolidate" },
      { supplier: "Supplier A", cost: "High", resilience: "Low", recommendation: "Protect and qualify backup" },
      { supplier: "Supplier Q", cost: "Medium", resilience: "Low", recommendation: "Retain for redundancy" },
    ],
    approval: {
      label: "C-level approval required",
      detail:
        "Any supplier termination or material volume reallocation remains blocked until an executive reviewer approves the decision record.",
    },
  },
};

export const workflowKeys = Object.keys(workflows) as WorkflowKey[];
