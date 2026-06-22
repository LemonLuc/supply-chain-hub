---
theme: default
title: Carl Zeiss AG x OpenAI | Executive Supply Chain Decision Deck
info: |
  Executive Slidev deck for selling an OpenAI API / SDK platform approach through the Supply Chain Hub demo.
transition: fade-out
class: se-deck
drawings:
  persist: false
record: true
---

<section class="cover-slide">
  <p class="eyebrow">OpenAI Solutions Engineering</p>
  <h1 class="cover-title">From fragmented supply-chain signals to governed decisions</h1>
  <p class="subtitle">A proposed OpenAI platform approach for ZEISS Supply Chain, Procurement and IT leadership</p>
  <div class="talk-track"><span>9 min executive setup</span><span>18 min live demo</span><span>3 min proof-of-value close</span></div>
</section>

---

<section class="slide-section tldr">
  <span class="slide-number">02</span>
  <p class="eyebrow">In a nutshell</p>
  <h1>TL;DR</h1>
  <div class="tldr-layout">
    <div class="tldr-main">
      <p>OpenAI becomes the governed decision layer between ZEISS supply-chain data and operational action.</p>
      <div class="tldr-proof">
        <b>ChatGPT style front end</b>
        <b>OpenAI API / SDK + ZEISS backend MCP integration</b>
      </div>
    </div>
    <div class="tldr-stack">
      <div><h2>Problem</h2><p>Context is split across SAP, logistics, suppliers and files.</p></div>
      <div><h2>Platform move</h2><p>A central communication interface gives leaders one decision surface; the API integrates tools and controls.</p></div>
      <div><h2>Pilot</h2><p>Start with one high-value workflow and validate faster triage, evidence quality and governed approvals.</p></div>
    </div>
  </div>
</section>

---

<section class="slide-section customer-slide">
  <span class="slide-number">03</span>
  <p class="eyebrow">Setting the stage</p>
  <h1>Discovery baseline: what is known, what must be proven</h1>
  <div class="split-60">
    <div class="statement-panel">
      <div class="zeiss-logo" aria-label="ZEISS logo"></div>
      <h2>Known operating context</h2>
      <ul>
        <li>ZEISS operates across advanced manufacturing, medical technology, quality and optics domains</li>
        <li>Supply-chain decisions depend on SAP, supplier, logistics and document context</li>
        <li>Executive value depends on trustworthy answers, not another disconnected dashboard</li>
      </ul>
    </div>
    <div class="assumption-list">
      <h2>Discovery hypotheses to validate</h2>
      <ul>
        <li>Which disruptions consume the most planner, procurement and leadership time?</li>
        <li>Where do handoffs weaken accuracy, precision or predictability?</li>
        <li>Which recommendations need approval, auditability and source-level evidence?</li>
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
  <h1>Supply Chain Hub as the Enterprise decision model</h1>
  <div class="solution-grid">
    <div><h2>Communication interface</h2><p>A ChatGPT-style app where executives and operators ask business questions, inspect evidence and align on next steps.</p></div>
    <div><h2>Enterprise operating model</h2><p>Role scope, source ownership, approval paths and auditability turn the app into a governed way of working.</p></div>
    <div><h2>System integration layer</h2><p>OpenAI API / SDK connects ZEISS systems, MCP tools, documents and workflow actions without replacing systems of record.</p></div>
  </div>
  <div class="consequence-band">
    <span>Business outcome</span>
    <p>Reduction of manual effort, improved decision precision, provision of a reliable decision path from signal to action for leaders.</p>
  </div>
</section>

---

