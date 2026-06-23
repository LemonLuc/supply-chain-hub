---
theme: default
title: Carl Zeiss AG x OpenAI | Executive Supply Chain Decision Deck
info: |
  Executive Slidev deck for selling an OpenAI platform approach through the Supply Chain Hub demo.
transition: fade-out
class: se-deck
drawings:
  persist: false
record: true
---

<section class="cover-slide">
  <p class="eyebrow">OpenAI Solutions Engineering</p>
  <h1 class="cover-title">From fragmented supply-chain signals to governed decisions</h1>
  <p class="subtitle">A proposed OpenAI platform approach for Zeiss Supply Chain Management and IT leadership</p>
</section>

---

<section class="slide-section tldr">
  <span class="slide-number">02</span>
  <p class="eyebrow">In a nutshell</p>
  <h1>TL;DR</h1>
  <div class="nutshell-layout">
    <div class="nutshell-thesis">
      <p>OpenAI becomes the governed decision layer between ZEISS supply-chain data and operational action.</p>
      <div class="tldr-proof">
        <span>Executive chat experience</span>
        <span>Enterprise integration and control layer</span>
      </div>
    </div>
    <div class="nutshell-cards">
      <div><h2>Problem</h2><p>Context is split across SAP, logistics, suppliers and files.</p></div>
      <div><h2>Platform move</h2><p>A central communication interface gives leaders <strong>one decision surface</strong>; the API integrates tools and controls.</p></div>
      <div><h2>Pilot</h2><p>Start with one high-value workflow and validate faster triage, evidence quality and governed approvals.</p></div>
    </div>
  </div>
</section>

---

<section class="slide-section customer-slide">
  <span class="slide-number">03</span>
  <p class="eyebrow">Setting the stage</p>
  <h1>Status quo and validation needs</h1>
  <div class="split-60">
    <div class="statement-panel">
      <div class="zeiss-logo" aria-label="ZEISS logo"></div>
      <h2>Known operating context</h2>
      <ul>
        <li>Advanced manufacturing, medical technology, quality and optics domains</li>
        <li>Decisions draw on SAP, supplier, logistics and document context</li>
        <li>Value depends on trustworthy answers, not another dashboard</li>
      </ul>
    </div>
    <div class="assumption-list">
      <h2>Discovery hypotheses to validate</h2>
      <ul>
        <li>Which disruptions consume the most time?</li>
        <li>Where do handoffs reduce accuracy or predictability?</li>
        <li>Which recommendations need evidence, review and traceability?</li>
      </ul>
    </div>
  </div>
</section>

---

<section class="slide-section problem-slide">
  <span class="slide-number">04</span>
  <p class="eyebrow">Business problem</p>
  <h1>Providing a decision framework for existing data</h1>
  <div class="signal-flow">
    <div><b>SAP</b><ul><li>POs</li><li>Material master</li><li>MRP exceptions</li></ul></div>
    <div><b>Warehouse</b><ul><li>EWM stock</li><li>Goods receipts</li><li>Production buffers</li></ul></div>
    <div><b>Carriers</b><ul><li>DHL / FedEx</li><li>ETA changes</li><li>Customs events</li></ul></div>
    <div><b>Suppliers</b><ul><li>Commit dates</li><li>Capacity</li><li>Quality status</li></ul></div>
    <div><b>Files</b><ul><li>Scorecards</li><li>Excel trackers</li><li>Contracts</li></ul></div>
  </div>
  <div class="problem-strip problem-strip-two">
    <div><strong>Pain</strong><ul><li>Manual effort to reconstruct one trusted view</li><li>Answer accuracy varies by source snapshot</li><li>Low precision for lead-time and supplier risk</li><li>Reliability depends on scarce experts</li></ul></div>
    <div><strong>Cost</strong><ul><li>Expedite spend and buffers absorb uncertainty</li><li>Leadership time shifts into escalation meetings</li><li>Late mitigation creates schedule churn</li><li>Scattered evidence increases quality exposure</li></ul></div>
  </div>
</section>

---

