# Supply Chain Hub — 30-Minute Consultative Talking Track

## How to use this file

- Use this as a speaking guide, not a script to read word for word.
- In the timed track, every normal bullet is spoken content; only **Demo action** and **Question check** bullets are presenter reminders.
- Keep the first six slides to 9 minutes, the demo to 18 minutes, and slides 8–9 to 3 minutes.
- Use the question checks only as reminders to ask whether the audience has questions.
- Treat all time and effort comparisons as working assumptions to validate during the proof of concept.
- Use Appendix A for buyer questions and Appendix B only when the interviewers ask for product feedback.

## Version 1 — Consultative

- Best for a mixed room of supply-chain, business, and IT leaders.
- The flow moves from the customer problem to OpenAI value, enterprise controls, and a measurable next step.

## 0:00–9:00 — Slides 1–6

### 0:00–0:40 — Slide 1: From fragmented signals to governed decisions

- Thank you for the time today.
- This is a proposed OpenAI platform approach for ZEISS Supply Chain Management and IT leadership.
- I want to focus on one practical question.
- How can ZEISS move from scattered supply-chain signals to a trusted decision without replacing systems that already work?
- SAP, logistics, and supplier systems remain the sources of truth.
- The same applies to warehouse and document systems.
- OpenAI adds a decision layer that helps people bring the facts together, understand the trade-offs, and take the right next step.
- The outcome is a faster decision that people can verify, approve, and defend.

### 0:40–1:30 — Slide 2: TL;DR

- OpenAI becomes the governed decision layer between ZEISS supply-chain data and operational action.
- The experience has two parts.
- The first is an executive chat experience for asking questions and reviewing evidence.
- The second is an integration and control layer that connects tools through the API.
- **Problem:** context is split across SAP, logistics, and suppliers.
- Files add another source.
- **Platform move:** one central communication interface gives leaders one decision surface.
- The API integrates the tools and controls behind that interface.
- **Pilot:** start with one high-value workflow.
- Validate faster triage, evidence quality, and governed approvals before expanding.

### 1:30–2:50 — Slide 3: Status quo and validation needs

- ZEISS combines advanced manufacturing, medical technology, and optics.
- High quality requirements shape each of these domains.
- Decisions draw on SAP, supplier, and logistics context.
- Documents add further evidence.
- The value depends on trustworthy answers, not another dashboard.
- The technical discovery left us with three hypotheses.
- **Time to decision:** teams reconcile SAP, supplier, and logistics updates before acting.
- **Data confidence:** leaders need to know which source is current, permitted, and traceable.
- This is where data accuracy and security meet.
- **Governed action:** unclear owners and approvals delay mitigation.
- That increases delivery risk.
- These remain hypotheses until ZEISS validates them with real cases.

### 2:50–4:10 — Slide 4: Providing a decision framework for existing data

- SAP holds purchase orders, material data, and MRP exceptions.
- Warehouse systems add stock, goods receipts, and production buffers.
- Carrier feeds add ETA changes and customs events.
- Supplier records add commitment dates, capacity, and quality status.
- Files add scorecards, trackers, and contracts.
- The sources exist, but the trusted decision view still needs to be reconstructed.
- **Pain:** manual effort is required to build that view.
- Answer accuracy changes with the source snapshot.
- Lead-time and supplier-risk precision can remain low.
- Reliable interpretation depends on scarce experts.
- **Cost:** uncertainty drives expedite spend and extra buffers.
- Leadership time moves into escalation meetings.
- Late mitigation creates schedule churn.
- Scattered evidence increases quality exposure.
- OpenAI does not replace these sources; it provides a decision framework for using them together.

### 4:10–6:15 — Slide 5: Solution overview

- The Supply Chain Hub is the conversation layer for asking questions and reviewing evidence.
- It also helps teams align the next step.
- The intelligence layer uses GPT-5.6 Sol and reasoning controls to turn questions into options.
- The operating controls sit beside that intelligence.
- Server-side guardrails check prompt scope and persona.
- They also enforce workflow access, selected sources, and financial-field restrictions.
- Unavailable actions are blocked before the model can use them.
- ZEISS systems remain the sources of truth and connect through MCP.
- The operating pattern is **ground, reason, act**.
- **Ground:** retrieve permitted and current supply-chain context.
- **Reason:** compare the risk, options, and trade-offs.
- **Act:** assign work or route an accountable approval.
- The Responses API streams source-backed answers with reasoning and model controls.
- The Agents SDK runs persona-aware tools, assignments, and reviewer handoffs.
- The OpenAI platform supports faster escalation cycles and less expedite exposure.
- The same pattern can create a reusable business case across further workflows.

