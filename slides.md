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
    <div><b>Identity &amp; governance</b><p>SSO, server-side roles, masking and a named reviewer for every high-impact action.</p></div>
    <div><b>Operations &amp; adoption</b><p>Fail-closed fallback, process owner, training, feedback and security / works-council checkpoints.</p></div>
  </div>
</section>

---

<section class="demo-title">
  <h1>Demo</h1>
</section>

---

<section class="slide-section poc-slide">
  <span class="slide-number">08</span>
  <p class="eyebrow">Proof of concept scorecard</p>
  <h1>Impact validation and success criteria</h1>
  <p class="poc-note">Validate a credible business case and earn a scale decision by testing real supply-chain scenarios with ZEISS business and IT owners.</p>
  <div class="validation-layout">
    <div class="validation-panel roi-panel">
      <span>1</span>
      <h2>Business value to validate</h2>
      <strong class="roi-total">€180K–€310K</strong>
      <p class="roi-caption">Illustrative annual gross value. The POC will confirm actual review volumes, expedite costs and disruption exposure against the ZEISS baseline.</p>
      <div class="roi-drivers">
        <div><b>€15K–€25K</b><p>Faster review work</p><small>600–1,000 reviews × 20 minutes saved × €75/hour</small></div>
        <div><b>€101K–€151K</b><p>Fewer urgent expedites</p><small>12–18 avoided cases × €8,400</small></div>
        <div><b>€65K–€130K</b><p>Lower disruption exposure</p><small>0.35–0.70 probability-weighted events × €185,000</small></div>
      </div>
      <p class="roi-gate"><strong>Scale decision</strong> ZEISS confirms measured benefit and annual solution cost before rollout. Net ROI = (validated benefit − annualized solution cost) ÷ annualized solution cost.</p>
    </div>
    <div class="criteria-panel evaluation-panel">
      <span>2</span>
      <h2>How the POC earns a scale decision</h2>
      <div class="proof-steps">
        <div><b>1</b><p><strong>Agree realistic test scenarios.</strong> Business and IT select routine cases, high-impact exceptions and permission boundaries.</p></div>
        <div><b>2</b><p><strong>Compare each answer and proposed action.</strong> Check the supporting evidence, serious-risk coverage, approved systems and required human approvals.</p></div>
        <div><b>3</b><p><strong>Review failures together.</strong> Correct the workflow and rerun the same scenarios before release.</p></div>
      </div>
      <div class="release-gates buyer-gates">
        <div><b>Business value · Process owner</b><p>At least 25% faster review work and at least 80% user usefulness.</p></div>
        <div><b>Decision quality · Supply-chain lead</b><p>At least 90% supported by approved sources and fewer than 5% of serious risks missed.</p></div>
        <div><b>Technical reliability · IT / AI owner</b><p>At least 95% of runs use the correct approved systems and workflow.</p></div>
        <div><b>Governance · Risk owner</b><p>Every sensitive or high-impact action receives accountable human review.</p></div>
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
  <h1>Behind the scenes</h1>
  <div class="build-grid">
    <div><h2>App experience</h2><ul><li>Next.js App Router, React and strict TypeScript</li><li>GPT-5.6 Sol, Terra and Luna with six reasoning levels</li><li>Persona-aware tools, source settings, answer copy and feedback controls</li></ul></div>
    <div><h2>Grounded chat and guardrails</h2><ul><li><code>/api/chat</code> runs prompt-scope checks before context, sources or tools</li><li>Server context enforces role scope, selected sources and masked fields</li><li>Responses streaming with deterministic workbook and demo fallbacks</li></ul></div>
    <div><h2>Agentic actions and integrations</h2><ul><li><code>/api/actions</code> enforces persona, workflow and source eligibility</li><li>Explicit assignee and reviewer metadata drives tasks and approvals</li><li>Role-aware Microsoft 365 grouping, reviewer handoffs and trace flushing</li></ul></div>
    <div><h2>Decision support and delivery</h2><ul><li>Model-selected savings–relationship bubble or matrix; trusted records stay server-owned</li><li>Server-derived decision colors align recommendations across both views</li><li>Vitest, strict typecheck and OpenNext/Wrangler delivery to Cloudflare Workers</li></ul></div>
  </div>
</section>