<section class="slide-section solution-slide solution-proposal">
  <span class="slide-number">05</span>
  <p class="eyebrow">Solution Proposal</p>
  <h1>Supply Chain Hub as the enterprise decision interface</h1>
  <div class="solution-grid">
    <div><h2>Communication interface</h2><p>An executive-grade conversation surface where teams ask business questions, inspect evidence and <strong>align on next steps</strong>.</p></div>
    <div><h2>Enterprise operating model</h2><p>Role scope, source ownership, approval paths and auditability turn the app into a <strong>governed way of working</strong>.</p></div>
    <div><h2>System integration layer</h2><p>Connects ZEISS systems, documents, business tools and workflow actions, constantly <strong>keeping these sources of truth up to date</strong>.</p></div>
  </div>
  <div class="consequence-band outcome-list">
    <span>Business outcome</span>
    <ul>
      <li>Reduce manual effort by consolidating scattered supply-chain context into one decision interface.</li>
      <li>Improve decision precision with source-backed recommendations and visible assumptions.</li>
      <li>Give leaders a reliable path from signal to recommended action and approval.</li>
    </ul>
  </div>
</section>

---

<section class="slide-section architecture">
  <span class="slide-number">06</span>
  <p class="eyebrow">Reference architecture</p>
  <h1>Solution overview</h1>
  <div class="arch-canvas">
    <div class="arch-zone"><h2>Supply Chain Hub</h2><p>Conversation layer for asking, reviewing evidence and aligning next steps.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone ai-zone"><h2>Intelligence layer</h2><p>Turns supply-chain questions into options and next steps.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone controls-zone"><h2>Operating controls</h2><p>Keeps roles, sources, masking and review paths clear.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone"><h2>ZEISS systems</h2><p>SAP, logistics, supplier, warehouse and documents stay sources of truth.</p></div>
    <div class="arch-rail"><div><b>Ground</b><p>Pull the relevant supply-chain context.</p></div><div><b>Reason</b><p>Compare risk, options and trade-offs.</p></div><div><b>Act</b><p>Send recommendations to owners or approval paths.</p></div></div>
    <div class="arch-subgrid"><div><h2>OpenAI Responses API</h2><p>Streams grounded answers with source context and model controls.</p></div><div><h2>OpenAI Agents SDK</h2><p>Runs tool-backed workflows and reviewer handoffs.</p></div><div><h2>Why OpenAI / ROI</h2><p>Faster escalation cycles, less expedite exposure and a reusable business case.</p></div></div>
  </div>
</section>

---

<section class="slide-section ops-slide decision-workflow-slide">
  <span class="slide-number">07</span>
  <p class="eyebrow">Workflow example</p>
  <h1>Executive workflow: from risk to next step</h1>
  <div class="flow-map workflow-map">
    <div><span>Trigger</span><p>Customer shipment at risk: supplier date, SAP availability and carrier ETA do not match</p></div>
    <div class="flow-arrow">→</div>
    <div><span>Question</span><p>Can we keep the promise date? What needs approval today?</p></div>
    <div class="flow-arrow">→</div>
    <div><span>Evidence</span><p>Orders, inventory, supplier commits, carrier ETA and expedite cost</p></div>
    <div class="flow-arrow">→</div>
    <div><span>Action</span><p>Recommended option, customer impact, owner and approval step</p></div>
  </div>
  <div class="before-after">
    <div><h2>Before</h2><p>Teams spend the first escalation meeting reconciling SAP exports, supplier emails and freight updates.</p></div>
    <div><h2>After</h2><p>Leaders see the exposed orders, root cause, options, cost trade-off and approval owner <strong>in one interface</strong>.</p></div>
  </div>
  <div class="workflow-takeaway">
    <div><h2>What changes in the room</h2><p>The meeting starts with a shared view and a recommended next step.</p></div>
    <div><h2>Why this matters</h2><p>ZEISS keeps source ownership intact while leaders move faster.</p></div>
  </div>
</section>

---

<section class="demo-title">
  <h1>Demo</h1>
</section>

---