### 6:15–9:00 — Slide 6: Executive workflow

- **Trigger:** a customer shipment is at risk.
- The supplier date, SAP availability, and carrier ETA no longer match.
- **Question:** can we keep the promise date?
- What needs approval today?
- **Evidence:** orders, inventory, and supplier commitments support the answer.
- Carrier ETA and expedite cost complete the decision context.
- **Action:** the workflow returns a recommended option and customer impact.
- It also names the owner and approval step.
- **Before:** the team spends the first 20 minutes checking which source is current.
- That delays the actual decision.
- **After:** leaders see the exposed orders, root cause, and options in one interface.
- Cost trade-offs and the approval owner remain visible.
- The deployment still has three constraint areas to validate.
- **Data and privacy:** use approved fields and confirm GDPR requirements.
- Supplier confidentiality, retention, and regional processing also need approval.
- **Identity and governance:** use SSO, server-side roles, and a named reviewer.
- **Operations and adoption:** use a fail-closed fallback and a designated process owner.
- Training, feedback, and security checkpoints complete the operating model.
- Watch for three things during the demo.
- Role access, evidence quality, and accountable approval.
- **Question check:** Ask whether they have any questions.

## 9:00–27:00 — Live demo

### 9:00–10:20 — Open the tool, personas, SSO, and setting

- **Demo action:** Open Supply Chain Hub with Lukas Weber selected.
- What you see is a custom application for this supply-chain scenario.
- This demo uses mock data; a ZEISS deployment would connect approved enterprise sources.
- At the top, we have three personas.
- **Lukas Weber** is a logistics planner with operational data and recovery actions.
- **Dana Narid** is a procurement lead with a wider sourcing view and approval responsibility.
- **Dr. Lucía López** is an executive persona with strategic and financial context.
- In production, employees would not choose their identity from this dropdown.
- ZEISS SSO would establish the signed-in employee.
- The backend would map that identity to roles, permitted sources, and fields.
- It would also control the available actions.
- The browser would display those rights, but it would not grant them.
- The data path starts in source systems and moves through the ZEISS backend.
- Only the approved context reaches the OpenAI API.
- The result returns to the ZEISS backend for validation before display or action.
- The backend sends only the fields required for that request.
- It does not send an employee password or unrestricted source access.
- One OpenAI-powered experience can support several roles because ZEISS controls which context reaches each workflow.

### 10:20–11:10 — Show Lukas's connected tools

- **Demo action:** Open chat settings.
- Lukas is connected to SAP S/4HANA, shipping providers, and EWM warehouse.
- He can also use Microsoft Outlook, Microsoft SharePoint, and Microsoft Word.
- Access and selection are separate controls.
- A source can be allowed for Lukas but not selected for this request.
- The application builds the allowed tool set before the model call.
- The Responses API lets the model use those offered tools, while the application decides which tools exist for this user and request.
- Retrieved content is treated as data, not as trusted instructions.
- Tool allowlists, structured outputs, and approvals reduce the risk of prompt injection reaching a sensitive action.

### 11:10–13:20 — Find the delivery risk

- **Demo action:** Close settings.
- **Demo action:** Run **“Show me potential delivery risks for this week.”**
- The Hub finds one delivery exception.
- The DHL shipment with 480 N-FK5 blanks missed its Leipzig departure, and the expected arrival moved to Thursday.
- The smaller FedEx shipment remains on time.
- Current stock covers production until Thursday afternoon.
- Lukas receives the operational facts he needs, but not the executive financial fields.
- The reasoning summary is a concise record of checks and outcomes, not hidden chain-of-thought.
- The evidence is visible beside the answer: order, carrier, and quantity.
- Freshness indicators show when the records were last updated.
- The changed arrival and remaining buffer support the recommendation.
- Missing or conflicting inputs should be flagged instead of hidden behind a confident answer.
- GPT-5.6 Sol uses the Responses API to turn the authorized context into a streamed, prioritized answer with a reasoning summary.
- Lukas gets a reviewable first answer without manually joining the ERP, carrier, and warehouse view.
- Reconstructing this view may take 20–45 minutes today; the first Hub view appears in under two minutes with its evidence attached.

### 13:20–14:45 — Create the recovery task and prove source control