<section class="slide-section architecture">
  <span class="slide-number">06</span>
  <p class="eyebrow">Reference architecture</p>
  <h1>Solution overview</h1>
  <div class="arch-canvas">
    <div class="arch-zone"><span>01</span><h2>Supply Chain Hub app</h2><p>Ask, review evidence, approve.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone ai-zone"><span>02</span><h2>OpenAI integration</h2><p>API / SDK, <code>/api/chat</code>, MCP tools.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone governance-zone"><span>03</span><h2>Governance</h2><p>Role scope, source filters, masking, approvals.</p></div>
    <div class="arch-connector">→</div>
    <div class="arch-zone"><span>04</span><h2>ZEISS systems</h2><p>SAP, carriers, suppliers, files, workflows.</p></div>
    <div class="arch-rail"><div><b>Ground</b><p>Assemble approved context.</p></div><div><b>Reason</b><p>Synthesize risk and options.</p></div><div><b>Act</b><p>Route high-impact changes to approval.</p></div></div>
    <div class="arch-subgrid"><div><h2>MCP tool layer</h2><p>Risk, scenario, supplier and policy functions.</p></div><div><h2>Retrieval</h2><p>Approved documents, trackers and records.</p></div><div><h2>Cloudflare Developer Platform</h2><p>App deployed on Cloudflare for a fast, edge-ready demo path.</p></div></div>
  </div>
</section>

---

<section class="slide-section workflow-slide">
  <span class="slide-number">07</span>
  <p class="eyebrow">Decision model</p>
  <h1>The mental model: ask, ground, decide, govern</h1>
  <div class="process-line process-flow conceptual-flow">
    <div><h2><b>1</b> Ask</h2><p>Executive question framed in business language</p></div>
    <div class="process-arrow">→</div>
    <div><h2><b>2</b> Scope</h2><p>Role, source and policy boundaries</p></div>
    <div class="process-arrow">→</div>
    <div><h2><b>3</b> Ground</h2><p>Approved enterprise evidence and assumptions</p></div>
    <div class="process-arrow">→</div>
    <div><h2><b>4</b> Decide</h2><p>Options, trade-offs and confidence</p></div>
    <div class="process-arrow">→</div>
    <div><h2><b>5</b> Govern</h2><p>Human review and auditable action path</p></div>
  </div>
  <div class="model-band">
    <div><h2>Thought leadership angle</h2><p>The app is not another dashboard. It is a reusable decision model that turns fragmented enterprise signals into governed action.</p></div>
    <div><h2>Why OpenAI</h2><p>Natural-language reasoning plus MCP-enabled tool access lets leaders move from question to evidence to next action without learning every system.</p></div>
    <div><h2>Deployment note</h2><p>The demo app is deployed on Cloudflare Developer Platform for fast iteration and edge-ready delivery.</p></div>
  </div>
</section>

---

<section class="slide-section ops-slide">
  <span class="slide-number">08</span>
  <p class="eyebrow">Workflow example</p>
  <h1>Executive workflow before switching to the live demo</h1>
  <div class="flow-map workflow-map">
    <div><span>Trigger</span><p>Critical supplier delay threatens customer commitments</p></div>
    <div class="flow-arrow">→</div>
    <div><span>Question</span><p>Which orders are exposed and what can we do today?</p></div>
    <div class="flow-arrow">→</div>
    <div><span>Evidence</span><p>SAP demand, supplier status, carrier milestones, inventory</p></div>
    <div class="flow-arrow">→</div>
    <div><span>Action</span><p>Recommended mitigation with owner, risk and approval path</p></div>
  </div>
  <div class="before-after">
    <div><h2>Before</h2><p>Teams reconcile trackers, SAP extracts and supplier emails before leadership can discuss trade-offs.</p></div>
    <div><h2>After</h2><p>The executive sees a grounded recommendation, confidence level, cost exposure and required approval step in one interface.</p></div>
  </div>
</section>

---

<section class="demo-title">
  <h1>Demo</h1>
  <p>18 minutes live walkthrough</p>
</section>

---

