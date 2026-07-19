---
theme: default
title: Carl Zeiss AG x OpenAI | Executive Supply Chain Decision Deck
info: |
  Executive Slidev deck for selling an OpenAI platform approach through the Supply Chain Hub demo.
transition: fade-out
class: se-deck
drawings:
  enabled: true
  persist: false
  presenterOnly: false
  syncAll: true
record: false
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
      <h2>Hypotheses from the technical discovery</h2>
      <ul>
        <li><strong>Time to decision:</strong> Teams reconcile SAP, supplier and logistics updates before acting.</li>
        <li><strong>Data confidence:</strong> Leaders cannot quickly verify which source is current, permitted and traceable.</li>
        <li><strong>Governed action:</strong> Unclear owners and approvals delay mitigation, increasing delivery risk.</li>
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

<section class="slide-section architecture">
  <span class="slide-number">05</span>
  <p class="eyebrow">Reference architecture</p>
  <h1>Solution overview</h1>
  <div class="arch-canvas">
    <div class="arch-zone"><h2>Supply Chain Hub</h2><p>Conversation layer for asking, reviewing evidence and <strong class="arch-highlight">aligning next steps</strong>.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone ai-zone"><h2>Intelligence layer</h2><p>Applies GPT-5.6 model and reasoning controls to turn <strong class="arch-highlight">questions into options</strong>.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone controls-zone"><h2>Operating controls</h2><p><strong class="arch-highlight">Server-side guardrails</strong> check prompt scope, enforce persona, workflow and selected-source access, filter financials and block unavailable actions.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone"><h2>ZEISS systems</h2><p>SAP, logistics, supplier, warehouse and documents stay <strong class="arch-highlight">sources of truth</strong>.</p></div>
    <div class="arch-rail"><div><b>Ground</b><p>Retrieve permitted, current supply-chain context.</p></div><div><b>Reason</b><p>Compare risk, options and trade-offs.</p></div><div><b>Act</b><p>Assign work or route accountable approval.</p></div></div>
    <div class="arch-subgrid"><div><h2>OpenAI Responses API</h2><p>Streams source-backed answers with reasoning and model controls.</p></div><div><h2>OpenAI Agents SDK</h2><p>Runs persona-aware tools, assignments and reviewer handoffs.</p></div><div><h2>Why OpenAI / ROI</h2><p>Faster escalation cycles, less expedite exposure and a reusable business case.</p></div></div>
  </div>
</section>

---

<section class="slide-section ops-slide decision-workflow-slide">
  <span class="slide-number">06</span>
  <p class="eyebrow">Example</p>
  <h1>Executive workflow</h1>
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
    <div><h2>Before</h2><p>A customer delivery is at risk, and the team spends the first 20 minutes <strong>checking which source is actually current</strong> instead of deciding what to do.</p></div>
    <div><h2>After</h2><p>Leaders see the exposed orders, root cause, options, cost trade-off and approval owner <strong>in one interface</strong>.</p></div>
  </div>
  <div class="workflow-security deployment-constraints">
    <h2>Deployment constraints to validate</h2>
    <div><b>Data &amp; privacy</b><p>Approved fields only; confirm GDPR, supplier confidentiality, retention and regional processing.</p></div>
    <div><b>Identity &amp; governance</b><p>SSO, server-side roles and a named reviewer for every high-impact action.</p></div>
    <div><b>Operations &amp; adoption</b><p>Fail-closed fallback, designated process owner, training, feedback and security checkpoints.</p></div>
  </div>
</section>

---

<section class="demo-title">
  <h1>Demo</h1>
</section>

---