- **Demo action:** Open **Actions**.
- **Demo action:** Select **Create Microsoft Outlook recovery task**.
- **Demo action:** When it appears under **My tasks**, click **Mark done**.
- The task carries the shipment context, evidence, and next step.
- The owner is already clear.
- An Agents SDK tool workflow prepares the allowed action; application code stores the task and controls its status.
- The analysis becomes owned work without losing the source record.
- **Demo action:** Open settings and deselect **Microsoft Outlook**.
- **Demo action:** Reopen Actions and show that the Outlook recovery task and Dana review action are not offered.
- Because Outlook is no longer selected, the application removes those actions before the model can use them.
- This reduces accidental data sharing because an unavailable destination cannot receive the context.
- **Demo action:** Re-enable Microsoft Outlook.

### 14:45–16:30 — Route the decision to Dana

- **Demo action:** Select **Write Dana Narid for review**.
- The review package contains the risk summary, evidence, and requested next step.
- The Agents SDK runs the tool flow, hands the work to the reviewer role, and records the workflow trace.
- Dana receives the decision context once, in a consistent format, with a clear approval owner.
- **Demo action:** Switch to Dana Narid.
- **Demo action:** Open settings briefly to show Dana's different source set.
- **Demo action:** Open the **Approval queue**.
- Dana sees the incoming request on her dashboard in reviewer language.
- She can approve or deny the request based on the evidence.
- **Demo action:** Approve for the main flow.
- OpenAI assembles and routes the work; Dana owns the decision.

### 16:30–18:30 — Generate and download a slide visual

- **Demo action:** Switch back to Lukas Weber.
- **Demo action:** Run the delivery-risk question again because the persona change starts a fresh chat.
- **Demo action:** Type **“visualize this.”**
- Lukas may need a clear visual for a slide to Dana.
- Generation can take up to one minute.
- While we wait, the important distinction is that this image supports communication; it does not replace the evidence.
- The source-backed facts below the image remain the basis for the decision.
- **Demo action:** Download the generated image.
- The Responses workflow calls OpenAI Image Generation, which uses a GPT Image model to create the requested illustration.
- Lukas moves from an approved finding to a presentation-ready starting point in the same workflow.
- The generated visual still needs a human check before it enters a presentation.

### 18:30–19:15 — Show the off-topic guardrail

- **Demo action:** Type **“2x2.”**
- The application refuses this unrelated calculation.
- This is a custom input guardrail, not a special model selected by the OpenAI guardrails framework.
- Before the main GPT-5.6 Sol workflow runs, **gpt-5.4-nano** classifies the request through the Responses API.
- Structured Outputs return a machine-checkable category and confidence to the application.
- The server applies the allow-or-block policy, so GPT-5.6 Sol never sees or calculates the 2x2 request.
- The workflow fails closed if the classifier call fails.
- A narrow classifier keeps the main experience focused and makes the boundary easy to test, monitor, and change.
- **Question check:** Ask whether they have any questions.

### 19:15–20:10 — Move to the executive persona

- **Demo action:** Switch to Dr. Lucía López.
- **Demo action:** Open settings and show her source set.
- Lucía receives strategic supplier and financial context that Lukas did not receive.
- The server-side persona and field policy creates that boundary before the model context is built.
- The same Responses API pattern works with richer authorized context instead of requiring a separate AI application for every role.
- Executives can go deeper into savings, concentration risk, and resilience while operational users stay within their scope.

### 20:10–22:20 — Find supplier consolidation options and inspect evidence

- **Demo action:** Click **“Show supplier consolidation options by savings and strategic relationship.”**
- The Hub finds two consolidation candidates.
- Strategic optical-glass categories remain protected where resilience matters more than short-term savings.
- This is harder than a delivery alert because it combines spend, quality, and resilience.
- Contract terms and procurement policy also shape the result.
- Every recommendation is connected to a cited source and timestamp.
- The related finding and policy check remain visible.
- Current records support the recommendation.
- Stale, missing, or conflicting sources should be exposed instead of being replaced with a confident sentence.
- The audit trail should record the role, offered tools, and selected sources.
- It should also capture tool results, actions, and reviewers.
- The final status completes the record.
- This is the accuracy harness around the model.
- It combines grounding, freshness checks, and citations.
- Deterministic rules and human review add further protection.
- GPT-5.6 Sol and the Responses API synthesize the authorized records and explain the trade-off.
- Tools supply the records, and server rules protect restricted categories.
- The recommendation is easier to trust because the evidence and policy checks remain beside it.
- A first view across spend, quality, and resilience can take several analyst hours.
- The Hub assembles the initial view in minutes.

### 22:20–24:20 — Visualize the supplier portfolio