<section class="slide-section poc-slide">
  <span class="slide-number">09</span>
  <p class="eyebrow">Proof of concept scorecard</p>
  <h1>Impact validation and success criteria</h1>
  <p class="poc-note">The first POC must prove both business impact and operating trust: faster decisions, better evidence and controlled action paths.</p>
  <div class="validation-layout">
    <div class="validation-panel">
      <span>1</span>
      <h2>Impact validation</h2>
      <ol>
        <li><strong>Baseline</strong><p>Measure current risk-review cycle time, escalation volume and manual triage hours.</p></li>
        <li><strong>Run the workflow</strong><p>Use one live supply-chain risk scenario with real source boundaries and named review.</p></li>
        <li><strong>Read out value</strong><p>Compare avoided effort, decision speed and quality of evidence against baseline.</p></li>
      </ol>
    </div>
    <div class="criteria-panel">
      <span>2</span>
      <h2>Measurable success criteria</h2>
      <div><b>25%</b><p>Faster weekly risk-review cycle versus baseline.</p></div>
      <div><b>90%</b><p>Answers cite trusted ZEISS sources and show assumptions.</p></div>
      <div><b>80%</b><p>Target users rate outputs useful for real workflows.</p></div>
      <div><b>100%</b><p>High-impact actions route to accountable review.</p></div>
    </div>
  </div>
</section>

---

<section class="slide-section scale-slide">
  <span class="slide-number">10</span>
  <p class="eyebrow">Future potential</p>
  <h1>Supply Chain Hub as the business blueprint</h1>
  <div class="expansion-grid">
    <div><h2>Procurement</h2><ul><li>Supplier negotiations</li><li>Contract Q&A</li><li>Spend-risk trade-offs</li></ul></div>
    <div><h2>Quality</h2><ul><li>Deviation triage</li><li>Corrective action summaries</li><li>Supplier quality signals</li></ul></div>
    <div><h2>Manufacturing</h2><ul><li>Line impact analysis</li><li>Work instruction support</li><li>Maintenance handoffs</li></ul></div>
    <div><h2>Finance</h2><ul><li>Working capital views</li><li>Expedite-cost exposure</li><li>Scenario assumptions</li></ul></div>
  </div>
  <p class="callout">The repeatable blueprint is the same: conversational workspace, integration layer, enterprise context and accountable workflow ownership.</p>
</section>

---

<section class="slide-section rollout-slide proof-slide">
  <span class="slide-number">11</span>
  <p class="eyebrow">Looking ahead</p>
  <h1>Proof of value including guardrails</h1>
  <p class="timeline-kicker">Four-week proof of concept maximum, followed by a business decision on pilot scale.</p>
  <div class="timeline">
    <div><span>Week 0</span><h2>Align</h2><p>Sponsor, workflow owner, success metrics, data boundaries.</p></div>
    <div><span>Week 1</span><h2>Connect</h2><p>Representative sources, role scopes, approval policy.</p></div>
    <div><span>Week 2</span><h2>Build</h2><p>App workflow, business tools, grounding and audit trail.</p></div>
    <div><span>Week 3</span><h2>Validate</h2><p>User feedback, answer quality checks, security review.</p></div>
    <div><span>Week 4</span><h2>Decide</h2><p>Impact readout, guardrail review, pilot recommendation.</p></div>
  </div>
  <p class="callout">What is needed to get started: executive sponsorship, access to representative systems and documents, a named business process owner and agreement on operating boundaries for the first controlled pilot.</p>
</section>

---

<section class="annex-title">
  <h1>Annex</h1>
</section>

---

<section class="slide-section">
  <span class="slide-number">13</span>
  <p class="eyebrow">Annex</p>
  <h1>Behind the scenes - actual Supply Chain Hub stack</h1>
  <div class="build-grid">
    <div><h2>App experience</h2><ul><li>Next.js App Router, React and strict TypeScript</li><li><code>app/supply-chain-app.tsx</code> uses AI SDK <code>useChat</code></li><li>Persona, model, thinking and source-selection controls</li></ul></div>
    <div><h2>OpenAI chat path</h2><ul><li><code>/api/chat</code> validates requests and builds server context</li><li><code>@ai-sdk/openai</code> calls <code>openai.responses(...)</code></li><li>Vercel AI SDK streams output; deterministic demo stream remains fallback</li></ul></div>
    <div><h2>Agentic action path</h2><ul><li><code>/api/actions</code> checks workflow and persona access</li><li><code>@openai/agents</code> uses Agent, tool, handoff and run</li><li>Reviewer handoffs plus trace flush; fallback results preserve demo reliability</li></ul></div>
    <div><h2>Repo controls and runtime</h2><ul><li>AGENTS.md: shared logic in <code>lib/</code>; trust in <code>auth</code> / <code>permissions</code></li><li><code>chat-extensions.ts</code> is the MCP / RAG extension point</li><li>OpenNext + Wrangler deploy to Cloudflare Workers; Vitest covers routes and UI</li></ul></div>
  </div>
</section>