<section class="slide-section poc-slide">
  <span class="slide-number">08</span>
  <p class="eyebrow">Proof of concept</p>
  <h1>Impact validation and success criteria</h1>
  <div class="validation-layout">
    <div class="validation-panel roi-panel">
      <h2>First-year value hypothesis</h2>
      <strong class="roi-total">€0.2 - 0.3M</strong>
      <ul class="value-levers">
        <li><b>Faster risk review</b><small>Time saved per completed case</small></li>
        <li><b>Fewer urgent expedites</b><small>Avoided cases × actual expedite cost</small></li>
        <li><b>Lower disruption exposure</b><small>Avoided incidents × verified impact</small></li>
      </ul>
    </div>
    <div class="criteria-panel evaluation-panel">
      <h2>Success criteria</h2>
      <div class="decision-gates">
        <div><b>Process value</b><p class="gate-target">≥25% faster review · ≥80% useful</p><small><strong>Measurement:</strong> Compare timestamped case duration and collect a post-case user rating.</small></div>
        <div><b>Decision quality</b><p class="gate-target">≥90% source-backed · &lt;5% serious risks missed</p><small><strong>Measurement:</strong> Review outputs against expert-approved scenarios and source evidence.</small></div>
        <div><b>Technical reliability</b><p class="gate-target">≥95% correct approved system and workflow</p><small><strong>Measurement:</strong> Inspect tool-call and trace logs across the scenario set.</small></div>
        <div><b>Governance</b><p class="gate-target">100% human review for high-impact actions</p><small><strong>Measurement:</strong> Verify every required approval in the audit log.</small></div>
      </div>
    </div>
  </div>
</section>

---

<section class="slide-section rollout-slide proof-slide time-value-slide">
  <span class="slide-number">09</span>
  <p class="eyebrow">Looking ahead</p>
  <h1>Time to value</h1>
  <div class="timeline">
    <div><span>Week 0</span><h2>Align</h2><p>Sponsor, workflow owner, success metrics, data boundaries.</p></div>
    <div><span>Week 1</span><h2>Connect</h2><p>Representative sources, role scopes, approval policy.</p></div>
    <div><span>Week 2</span><h2>Build</h2><p>App workflow, business tools, grounding and audit trail.</p></div>
    <div><span>Week 3</span><h2>Validate</h2><p>User feedback, answer quality checks, security review.</p></div>
    <div><span>Week 4</span><h2>Decide</h2><p>Impact readout, guardrail review, pilot recommendation.</p></div>
  </div>
  <div class="post-poc-panel">
    <div class="adoption-path">
      <h2>After the POC</h2>
      <div><b>Weeks 5–8 · Pilot</b><p>Harden one workflow and onboard the first team.</p></div>
      <div><b>Weeks 9–12 · Adopt</b><p>Embed ownership, feedback and support.</p></div>
      <div><b>Next · Scale the blueprint</b><p>Reuse the pattern across Procurement, Quality, Manufacturing and Finance.</p></div>
    </div>
    <div class="adoption-support">
      <h2>How OpenAI can support adoption</h2>
      <div><b>Solutions Engineering</b><p>Architecture, POC build and evals.</p></div>
      <div><b>Enterprise support</b><p>Deployment readiness and escalation path.</p></div>
      <div><b>Optional delivery services</b><p>Embedded help for production integration.</p></div>
    </div>
  </div>
</section>

---

<section class="annex-title">
  <h1>Annex</h1>
</section>

---

<section class="slide-section stack-slide">
  <span class="slide-number">11</span>
  <p class="eyebrow">Annex</p>
  <h1>Supply Chain Hub solution stack</h1>
  <div class="build-grid">
    <div><h2>Application experience</h2><ul><li>Next.js App Router, React and strict TypeScript</li><li>AI SDK React chat, persona-aware tools and source controls</li><li>GPT-5.6 Sol, Terra and Luna with selectable reasoning effort</li></ul></div>
    <div><h2>OpenAI Responses API</h2><ul><li>Streams grounded answers through <code>openai.responses(...)</code></li><li>Combines server-owned context, approved tools and reasoning controls</li><li>Streams tool calls and reasoning summaries through the AI SDK UI protocol</li></ul></div>
    <div><h2>OpenAI Agents SDK</h2><ul><li>Runs role-aware action tools and reviewer handoffs</li><li>Enforces persona, workflow and source eligibility server-side</li><li>Flushes traces after each action workflow for operational visibility</li></ul></div>
    <div><h2>Guardrails, visuals and delivery</h2><ul><li><code>gpt-5.4-nano</code> classifies prompt scope with structured output and guardrails fail closed</li><li>Trusted React/SVG charts render operational data; OpenAI Image Generation creates requested conceptual visuals</li><li>Vitest and strict typecheck; OpenNext and Wrangler deploy to Cloudflare Workers</li></ul></div>
  </div>
</section>