<section class="slide-section">
  <span class="slide-number">10</span>
  <p class="eyebrow">Proof of concept scorecard</p>
  <h1>Impact validation and success criteria</h1>
  <p class="poc-note">Use the live demo workflow as the first POC candidate: prove measurable value, source trust and governance within four weeks.</p>
  <div class="roi-grid impact-grid">
    <div><h2>Baseline</h2><ul><li>Risk review cycle time</li><li>Escalation frequency</li><li>Manual triage hours</li></ul></div>
    <div><h2>Decision speed</h2><b>25%</b><p>Faster weekly risk-review cycle versus baseline.</p></div>
    <div><h2>Grounding quality</h2><b>90%</b><p>Answers cite approved ZEISS sources and show assumptions.</p></div>
    <div><h2>User pull</h2><b>80%</b><p>Target users rate outputs useful for real workflows.</p></div>
    <div><h2>Governance</h2><b>100%</b><p>High-impact actions route to human approval.</p></div>
    <div><h2>Business impact</h2><ul><li>Track avoided expedite actions</li><li>Measure planner throughput</li><li>Score answer trust and evidence quality</li></ul></div>
  </div>
</section>

---

<section class="slide-section scale-slide">
  <span class="slide-number">11</span>
  <p class="eyebrow">Future potential</p>
  <h1>Supply Chain Hub as the business blueprint</h1>
  <div class="expansion-grid">
    <div><h2>Procurement</h2><ul><li>Supplier negotiations</li><li>Contract Q&A</li><li>Spend-risk trade-offs</li></ul></div>
    <div><h2>Quality</h2><ul><li>Deviation triage</li><li>Corrective action summaries</li><li>Supplier quality signals</li></ul></div>
    <div><h2>Manufacturing</h2><ul><li>Line impact analysis</li><li>Work instruction support</li><li>Maintenance handoffs</li></ul></div>
    <div><h2>Finance</h2><ul><li>Working capital views</li><li>Expedite-cost exposure</li><li>Scenario assumptions</li></ul></div>
  </div>
  <p class="callout">The reusable pattern is the same: governed app experience, OpenAI API / SDK integration layer, approved enterprise data and human-controlled actions.</p>
</section>

---

<section class="slide-section rollout-slide">
  <span class="slide-number">12</span>
  <p class="eyebrow">Looking ahead</p>
  <h1>Proof of value including guardrails</h1>
  <p class="timeline-kicker">Four-week proof of concept maximum, followed by a business decision on pilot scale.</p>
  <div class="timeline">
    <div><span>Week 0</span><h2>Align</h2><p>Sponsor, workflow owner, success metrics, data boundaries.</p></div>
    <div><span>Week 1</span><h2>Connect</h2><p>Representative sources, role scopes, approval policy.</p></div>
    <div><span>Week 2</span><h2>Build</h2><p>App workflow, MCP tools, grounding and audit trail.</p></div>
    <div><span>Week 3</span><h2>Validate</h2><p>User feedback, answer quality checks, security review.</p></div>
    <div><span>Week 4</span><h2>Decide</h2><p>Impact readout, guardrail review, pilot recommendation.</p></div>
  </div>
  <p class="callout">What is needed to get started: executive sponsorship, access to representative systems and documents, a named business process owner and agreement on governance boundaries for the first controlled pilot.</p>
</section>

---

<section class="annex-title">
  <h1>Annex</h1>
</section>

---

<section class="slide-section">
  <span class="slide-number">14</span>
  <p class="eyebrow">Annex</p>
  <h1>Behind the scenes - how Supply Chain Hub was built</h1>
  <div class="build-grid">
    <div><h2>Experience</h2><ul><li>Next.js and React UI</li><li>AI SDK <code>useChat</code></li><li>Source controls and approval UI</li></ul></div>
    <div><h2>AI route</h2><ul><li><code>/api/chat</code> validates requests</li><li>Builds server-side context</li><li>Streams OpenAI responses or deterministic fallback</li></ul></div>
    <div><h2>Governance</h2><ul><li>Persona policy</li><li>Workflow access</li><li>Source filtering and financial masking</li></ul></div>
    <div><h2>Runtime</h2><ul><li>App deployed on Cloudflare Developer Platform</li><li>OpenNext + Cloudflare Worker path</li><li>Tests for chat, permissions and UI flows</li></ul></div>
  </div>
</section>