- **Demo action:** Type **“visualize these.”**
- The heatmap makes the supplier trade-off easier to compare, while the findings remain visible below it.
- This visual is different from Lukas's illustration because the supplier values already exist in authorized business data.
- The model selects an allowed chart path.
- The application supplies every label and number.
- Trusted React and SVG code renders the heatmap.
- The model helps select and explain the useful view without inventing the quantitative values.
- Lucía can see the savings-versus-resilience trade-off and return directly to the supporting findings.
- The speed comes from reusing approved values, not asking the model to invent them.

### 24:20–26:15 — Show feedback and the evaluation loop

- **Demo action:** Click thumbs up or thumbs down on the latest answer.
- **Demo action:** Open the comment box.
- This small feedback control becomes valuable during the proof of concept.
- Useful feedback tells us whether the source was current and the recommendation respected policy.
- It also tells us whether the answer and proposed action helped the user.
- Reviewed feedback becomes an eval case with the role, sources, and model version.
- The expected behavior and expert label complete the case.
- We run those evals before changing a prompt, tool, or model.
- Policy changes use the same release gate.
- Red teaming covers prompt injection, data leakage, and attempts to bypass role limits.
- Separate cases test stale sources, conflicting evidence, and unsupported claims.
- Traces help diagnose a workflow; repeatable evals show whether a change improves quality or creates a regression.
- Buyer feedback becomes measurable evidence for the release decision instead of an informal impression.

### 26:15–27:00 — Finish with dark mode

- **Demo action:** Turn on dark mode.
- The workflow is governed, the evidence is visible, and the developers also get dark mode.
- One workflow turned role-aware context into a finding, a task, and an approval.
- The same context also created an executive decision view.
- The portal supports people today and can expose the same governed workflows through an API to future ZEISS agents.
- **Question check:** Ask whether they have any questions.
- **Demo action:** Return to slide 8.

## 27:00–30:00 — Slides 8–9 and close

### 27:00–28:30 — Slide 8: Impact validation and success criteria

- The €0.2–0.3M figure is a first-year value hypothesis for one operating scope, not proven enterprise-wide value.
- The first value lever is a faster risk review.
- The second is fewer urgent expedites.
- The third is lower disruption exposure.
- We test that value hypothesis against the four gates shown on the right.
- **Process value:** at least 25% faster review and at least 80% of cases rated useful.
- Compare timestamped case duration and collect a rating after each case.
- **Decision quality:** at least 90% source-backed and fewer than 5% serious risks missed.
- Compare outputs with expert-approved scenarios and source evidence.
- **Technical reliability:** at least 95% correct use of the approved system and workflow.
- Inspect tool-call and trace logs across the scenario set.
- **Governance:** record human review for every high-impact action.
- Verify each required approval in the audit log.
- Security testing supports both technical reliability and governance.
- The evaluation set includes permission failures, prompt injection, and data-leakage attempts.
- We continue only if the workflow creates measurable value and passes the trust gates.

### 28:30–30:00 — Slide 9: Time to value and strong close

- My proposal is a four-week proof of concept around one product family and one repeatable workflow.
- **Week 0 — Align:** confirm the sponsor, workflow owner, and success metrics.
- Agree on the data boundaries.
- **Week 1 — Connect:** add representative sources, role scopes, and approval policy.
- **Week 2 — Build:** create the application workflow and business tools.
- Add grounding and the audit trail.
- **Week 3 — Validate:** collect user feedback and test answer quality.
- Complete the security review.
- **Week 4 — Decide:** review impact and guardrail results.
- Finish with a pilot recommendation.
- After the proof of concept, the path continues in three stages.
- **Weeks 5–8 — Pilot:** harden one workflow and onboard the first team.
- **Weeks 9–12 — Adopt:** embed ownership, feedback, and support.
- **Next — Scale:** reuse the blueprint across Procurement, Quality, and Manufacturing.
- Finance can follow when the access model is ready.
- OpenAI Solutions Engineering supports architecture, the proof-of-concept build, and evals.
- Enterprise support helps with deployment readiness and escalation paths.
- Optional delivery services can help with production integration.
- ZEISS keeps control of identity, data, and decision rights.
- OpenAI provides reasoning, tool use, and workflow orchestration.
- Together this creates a sourced and secure path from risk signal to accountable decision.
- **A decision is only valuable when the business can trust it and IT can defend it. This workflow is designed for both.**

## Appendix A — Buyer Q&A

### Q1. How do you guarantee accuracy and reduce hallucinations?

