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
- We use an accuracy harness around the model.
- Approved systems provide the facts, and every important claim links to a cited source.
- Source-freshness indicators show when each record was updated.
- Missing or conflicting evidence is shown instead of hidden.
- Deterministic tools handle calculations and policy checks.
- Structured Outputs enforce the expected schema, but schema compliance alone does not prove factual accuracy.
- Human review protects high-impact decisions.
- Expert-labelled evals test unsupported claims, stale sources, and missed risks before every release.
- Official reference: [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) and [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

### Q2. How do we prevent data leakage and enforce role boundaries?

- ZEISS SSO authenticates the employee.
- Server-side RBAC or ABAC maps that identity to sources, fields, and actions.
- Sensitive fields are filtered before the model context is built.
- Tools use least-privilege OAuth or service credentials.
- A model receives a narrow tool interface, not the underlying employee password.
- Tool allowlists limit which destinations can receive data.
- Server rules validate every sensitive action before execution.
- DLP or redaction checks can block protected content before model or tool calls.
- Negative permission tests confirm that each role cannot access restricted data.

### Q3. Where does the data flow, and what does OpenAI retain?

- The path starts in a source system and moves through the ZEISS backend.
- Only the approved context reaches the OpenAI API.
- The result returns to the ZEISS backend for validation before display or action.
- The ZEISS backend selects only the fields needed for the request.
- OpenAI returns the model result or tool request to the application.
- The application validates it before showing data or calling another system.
- The audit record should capture the source, fields, and destination.
- It should also capture the actor and approval.
- OpenAI API data is not used to train models unless the customer explicitly opts in.
- Abuse-monitoring logs may be retained for up to 30 days by default.
- Eligible customers can apply for Zero Data Retention or Modified Abuse Monitoring.
- Third-party tools keep their own retention and residency policies.
- ZEISS security should approve the complete data-flow diagram before production.
- Official reference: [Your data](https://developers.openai.com/api/docs/guides/your-data).

### Q4. How do we defend against prompt injection?

- Treat user input, emails, and documents as untrusted content.
- Tool results are also untrusted content.
- Never place untrusted text inside a higher-priority developer instruction.
- Structured Outputs restrict what can move between workflow steps.
- Tool allowlists prevent the model from discovering unrestricted actions.
- Sensitive reads and writes require approval.
- Validate tool arguments and outputs in application code.
- Red-team direct prompts, poisoned documents, and cross-tool data-exfiltration attempts.
- Guardrails reduce risk, but they do not remove it completely.
- Official reference: [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety) and [MCP prompt-injection risks](https://developers.openai.com/api/docs/mcp#prompt-injection-related-risks).

### Q5. How does this move from GenAI to agentic AI?

- Today, the portal helps a person find evidence and prepare the next step.
- The next stage lets bounded agents call approved tools and complete several steps.
- The portal can expose the same governed workflows through an API.
- Another ZEISS agent could request a risk check without bypassing the existing controls.
- The preferred integration is an API, connector, or MCP server with least privilege.
- Agents do not need an employee password or unrestricted portal session.
- Browser automation is a fallback when no API exists and needs stronger approval.
- The same evidence, permission, and audit harness supports both stages.
- Official reference: [Using tools](https://developers.openai.com/api/docs/guides/tools) and [MCP and connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp).

### Q6. How much autonomy should the agent have, and who is accountable?

- Autonomy is set per workflow and risk level.
- Low-risk reads can run automatically after authorization and validation.
- A model can prepare a task without receiving authority to approve it.
- Sensitive writes should pause for human approval.
- The application enforces the policy; the prompt does not enforce it alone.
- A named business owner remains accountable for the final decision.
- Record the evidence, policy result, and reviewer.
- The final outcome completes the record.
- The Agents SDK supports guardrails and resumable approval flows.
- Official reference: [Agents SDK guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals).

### Q7. Who chooses the model, and how do we handle upgrades or deprecations?

- In production, employees should usually choose the task, not the model or reasoning effort.
- The application should route to an approved model based on eval results, latency, and cost.
- Centralized configuration can make the code change as small as one line.
- The real upgrade work is proving that behavior remains safe and useful.
- Compare answer quality, tool choice, and schema compliance.
- Also compare latency, token use, and approval behavior.
- Roll out gradually and keep a tested rollback path.
- OpenAI documents deprecations and notifies active customers.
- OpenAI currently gives GA models at least six months' retirement notice, barring faster safety or compliance needs.
- Specialized variants currently receive at least three months under the same condition.
- Preview models can have much shorter notice, so critical workflows need a faster migration path.
- Codex can prepare the code change and tests; the application owner approves the release.
- Official reference: [API deprecations](https://developers.openai.com/api/docs/deprecations) and [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices).

### Q8. What is the time to value, and who needs to support the proof of concept?

- The four-week proposal is an estimate for one workflow, not a platform guarantee.
- ZEISS needs one sponsor, one process owner, and two or three expert users.
- A source-system owner and an identity or security contact complete the core team.
- Most contributors can work part-time once scope and data access are agreed.
- OpenAI Solutions Engineering can support architecture, workflow design, and evals.
- Professional services are optional when integration capacity or production hardening needs extra delivery support.
- Early access to representative data is usually the biggest schedule dependency.
- Week four should gate on accuracy, security, and measurable business value.

### Q9. How do we control token usage, performance, and agent loops?

- Keep limits in server code, not in the prompt alone.
- Set maximum steps, timeouts, and retries for every workflow.
- Send only relevant context and cap the output size.
- Route simple tasks to smaller approved models.
- Use prompt caching where stable content repeats.
- Track tokens, latency, and failures by project and workflow.
- Configure rate limits, usage alerts, and workflow cost thresholds.
- Traces should expose repeated tool calls or stalled loops.
- Red-team long-running requests and indirect prompt injection.
- Official reference: [Production best practices](https://developers.openai.com/api/docs/guides/production-best-practices).

### Q10. How do we operate and audit the solution in production?

- Assign an application owner, business owner, and security owner.
- Version the model, prompt, and tools together.
- Keep the policy version in the same release record.
- Traces explain each run; audit records capture the business decision.
- Run the approved eval set before every release.
- Monitor accuracy, permission failures, and unusual tool activity.
- Define an incident path to disable a tool, revoke credentials, or roll back.
- Review retention rules and role mappings on a fixed schedule.
- Use feedback to create new eval cases, not only a satisfaction score.
- Move from pilot to production only when quality and security thresholds stay stable.

## Appendix B — My OpenAI product feedback to the interviewers

### 1. Provide runnable enterprise control patterns

- The model call was not the difficult part of this preparation.
- The harder part was joining identity, role-based tools, and approvals into one safe path.
- Tracing and evals then had to fit the same design.
- I would value maintained starter repositories for the Responses API and Agents SDK.
- One pattern could map SSO claims to a role-scoped tool registry and approval flow.
- It should include trace redaction, retention choices, and release gates.
- This would turn enterprise guidance into working code without presenting one architecture as universal.

### 2. Add an exportable data-flow and policy view

- Traces help developers understand execution, but security reviewers ask a different set of questions.
- They need to see which source and fields went to OpenAI or an external tool.
- They also need the actor, destination, and approval.
- The retention rule completes the security view.
- I would value an automatically generated data-flow view for each workflow.
- It could compare actual runs with the declared policy and flag unexpected paths.
- An exportable report would make security review and incident analysis much easier.

### 3. Make evidence quality a reusable platform pattern

- I had to define source IDs, freshness, and citations inside the application.
- Conflict handling needed another custom pattern.
- Structured Outputs guarantee the shape of a response, not whether the evidence supports it.
- I would value a standard evidence object for the Responses API and Agents SDK.
- It could carry source, timestamp, and claim in a consistent format.
- A confidence field could complete that object.
- Built-in graders could test citation validity, freshness, and unsupported claims.
- Showing those results in traces and evals would make accuracy easier to operate across enterprise use cases.

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