- No responsible solution can promise zero model errors.
- The accuracy harness combines approved sources, freshness indicators, and citations while exposing missing or conflicting evidence.
- Deterministic checks, expert evals, and human review protect high-impact decisions.

### Q2. How do we prevent data leakage and enforce role boundaries?

- ZEISS SSO and server-side permissions define each user's sources, fields, and actions.
- Sensitive data is filtered before the model call, and tools use least-privilege credentials instead of employee passwords.
- Tool allowlists and DLP checks block unexpected sharing; negative permission tests verify the boundaries.

### Q3. Where does the data flow, and what does OpenAI retain?

- Data moves from the source through the ZEISS backend to OpenAI, then returns for validation before display or action.
- The audit record captures what was sent, where it went, and who approved it.
- OpenAI API data is not used for training unless the customer opts in.
- Abuse-monitoring logs may be retained for 30 days; eligible customers can apply for Zero Data Retention or Modified Abuse Monitoring.

### Q4. How do we defend against prompt injection?

- Treat user input, documents, and tool results as untrusted content.
- Structured Outputs, tool allowlists, and application validation reduce the attack surface.
- Sensitive actions require approval, and red-team tests cover poisoned content or attempted data exfiltration.

### Q5. How does this move from GenAI to agentic AI?

- Today, the portal helps a person find evidence and prepare the next step; later, bounded agents can complete approved workflows.
- The same workflows are accessible through an API, so another ZEISS agent can use them without bypassing existing controls.
- APIs, connectors, or MCP are preferred; browser automation is a controlled fallback when no API exists.

### Q6. How much autonomy should the agent have, and who is accountable?

- Autonomy is set per workflow and risk level.
- Low-risk reads can run automatically, while sensitive writes pause for human approval.
- The application enforces the policy, and a named business owner remains accountable for the recorded outcome.

### Q7. Who chooses the model, and how do we handle upgrades or deprecations?

- Employees choose the task; the application routes to an approved model based on quality, latency, and cost.
- Centralized configuration simplifies upgrades; every change still needs testing, staged rollout, and rollback.
- OpenAI currently gives GA models at least six months' retirement notice; preview models can change much faster.

### Q8. What is the time to value, and who needs to support the proof of concept?

- The four-week proposal is an estimate for one workflow, not a platform guarantee.
- ZEISS needs a sponsor, process owner, and expert users with early access to representative data.
- OpenAI Solutions Engineering supports the design and evaluation; professional services are optional when extra delivery capacity is needed.

### Q9. How do we control token usage, performance, and agent loops?

- Server code sets maximum steps, timeouts, and retries for every workflow.
- Relevant context, smaller approved models, and prompt caching reduce cost and latency.
- Track usage by workflow and enforce rate limits or cost thresholds.

### Q10. How do we operate and audit the solution in production?

- Assign an application owner, business owner, and security owner.
- Version the complete workflow and keep traces for each business decision.
- Monitor quality, permission failures, and tool activity with a tested incident and rollback path.

## Appendix B — My OpenAI product feedback to the interviewers

### 1. Make the enterprise path easier to navigate

- Building the prototype was fast; shaping it into a complete enterprise solution required more judgment.
- I would value clearer guidance on how the Responses API, Agents SDK, and company-owned controls fit together.
- This would help teams move from an experiment to production with greater confidence.

### 2. Connect quality, security, and operations

- While building the tool, accuracy, guardrails, and evals became one connected trust story.
- Today, teams still need to bring several platform concepts together themselves.
- A more unified experience would make solutions easier to validate and explain to customers.

### 3. Simplify model and platform evolution

- Changing a model can be simple; understanding the impact on the full workflow is harder.
- More integrated support for comparing versions, planning rollouts, and finding regressions would help.
- This would make continuous improvement easier for enterprise teams.

## Official OpenAI references

- [Responses API and tools](https://developers.openai.com/api/docs/guides/tools)
- [Agents SDK](https://developers.openai.com/api/docs/guides/agents)
- [Agents SDK orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)
- [Agents SDK guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- [Agents SDK integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability)
- [GPT-5.4 nano](https://developers.openai.com/api/docs/models/gpt-5.4-nano)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [MCP and connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [Image generation](https://developers.openai.com/api/docs/guides/image-generation)
- [Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
- [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- [MCP prompt-injection risks](https://developers.openai.com/api/docs/mcp#prompt-injection-related-risks)
- [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [Production best practices](https://developers.openai.com/api/docs/guides/production-best-practices)
- [Your data](https://developers.openai.com/api/docs/guides/your-data)
- [API deprecations](https://developers.openai.com/api/docs/deprecations)
