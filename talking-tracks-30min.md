# Supply Chain Hub — Three 30-Minute Talking Tracks

## How to use this file

- Choose one version for the room. Do not mix versions during the live presentation.
- Keep audience answers short. Aim for 15–20 seconds per pause. If a discussion runs longer, shorten the next spoken block. Do not skip a demo action.
- Say clearly that the identities, records, source results, and external writes are mocked in this prototype.
- The manual time comparisons are working assumptions. Validate them with ZEISS during the proof of concept.
- Use Appendix A only when a buyer asks a question. Appendix B is preparation for a conversation with an OpenAI product manager.

## Timing contract

- 0:00–9:00 — slides 1–6
- 9:00–27:00 — demo; slide 7 is only the divider
- 27:00–30:00 — slides 8–9 and close
- The annex stack slide is available during Q&A. It is not part of the timed presentation.

## Version 1 — Consultative and balanced

Best for a mixed room with business, supply-chain, and IT leaders. This version gives both buyers equal space.

### 0:00–9:00 — Slides 1–6

#### 0:00–0:40 — Slide 1: Opening

Thank you for the time today.

I want to focus on one practical question. How can ZEISS move from scattered supply-chain signals to a trusted decision, without replacing the systems that already work?

The idea is simple. SAP, logistics systems, supplier inputs, and documents remain the sources of truth. OpenAI adds a decision layer above them. That layer helps people bring the facts together, understand the trade-offs, and move to the right next step.

Today I will show what that could feel like in one supply-chain workflow.

#### 0:40–1:40 — Slide 2: The idea in one minute

Here is the short version.

ZEISS does not need another dashboard that only shows more signals. The opportunity is one decision surface for the question, the evidence, and the next action.

The user asks a normal business question. The application brings in the context that person is allowed to use. An OpenAI model helps make sense of it. Then the workflow can prepare a task, a draft, or an approval request.

The key word is governed. The model is not the system of record. It does not get open access to everything. Identity, source access, and action rights stay under company control.

We would start with one workflow and prove that it saves time, improves the evidence, and keeps the right person in control.

#### 1:40–2:55 — Slide 3: Validate the pain

From the earlier discovery, I took away three working assumptions.

First, teams lose time before the real decision even starts. People compare SAP data, carrier updates, supplier messages, and spreadsheets just to agree on the current facts.

Second, trust drops when nobody can quickly see where an answer came from, how recent it is, and whether the user was allowed to see it.

Third, a good recommendation still creates little value if the owner and approval path are unclear.

These are hypotheses, not claims about every ZEISS team. That is why the first proof of concept should measure the current process before we automate anything.

**PAUSE 1 — both buyers, 15–20 seconds**

Would you say time to decision is the main pain here? Or is there another bottleneck you would put ahead of it?

Listen for the business pain and the technical cause. Reflect it back in one sentence, then continue.

#### 2:55–4:15 — Slide 4: Why the work is hard today

The problem is not missing data. The problem is that the decision context lives in different places.

A planner checks open orders and stock. Logistics checks carrier milestones. Procurement looks at supplier commitments and alternatives. Quality checks whether an alternate is approved. Leaders care about the customer promise and the cost of the response.

The same disruption looks different to every role.

Without a shared decision layer, one risk review can easily spend 20 to 45 minutes just rebuilding the picture. That is the first baseline I would test with ZEISS. The cost is not only those minutes. It is also late mitigation, extra meetings, expedite spend, and avoidable pressure on customer commitments.

This is where an OpenAI solution can help. It can bring allowed context together and turn it into a clear, reviewable starting point. People still make the decision. They simply start from a better place.

#### 4:15–6:20 — Slide 5: How the solution works

This is the proposed solution: Supply Chain Hub.

On the left is the user experience. People ask the question in their own words. They do not need to know which report contains each part of the answer.

In the middle is the OpenAI intelligence layer. The Responses API is the core model interface. It supports the conversation, reasoning controls, and tool use. In a production setup, tools or MCP connections can bring in approved context from systems such as SAP, Microsoft 365, carrier services, or internal data services.

The Agents SDK supports the action side. It helps developers build tool-driven steps, hand work to another role, and keep traces of the workflow.

Around that, the application applies company rules. It checks who the user is, which sources are selected, which fields are allowed, and which actions need a human review.

So the pattern is: ground, reason, act.

Ground means bring in the permitted facts. Reason means compare the risk and options. Act means prepare a safe next step. That might be a task, a draft, or an approval request. It does not mean giving the model unlimited authority.

For the technical buyer, this is a layer above existing systems. For the business buyer, it is a shorter path from signal to decision.

#### 6:20–8:40 — Slide 6: Make it real

Let us make that concrete.

A shipment is at risk. The purchase order says one date. The carrier has missed a milestone. The warehouse has a limited buffer. The first question is not “show me every table.” It is: can we protect production, and what needs to happen today?

Today, the first escalation call may start with people comparing screenshots and exports. With the Hub, the meeting can start with the exposed material, the latest evidence, the remaining buffer, and a proposed next step.

That is a meaningful change. The team spends less time finding the facts and more time challenging the recommendation.

There are also clear boundaries to validate. Which data fields can be used? Which actions may be drafted? Which actions need approval? What happens if a source is unavailable? And how do we prove that the application used the right source and route?

The demo will show those boundaries as well as the useful answer. Please watch for three things: different access by role, evidence beside the result, and the point where a human still owns the decision.

#### 8:40–9:00 — Slide 7: Demo handoff

Let us move into the prototype.

This is a working demo with mock identities and mock enterprise data. I will call out what the OpenAI platform does, what the application itself controls, and what would need a real ZEISS integration.

### 9:00–27:00 — Live demo

#### 9:00–10:20 — Open the tool and set the scene

**DO:** Open Supply Chain Hub. Keep Lukas Weber selected.

What you see is a custom application built for this supply-chain scenario. It is not a production ZEISS system. The people, records, connected-tool results, and external actions are mocked for the demo.

At the top, we have three personas.

Lukas Weber is the logistics planner. He needs operational facts and next steps, but he should not see sensitive financial data.

Dana Narid is the procurement team lead. She has a wider sourcing view and can review requests from Lukas.

Dr. Lucía López is the Chief Logistics Officer. Her view includes strategic and financial context.

In production, people would not choose an identity from this dropdown. ZEISS SSO would establish the signed-in user. The backend would map that identity to roles, source permissions, field access, and action rights. The browser would display those rights, but it would not be trusted to create them.

**OpenAI behind this:** OpenAI works inside the company-owned identity and authorization design. It does not replace SSO or decide who an employee is.

**Without the Hub:** Each role often builds a separate view and then reconciles it in a meeting. Here, the role shapes the experience from the start.

#### 10:20–11:10 — Show Lukas's connected tools

**DO:** Open chat settings. Point to Lukas's six sources: SAP S/4HANA, Shipping providers, EWM warehouse, Microsoft Outlook, Microsoft SharePoint, and Microsoft Word.

These are the sources available to Lukas in this scenario. The checkboxes also matter. A source can be allowed for his role but not selected for this request.

In a real setup, these entries would connect through approved APIs, custom tools, or MCP servers. Today they return mock records, so the demo stays predictable.

**OpenAI behind this:** The Responses API can work with tools. The application decides which tools are offered for this user and request.

**PAUSE 2 — technical buyer, 15 seconds**

For a first ZEISS workflow, which source or permission boundary would you want us to test first?

#### 11:10–13:25 — Run the delivery-risk question

**DO:** Close settings. Click or type: **“Show me potential delivery risks for this week.”**

The Hub finds one delivery exception. The DHL shipment with 480 N-FK5 blanks missed its Leipzig departure. The expected arrival moved to Thursday. The smaller FedEx shipment is still on time, and the current stock covers production until Thursday afternoon.

Notice what the answer does not show. Lukas gets the operational facts he needs. He does not get the financial fields reserved for the executive role.

Now point to the reasoning summary and the findings. The visible trace shows the checks in plain language: understand the request, apply access, retrieve evidence, compare the dates and stock, then prepare safe follow-up options. This is not hidden chain-of-thought. It is a short, useful summary of checks and outcomes.

The evidence is also specific. We can see the order, carrier, quantity, changed arrival date, and buffer. That gives Lukas something he can challenge and verify.

**OpenAI behind this:** With a live API key, the Responses API and the selected OpenAI model produce the streamed answer and visible reasoning summary from server-provided context. The demo also has a deterministic fallback, so the presentation does not depend on a live model call. In production, approved tools would provide the current records.

**Without the Hub:** Rebuilding this view across ERP, carrier, and warehouse screens may take 20–45 minutes. Here, the first view appears in under two minutes. That is a hypothesis to validate with ZEISS, not a proven saving yet.

#### 13:25–14:55 — Create a recovery task and show the source control

**DO:** Open **Actions**. Select **Create Microsoft Outlook recovery task**. When the task appears under **My tasks**, click **Mark done**.

The important point is not the button. The task carries the evidence and the owner into the next step. Lukas no longer needs to copy the shipment number, buffer, and cutoff into a separate note.

In this prototype, the task is stored in the application. A production version could write to Microsoft Outlook or another approved work system after ZEISS enables that connector and policy.

**OpenAI behind this:** The action workflow can use Agents SDK tools. The durable task state and the done button are application features. This separation is useful: the agent prepares the action, while the company application controls state and permission.

**Without the Hub:** Preparing and tracking the same follow-up may take another 5–10 minutes after the analysis. Here, it takes seconds because the context is already assembled.

**DO:** Open settings. Deselect **Microsoft Outlook**. Reopen Actions and show that the Outlook recovery task and Dana review action are no longer available. Then re-enable Outlook.

This is a simple but important control. If Outlook is not selected, an Outlook-based action is not offered. The model cannot talk its way around the missing source.

**OpenAI behind this:** The application filters tool and action eligibility before the request can run. The model only sees the allowed set.

#### 14:55–16:35 — Route a review to Dana

**DO:** In Actions, select **Write Dana Narid for review**.

The Hub prepares a review package with the request, the delivery-risk summary, the evidence, and the requested next step. It then routes the request to Dana.

**OpenAI behind this:** The Agents SDK supports the tool flow, the reviewer handoff, and the trace. The server still checks that Lukas is allowed to use this action and that Dana is the configured reviewer.

**Without the Hub:** A planner may spend 10–30 minutes writing the summary, finding the right reviewer, and explaining the context again. Here, routing takes under a minute. Dana's decision is not automated. Only the handoff is faster.

**DO:** Switch the demo identity to **Dana Narid**. Open settings briefly and point out that her sources are different. Then scroll to **Approval queue**.

Dana sees the request in her own dashboard. She sees reviewer language, not Lukas's sender language. She can approve or deny it.

**DO:** Choose **Approve** for the main flow. Mention that **Deny** is equally valid when the evidence is weak or the action is not justified.

This is the human-in-the-loop moment. OpenAI helps assemble and route the work. Dana stays accountable for the decision.

#### 16:35–18:25 — Generate and download a slide visual

**DO:** Switch back to **Lukas Weber**. Because changing persona starts a fresh chat, run **“Show me potential delivery risks for this week.”** once more. Then type **“visualize this.”**

Lukas may need to brief Dana or use the risk in a slide deck. Instead of starting from a blank page, he can ask for a visual in the same conversation.

With a live image call, generation can take up to a minute. Use that time to explain the difference between an illustration and evidence. The image helps communication. It does not replace the source-backed findings below it.

When the visual appears, point to **Download**. Lukas can save it and use it in a draft slide for Dana.

**OpenAI behind this:** The application exposes OpenAI image generation as a tool when an illustration is requested and no trusted data chart is the better answer. If no live API key is available, the app creates a labeled deterministic SVG preview instead.

**Without the Hub:** A simple slide visual may take 15–30 minutes to brief, create, and format. Here, a live version can be ready in up to a minute. It still needs a human check before it goes into a presentation.

#### 18:25–19:10 — Show the off-topic guardrail

**DO:** Type **“2x2”**.

The Hub refuses the request because this application is meant for supply-chain work, not general calculations.

This is not a magic model feature working alone. The app has a server-side scope policy. It first catches obvious unrelated requests. With a live API key, a small OpenAI model also classifies the request through the Responses API and returns a structured decision. If that live check fails, the policy fails closed.

**OpenAI behind this:** A small model and structured output help classify intent. The company-owned server policy decides what happens next.

The business value is focus and cost control. The technical value is a clear boundary that can be tested.

#### 19:10–20:20 — Move to the executive persona

**DO:** Switch to **Dr. Lucía López**. Open settings and point to her source set.

Lucía sees a different experience. She has access to executive supplier portfolio data, including financial and strategic context that Lukas cannot see.

The model is not deciding that Lucía is senior enough. The server-side persona policy controls the workflow and fields. The model receives the context that remains after those checks.

**OpenAI behind this:** The Responses API works with the authorized context it is given. Identity, role mapping, field filtering, and source rights stay in the application and ZEISS control layer.

This lets the same OpenAI platform support several roles without giving every role the same answer.

#### 20:20–22:25 — Run supplier consolidation and inspect the evidence

**DO:** Click **“Show supplier consolidation options by savings and strategic relationship.”**

The Hub finds two consolidation candidates. It protects optical glass and other strategic categories where resilience matters more than a short-term saving.

This is a more complex decision than a delivery alert. It brings together spend, contracts, quality, resilience, and procurement policy. Lucía can see the financial opportunity because her role allows it.

Now point to the evidence and findings. Each recommendation needs a source, a time, and a clear policy check. In production, the answer should show the source record, its freshness, and the retrieval time. If a source is stale, missing, or conflicting, the system should say so rather than fill the gap with a confident sentence.

Citations do not guarantee truth. They make the answer inspectable. Accuracy comes from current source systems, good retrieval, clear rules, evaluation, and human review working together.

The audit trail should answer practical questions: which sources were available, which were used, what action was offered, who approved it, and what changed afterward?

**OpenAI behind this:** The Responses API and model help combine the authorized context and explain the trade-off. Tools provide the records. Application rules protect categories and action rights. The Agents SDK can trace later action workflows.

**Without the Hub:** A first-pass view across spend, contracts, quality, and resilience can take several analyst hours. Here, the initial evidence-backed view is assembled in minutes. The final supplier decision still needs expert review.

#### 22:25–24:20 — Visualize the portfolio

**DO:** Type **“visualize these.”** Point to the supplier heat map and then the findings table.

This visual is different from the slide illustration we created for Lukas. These numbers already exist in authorized supplier data. The application therefore uses a trusted chart instead of asking an image model to invent a picture of the data.

The chart makes the trade-off clear. High savings alone are not enough. A strong strategic relationship, scarce capacity, or a dual-source rule can protect a supplier from consolidation.

The findings remain below the chart so Lucía can move from the visual back to the source-backed recommendation.

**OpenAI behind this:** The model can choose an allowed rendering tool. The application supplies every label and number. OpenAI helps select and explain the view; it does not generate the quantitative values.

That is an important trust pattern: generate language where language helps, but render known numbers from known data.

#### 24:20–26:15 — Show feedback and connect it to the proof of concept

**DO:** Click the thumbs-up or thumbs-down control on the latest answer. Open the comment box and show the feedback flow.

This looks small, but it matters during a proof of concept.

A thumbs-up tells us the answer helped. A thumbs-down plus a comment tells us why it failed. Maybe the source was old. Maybe the recommendation missed a policy. Maybe the wording was right but the action was not useful.

The current demo keeps this feedback in the application session. A production pilot should store it with the role, workflow, sources, model version, and expected answer. The team can then turn repeated feedback into a regression set and test the next prompt or model change against it.

**OpenAI behind this:** OpenAI models produce the answer, but the evaluation loop is a product and operating process around the model. Feedback, test cases, and review criteria make improvement measurable.

For the business buyer, this shows whether people find the workflow useful. For the technical buyer, it creates evidence for quality and release decisions.

#### 26:15–27:00 — End the demo with dark mode

**DO:** Toggle dark mode.

And finally, dark mode. The developers in the room can now relax.

Joking aside, this is also a reminder that adoption matters. The OpenAI platform can be powerful, but people still need an application that fits how they work.

Let us return to the proof we would want before scaling.

### 27:00–30:00 — Slides 8–9 and close

#### 27:00–28:35 — Slide 8: Prove value and trust

The demo is not the business case. The proof of concept creates the business case.

We would start with one workflow and baseline the current time, number of handoffs, evidence quality, and approval path. Then we run the same cases through the Hub.

The working value range on this slide is narrow on purpose. It combines faster review, fewer urgent expedites, and lower disruption exposure for one workflow. ZEISS would validate the real volumes, costs, and attribution.

The four gates matter equally.

Process value asks whether review is at least 25 percent faster and useful to the users. Decision quality checks whether answers use trusted evidence and whether serious risks are missed. Technical reliability checks whether the right system and workflow were used. Governance checks that every high-impact action reached a human reviewer.

**PAUSE 3 — solution/economic buyer, 15–20 seconds**

Which one of these results would make the proof of concept worth scaling for you?

#### 28:35–30:00 — Slide 9: Time to value and strong close

The path is designed to be practical.

Week zero aligns the sponsor, workflow owner, measures, and data boundary. Week one connects representative sources and role rules. Week two builds the workflow and evidence trail. Week three tests it with users and difficult cases. Week four gives ZEISS an impact readout and a clear decision.

OpenAI can support the architecture, build, and evaluation work. ZEISS brings the process owner, source owners, security input, and the users who know what a good answer looks like.

My recommendation is simple: choose one painful workflow, name one owner, agree on the evidence boundary, and decide what success means before we build.

If we agree on those four things, we can test one clear question: can OpenAI help ZEISS move from a risk signal to a trusted, governed action faster?

## Version 2 — Economic-value-led

Best when the solution or economic buyer leads the room. This version keeps the technology clear, but always brings the story back to time, risk, adoption, and return.

### 0:00–9:00 — Slides 1–6

#### 0:00–0:40 — Slide 1: Opening

Thank you for making the time.

I want to start with the cost of delay. Not only a late shipment, but the delay between seeing a signal and making a trusted decision.

When teams spend the first part of an escalation rebuilding the facts, the business loses time twice. People do manual work, and the response starts later.

Today I will show how OpenAI can shorten that path while keeping ZEISS people in control.

#### 0:40–1:40 — Slide 2: The value idea

The idea is not to replace SAP or another source system. It is to make the information in those systems easier to use at the moment a decision is needed.

One interface brings together the question, the approved context, the recommendation, and the next step.

That creates value in three places.

Planners spend less time collecting data. Leaders get a faster, clearer view of the trade-off. And actions reach the right owner without another round of copying and explaining.

OpenAI provides the intelligence and agent building blocks. ZEISS keeps the data, rules, and accountability.

We prove the value with one repeatable workflow before we talk about scale.

#### 1:40–2:55 — Slide 3: Start from measurable pain

My working assumption is that the biggest opportunity is not one spectacular AI answer. It is removing small delays from a workflow that happens again and again.

Take delivery-risk triage. A planner checks the order, the carrier, the warehouse, and perhaps a spreadsheet or email. Then someone turns that into an escalation. A team lead asks where the number came from. The explanation starts again.

That pattern is measurable. We can count the minutes, the handoffs, the urgent expedites, and the decisions delayed by missing evidence.

We should also measure trust. A fast answer that nobody uses has no economic value.

**PAUSE 1 — solution/economic buyer, 15–20 seconds**

Where does this delay cost you most today: planner time, expedite spend, production disruption, or leadership attention?

Use the answer later when you present the proof-of-concept scorecard.

#### 2:55–4:15 — Slide 4: The hidden cost of reconstruction

The data already exists. The cost sits in the gaps between systems and teams.

One person checks SAP. Another checks the carrier. Someone else knows the supplier history. A spreadsheet holds the latest exception note. The business question waits while those pieces come together.

A single risk review may take 20–45 minutes before the team has one trusted picture. Multiply that by the number of weekly reviews and escalations, and the manual work becomes meaningful.

There is also risk exposure. A late decision can trigger a more expensive expedite, more schedule churn, or a missed customer promise.

OpenAI can reduce the reconstruction work. It can also make the evidence easier to challenge, which helps people decide earlier.

The proof of concept should establish the real ZEISS baseline. We should not build the business case from a demo estimate.

#### 4:15–6:20 — Slide 5: The OpenAI portfolio in the workflow

Supply Chain Hub uses two main OpenAI building blocks.

The Responses API supports the conversational experience. It gives the application a model interface with reasoning controls and tools. That is how a normal business question can become an answer built from approved context.

The Agents SDK supports the action flow. It helps developers build tool steps, route work to another role, and trace what happened.

In production, approved APIs or MCP servers can connect the workflow to systems ZEISS already uses. OpenAI does not become the master-data platform. It works with the systems of record.

The company application adds the controls. It knows the signed-in user, the selected sources, and the actions that need review.

From a value point of view, this matters because the same platform pattern can support more than one workflow. The first workflow proves value. The next one reuses the identity, tool, approval, and evaluation pattern.

#### 6:20–8:40 — Slide 6: What changes in the room

Imagine a customer shipment is at risk.

Without the Hub, the first meeting may focus on whose date is current. With the Hub, the meeting starts with the delayed material, the evidence, the remaining buffer, the options, and the owner.

The team can still disagree. In fact, they should challenge important recommendations. The difference is that they are challenging one visible case, not searching for the case while the clock is running.

That can reduce planner work, shorten escalation meetings, and bring mitigation forward.

The value does not come from replacing a person. It comes from removing avoidable steps around that person.

During the demo, I will show five possible value points: faster triage, quicker task creation, quicker approval routing, faster communication material, and faster first-pass portfolio analysis.

I will also show where the Hub says no. That matters because uncontrolled use creates cost and risk instead of value.

#### 8:40–9:00 — Slide 7: Demo handoff

Let us look at the prototype.

The data and external actions are mocked. I will use them to show the operating pattern and the OpenAI products behind it. The real proof would use a narrow set of ZEISS sources and measured cases.

### 9:00–27:00 — Live demo

#### 9:00–10:20 — Open the tool and introduce the roles

**DO:** Open Supply Chain Hub with **Lukas Weber** selected.

This is a custom supply-chain application. The identities, records, source results, and writes to other systems are mock data.

Lukas is a logistics planner. Dana Narid is the procurement team lead. Dr. Lucía López is the Chief Logistics Officer.

Each person needs a different level of detail. Lukas needs the operational exception. Dana needs the review and sourcing context. Lucía needs the strategic and financial view.

In production, ZEISS SSO would sign the person in. The backend would apply their role and permissions. People would not select their own identity from a demo menu.

**OpenAI behind this:** The model works after identity and access checks. ZEISS keeps control of identity, data, and action policy.

**Without the Hub:** The three roles may create three separate views and then spend time aligning them. Here, the view starts with the role.

#### 10:20–11:10 — Show the sources available to Lukas

**DO:** Open settings and show the six sources available to Lukas.

Lukas can use SAP, carrier, warehouse, Outlook, SharePoint, and Word context in this scenario. A source must be both allowed and selected.

These are mock connectors today. In production, ZEISS would approve the API, tool, or MCP path for each system.

**OpenAI behind this:** The Responses API can use tools. The application offers only the tools allowed for this role and workflow.

For the business buyer, this prevents a useful workflow from becoming an open-ended data project. We connect only what the first use case needs.

#### 11:10–13:25 — Find the delivery risk

**DO:** Run **“Show me potential delivery risks for this week.”**

The result is direct. One DHL delivery with 480 N-FK5 blanks missed a milestone. It is now expected on Thursday. A smaller FedEx shipment is on time. Stock covers production until Thursday afternoon.

Lukas gets the facts he needs, but not the executive financial impact.

The visible reasoning summary shows the key checks. The findings show the order, quantity, date, and buffer. This gives the planner a useful answer and gives the reviewer something concrete to inspect.

**OpenAI behind this:** With a live key, the Responses API and selected model turn server-provided context into the streamed answer. The prototype also has a deterministic fallback for presentation reliability.

**Without the Hub:** This first view may take 20–45 minutes to reconstruct manually. In the demo it appears in under two minutes. The pilot should measure the true difference.

**PAUSE 2 — both buyers, 15 seconds**

If we could remove only one manual step from this review, which step would create the most value?

#### 13:25–14:55 — Turn the answer into a task

**DO:** Open Actions. Select **Create Microsoft Outlook recovery task**. Mark the new task done.

The task is created from the context already on screen. Lukas does not have to write the shipment number, receiving cutoff, and backup status again.

This demo stores the task inside the Hub. A production setup could write to Outlook after ZEISS approves the connector and action policy.

**OpenAI behind this:** Agents SDK tools can prepare and run the allowed action flow. Application code owns the durable task and its status.

**Without the Hub:** A manual follow-up may add 5–10 minutes. Here, it takes seconds after the analysis is ready.

**DO:** Deselect **Microsoft Outlook** in settings. Show that the Outlook task and Dana review action disappear. Re-enable Outlook.

This protects value as well as security. The workflow does not waste time offering an action that cannot be completed.

#### 14:55–16:35 — Route the decision to Dana

**DO:** Select **Write Dana Narid for review**.

The Hub prepares the summary and evidence, then routes it to the configured reviewer.

**OpenAI behind this:** The Agents SDK supports the tool flow, handoff, and trace. The application checks the action, source, and reviewer rights.

**Without the Hub:** Writing the package and finding the right reviewer may take 10–30 minutes. Routing now takes under a minute. Dana's judgment still takes the time it needs.

**DO:** Switch to **Dana Narid**. Point to her different sources and open her **Approval queue**. Choose **Approve**. Mention that she can also deny.

This is the economic point: we automate the preparation and routing, not the accountability. A faster bad decision is not value. Dana remains the decision owner.

#### 16:35–18:25 — Create a communication asset

**DO:** Return to **Lukas Weber**. Re-run the risk prompt because the persona switch clears the chat. Then type **“visualize this.”**

Lukas may need a simple visual for Dana's slide deck. The application can generate one in the conversation and make it available to download.

A live image may take up to a minute. When it appears, show **Download**.

The visual helps Lukas communicate faster. It is an illustration, not a replacement for the evidence. A human should check it before use.

**OpenAI behind this:** OpenAI image generation is available as a tool for an explicit illustration request. Without a live key, the demo shows a labeled deterministic preview.

**Without the Hub:** A basic visual can take 15–30 minutes to brief and format. Here, it can be ready in up to a minute.

#### 18:25–19:10 — Show the cost and scope boundary

**DO:** Type **“2x2.”**

The Hub blocks the unrelated request.

That helps keep the tool focused. It also reduces unnecessary token use. The application has a server-side scope rule, an obvious-request check, and, with a live key, a small OpenAI model that returns a structured classification through the Responses API. If that check is unavailable, the app fails closed.

**OpenAI behind this:** OpenAI helps classify the request. The application policy decides what is allowed.

This is one example of how cost control starts in the workflow design, not only in a monthly bill report.

#### 19:10–20:20 — Show the executive view

**DO:** Switch to **Dr. Lucía López** and show her available sources.

Lucía gets a wider view because her role allows strategic and financial information. Lukas could not see those fields.

**OpenAI behind this:** The Responses API receives the context left after server-side role and field checks. The model does not grant access.

One platform can therefore support different users without building a separate AI product for each role.

#### 20:20–22:25 — Find supplier consolidation options

**DO:** Click **“Show supplier consolidation options by savings and strategic relationship.”**

The Hub identifies two candidates and protects strategic categories such as optical glass.

This is where the value moves beyond planner time. The workflow can bring together spend opportunity and resilience risk in one view.

Point to the evidence and audit trail. A recommendation should show the source, freshness, policy check, and role. If sources disagree or are stale, the answer should say so.

Citations make the recommendation inspectable. They do not make it automatically true. The team still needs good source data, evaluation, and review.

**OpenAI behind this:** The Responses API and model explain the trade-off from authorized records. Tools supply those records. Application rules protect sensitive fields and categories.

**Without the Hub:** A first-pass portfolio review can take several analyst hours. The Hub can assemble an initial view in minutes. Final validation and negotiation still belong to the team.

#### 22:25–24:20 — Turn the result into a heat map

**DO:** Type **“visualize these.”** Show the heat map and findings.

This time, the data already exists. So the application renders a trusted chart rather than asking an image model to draw the numbers.

Savings are only one dimension. The chart also shows strategic relationships and helps protect resilience.

**OpenAI behind this:** The model can select the allowed chart tool and explain the result. The application supplies the labels and values.

For the economic buyer, this makes the decision easier to discuss. For the technical buyer, it keeps the quantitative source clear.

#### 24:20–26:15 — Capture user feedback

**DO:** Open thumbs-up or thumbs-down and the comment box.

The proof of concept needs more than a polished demo. We need to know whether target users find the answer useful, and why they reject it when they do not.

The current feedback is session-based. In a pilot, it should be stored with the case, role, sources, model version, and expected result. That gives the team a growing regression set.

**OpenAI behind this:** The model creates the answer. The feedback and evaluation process tells us whether the answer creates value and whether a change improves it.

This supports two key measures on the next slide: user usefulness and decision quality.

#### 26:15–27:00 — Finish with dark mode

**DO:** Turn on dark mode.

And yes, dark mode is included. That may be the fastest adoption win for the developers.

More seriously, the experience has to feel usable. A technically strong workflow that people avoid will not produce the value we just discussed.

### 27:00–30:00 — Slides 8–9 and close

#### 27:00–28:35 — Slide 8: Build a real business case

The value range on this slide is a hypothesis for one workflow. It is not an enterprise-wide ZEISS claim.

We would measure three levers: time saved in risk reviews, urgent expedites avoided, and disruption exposure reduced through earlier action.

We also need four proof gates. Is the process faster? Are the answers source-backed and useful? Does the workflow use the right systems reliably? Do high-impact actions always reach a human reviewer?

If one of those gates fails, we learn before scale.

**PAUSE 3 — solution/economic buyer, 15–20 seconds**

Which measure would your sponsor need to see after four weeks to defend the next investment?

#### 28:35–30:00 — Slide 9: Make the next step small and clear

The first step is a four-week proof of concept around one workflow.

ZEISS would provide a business owner, a small set of representative data, a technical owner for the sources and identity, security input, and a few users who can judge the output.

OpenAI can support the solution design, build, and evaluation approach. Professional services can help if ZEISS wants more delivery capacity, but the first step does not need a large transformation team.

At the end of week four, we decide based on evidence: scale it, adjust it, or stop it.

The next step is not a large transformation. It is one measured workflow that shows whether faster, better-grounded decisions create enough value to scale.

## Version 3 — Technical-trust-led

Best when IT, security, or enterprise architecture leads the room. This version explains the controls clearly without turning the presentation into a product manual.

### 0:00–9:00 — Slides 1–6

#### 0:00–0:40 — Slide 1: Opening

Thank you for the time today.

I want to show a practical way to add OpenAI to an enterprise workflow without moving the systems of record or weakening existing control.

Supply Chain Hub sits above the current landscape. It brings approved context into one decision flow. The model helps explain and compare. The application keeps control of identity, data access, tools, and actions.

The question for today is not only “can it answer?” It is “can we trust how it got there?”

#### 0:40–1:40 — Slide 2: The architecture in one view

The front end is a custom decision interface. It is not ChatGPT replacing an ERP system.

The backend provides the user's role, the allowed source context, the available tools, and the action policy. The OpenAI model works inside that boundary.

The Responses API is the core interface for model responses and tool use. The Agents SDK supports more structured action flows, handoffs, and traces.

ZEISS systems remain the source of truth. The Hub should retrieve only what the current user and workflow need.

That gives us a simple design rule: permissions first, model second, human review before sensitive action.

#### 1:40–2:55 — Slide 3: Define trust before the pilot

There are three things I would validate early.

First, identity and access. Which ZEISS identity groups map to which business roles, sources, fields, and actions?

Second, evidence quality. What counts as a trusted source? How fresh must it be? What happens when two sources disagree?

Third, action boundaries. Which actions may run directly, which may only create a draft, and which always need a named reviewer?

Those choices should live in server-side policy and test cases. They should not depend on a prompt asking the model to behave.

**PAUSE 1 — technical buyer, 15–20 seconds**

Which boundary would you want to prove first: identity, source access, or approval control?

Use the answer to emphasize the matching demo step.

#### 2:55–4:15 — Slide 4: Why integration alone is not enough

The data sits across ERP, warehouse, carriers, suppliers, documents, and policy.

Connecting those systems is necessary, but it is not enough. The workflow also needs to know which record is current, which fields are sensitive, and which source owns each fact.

Without that, the model can produce a clear answer from the wrong context.

The Hub therefore needs a small, explicit context for each request. A logistics planner should not receive financial exposure. A tool should disappear when its source is unavailable. A sensitive action should fail if its approval route is missing.

This design also reduces unnecessary context and token use. We do not send everything to the model and hope it sorts out the boundary.

#### 4:15–6:20 — Slide 5: Split the responsibilities

I would describe the architecture in four parts.

The application owns identity, policy, durable state, and the user experience.

The Responses API provides the model interface. It supports the conversation, reasoning settings, and tools. The backend chooses the model and the tools for the request.

The Agents SDK provides a higher-level way to build agent workflows. In this prototype it supports action tools, handoffs to reviewer agents, and traces.

APIs, connectors, or MCP servers provide controlled access to external systems. For private or on-premises services, the integration path must match the customer's network and security design.

These parts are useful together, but the boundaries matter. The Responses API does not provide ZEISS authorization. The Agents SDK does not replace durable business state. A model does not make a source accurate. Those controls stay in the surrounding system.

That is also why the solution can evolve. The company can change a model or connector without redesigning the whole user workflow, provided the contracts and evaluations still pass.

#### 6:20–8:40 — Slide 6: The workflow and its failure modes

The example is a customer shipment at risk.

The request needs order data, carrier status, and warehouse stock. The answer should show the exception and buffer. Then it may offer a task or review action.

Now consider the failure modes.

If carrier data is unavailable, the answer should say the evidence is incomplete. If Outlook is not selected, the Outlook action should not exist. If the user lacks financial access, those fields should never enter the model context. If an approval service is unavailable, the sensitive action should not run.

The system also needs traces and evaluations. We should be able to test that the correct tool ran, the forbidden field stayed out, the evidence was cited, and the approval was recorded.

That is the technical promise I want the demo to show: useful model behavior inside controls we can inspect and test.

#### 8:40–9:00 — Slide 7: Demo handoff

Let us move to the application.

The identities, source results, and external writes are mocked. I will be precise about what runs in the prototype, what uses OpenAI, and what a production ZEISS integration would still need.

### 9:00–27:00 — Live demo

#### 9:00–10:20 — Start with identity and role policy

**DO:** Open Supply Chain Hub with **Lukas Weber** selected.

The dropdown is a demo control. It is not the production identity design.

In production, ZEISS SSO would authenticate the user. The server would map that identity to a role. The role would control allowed workflows, sources, fields, and actions.

Lukas is a logistics planner. Dana Narid is the procurement team lead. Dr. Lucía López is the Chief Logistics Officer.

The records and external-system behavior are mock data. That gives us a stable demo. It does not prove a live SAP, Microsoft, carrier, or ZEISS connection.

**OpenAI behind this:** OpenAI consumes the authorized context after the server checks. It does not authenticate the person or grant their role.

**Without the Hub:** Each application may expose its own view and access model. The Hub gives the user one workflow while still respecting the source systems.

#### 10:20–11:10 — Inspect the tool boundary

**DO:** Open settings and show Lukas's six sources.

These are tool-like source entries for SAP, carriers, warehouse data, Outlook, SharePoint, and Word. In production, each would need an approved API, custom function, connector, or MCP server.

The source can be allowed for the role and still not selected for the current request. This is useful for data minimization and predictable tool behavior.

**OpenAI behind this:** The Responses API supports tool use. The application builds the allowed tool set before the model call.

The model cannot call a tool that was never offered.

#### 11:10–13:25 — Run the grounded risk flow

**DO:** Run **“Show me potential delivery risks for this week.”**

The answer finds a missed DHL milestone for 480 N-FK5 blanks. It compares that with the FedEx backup and the production buffer.

Point to the visible reasoning summary. It describes the checks and outcomes. It is not the model's hidden chain-of-thought.

Point to the findings. The answer is tied to the order, carrier, quantity, date, and stock buffer. Lukas does not see financial fields because his server-side policy removes them.

**OpenAI behind this:** With a live key, the chat route uses the Responses API with the selected model, reasoning effort, and server-built context. The app has a deterministic fallback when no live key is present. The source records in this demo are mock records in application data.

**Without the Hub:** A user may spend 20–45 minutes moving among screens. The demo assembles the first view in under two minutes. We would validate both time and answer quality in the pilot.

**PAUSE 2 — technical buyer, 15 seconds**

What evidence would your audit or security team need beside this answer before they trusted the workflow?

#### 13:25–14:55 — Test source-dependent action eligibility

**DO:** Open Actions. Select **Create Microsoft Outlook recovery task**. Mark the task done.

The task uses evidence already in the workflow. In this prototype it is durable only in client application state. A production system should store it in an approved business system and handle retries, idempotency, and failure clearly.

**OpenAI behind this:** An Agents SDK tool flow can prepare the action. Application code owns task persistence and status.

**Without the Hub:** The manual step may add 5–10 minutes and another chance to copy the wrong identifier.

**DO:** Deselect **Microsoft Outlook**. Show that the Outlook recovery task and Dana review action disappear. Re-enable Outlook.

The control is enforced by the application context. It is not a sentence in the prompt. If a required source is missing, the action is not eligible.

**OpenAI behind this:** The model receives only the remaining allowed actions. This is safer and easier to test than asking the model to remember every permission rule.

#### 14:55–16:35 — Test a reviewer handoff

**DO:** Select **Write Dana Narid for review**.

The workflow builds a review package and identifies Dana as the reviewer.

**OpenAI behind this:** The Agents SDK supports the action tools, handoff, and trace. The API route first verifies the persona, workflow, selected source, and action label. The application owns the approval record and status.

**Without the Hub:** Manual preparation and routing may take 10–30 minutes. The Hub routes it in under a minute, but does not shorten the time Dana needs for a responsible decision.

**DO:** Switch to **Dana Narid**. Show her different source set and her **Approval queue**. Choose **Approve**, and point out **Deny**.

Dana sees the incoming label written for a reviewer. She can accept or reject. The request status is visible to both sides.

This is the control point. The agent can prepare and route. The accountable person decides.

#### 16:35–18:25 — Compare image generation with deterministic fallback

**DO:** Return to **Lukas Weber**. Re-run the delivery-risk prompt because the persona switch clears chat state. Type **“visualize this.”**

With a live key, the application offers the OpenAI image-generation tool. The image can take up to a minute. The response arrives as a downloadable WebP.

Without a live key, the app returns a labeled deterministic SVG preview. That keeps the demo stable and prevents us from pretending a generated image was created when it was not.

When the visual appears, show **Download**.

**OpenAI behind this:** Image generation is exposed only for an explicit illustration request when a trusted chart is not the better option.

**Without the Hub:** A simple presentation illustration may take 15–30 minutes. The live tool can reduce that to about a minute, followed by a human content check.

The image is communication material. It is not evidence and should not be cited as data.

#### 18:25–19:10 — Test the scope guardrail

**DO:** Type **“2x2.”**

The request is blocked as unrelated to the application.

The path has more than one layer. An application check catches obvious off-topic patterns. With a live key, a small model classifies the recent conversation through the Responses API and returns a structured category and confidence. The server applies the policy. If the classifier call fails, the workflow fails closed.

**OpenAI behind this:** A model and structured output support classification. The server owns the allow-or-block rule.

This is not a full safety architecture, but it is a clear, testable boundary for this workflow.

#### 19:10–20:20 — Verify executive field access

**DO:** Switch to **Dr. Lucía López** and open settings.

Lucía's policy allows only the executive consolidation workflow and its source set. It also allows financial fields.

Lukas did not receive those fields. They were filtered before model context was built.

**OpenAI behind this:** The model works with the authorized context it receives. Server-side role and field policy is the security boundary.

In a production design, that role should come from ZEISS identity groups and should be verified on every server request.

#### 20:20–22:25 — Run the strategic workflow and inspect provenance

**DO:** Click **“Show supplier consolidation options by savings and strategic relationship.”**

The answer combines spend, contract, quality, resilience, and policy context. It identifies two candidates and protects strategic categories.

Point to the visible evidence and analysis steps.

For production, every retrieved record should carry source identity, retrieval time, and useful freshness metadata. The UI should show when records disagree or when a required source is missing.

Citations are not a truth guarantee. They provide provenance. We still need source-quality checks, deterministic business rules, benchmark cases, and human review.

The audit trail should capture the role, offered tools, selected sources, tool results, model and prompt version, action, reviewer, and final status. Sensitive logging needs its own retention and privacy design.

**OpenAI behind this:** The Responses API and model synthesize and explain. Tools retrieve. Application policy filters and validates. Agents SDK traces can cover action runs.

**Without the Hub:** A cross-system first pass may take several analyst hours. The Hub can make it minutes, but the quality gate remains with the business.

#### 22:25–24:20 — Show chart-first visualization

**DO:** Type **“visualize these.”** Show the heat map and findings.

The app detects that authorized quantitative data is available. It uses a trusted chart tool rather than image generation.

The tool input does not accept arbitrary chart numbers from the model. The server supplies the supplier records. The model selects an allowed view and explains why it helps.

**OpenAI behind this:** Tool selection and explanation come from the model flow. Data values and rendering come from application code.

This reduces the risk of a visually convincing chart with invented numbers.

#### 24:20–26:15 — Turn feedback into regression evidence

**DO:** Open the thumbs-up or thumbs-down flow and comment box.

The current control stores feedback only in the browser session. For a production proof of concept, feedback should be persisted with the full case metadata.

A negative rating should become a reviewed failure case. The team can label the expected behavior, add it to a regression set, and run it before a prompt, tool, or model change is released.

**OpenAI behind this:** The model is one changing component. The evaluation harness, dataset, review rule, and release gate sit around it.

This is how feedback becomes more useful than a satisfaction score. It becomes technical evidence for improvement.

#### 26:15–27:00 — Close the demo in dark mode

**DO:** Toggle dark mode.

Dark mode is the final feature. It is also the least controversial control we have shown.

The more important point is that the OpenAI layer is wrapped in a normal product: identity, settings, sources, actions, feedback, tests, and a deployable runtime.

Now let us define how we would validate that whole system.

### 27:00–30:00 — Slides 8–9 and close

#### 27:00–28:35 — Slide 8: Technical and business gates

The proof of concept needs both value gates and engineering gates.

Process value measures the actual review time and user usefulness. Decision quality compares answers with expert-reviewed cases and source evidence. Technical reliability checks the selected system, tool path, and trace. Governance verifies every required human approval.

I would add boundary tests for the technical work: forbidden fields never enter context, unavailable tools cannot run, stale sources are visible, and sensitive actions fail closed.

**PAUSE 3 — both buyers, 15–20 seconds**

Which technical result and which business result would you need before approving a pilot?

#### 28:35–30:00 — Slide 9: A controlled next step

The four-week path keeps the scope small.

Week zero defines the owner, identity mapping, source boundary, approval policy, and measures. Week one connects representative data. Week two builds the workflow and tests the negative paths. Week three runs user and security validation. Week four produces a value and control readout.

ZEISS would need a process owner, source-system owner, identity or security contact, and a small expert user group. OpenAI can support the architecture, model workflow, and evaluation approach.

My proposed next step is a joint architecture and evaluation workshop. We choose one workflow and leave with the data contract, role policy, action boundary, and test scorecard.

If the architecture, evidence, and approval controls hold up in one real workflow, ZEISS has a safe pattern it can reuse.

## Appendix A — Questions buyers may ask

### 1. What does “agentic AI” mean here? Do agents log into our portals?

**Likely buyer:** Both

**Short answer:** An agent has instructions, guardrails, and tools it can use to complete a task. The preferred setup is not a robot signing into a portal like a person. It uses approved APIs, connectors, or MCP servers with a controlled identity and limited permissions.

**If they ask deeper:** The Responses API can call tools, and the Agents SDK helps build the tool and handoff flow. ZEISS decides which tools exist, which user or service identity they use, and whether approval is required. If a legacy portal has no usable API, browser automation may be possible, but it adds risk and maintenance. I would treat that as an exception, not the default. The tools shown in this prototype are mocked; they are not live ZEISS connections.

**Bridge back:** In the proof of concept, we would choose one or two real sources and agree on the safest integration path for each.

### 2. Should employees choose the model and reasoning effort themselves?

**Likely buyer:** Technical buyer

**Short answer:** Usually not for a governed production workflow. The company should set tested defaults and limits by use case. Most users should choose the business task, not the model.

**If they ask deeper:** Model and reasoning choices affect quality, speed, and cost. A simple lookup may use a faster model and lower effort. A complex supplier trade-off may need a stronger model or more reasoning. The current demo exposes these settings so we can show and test them. In production, I would use server-side routing and admin policy. Advanced users may get controlled choices, but only from an approved set.

**Bridge back:** The proof of concept can test two or three approved configurations and choose the lowest-cost option that still meets the quality gate.

### 3. Do we need to rebuild everything when a new model comes out? Who owns the upgrade?

**Likely buyer:** Both

**Short answer:** No, the application should not need a rebuild. Changing the model name may be one line. A safe production upgrade is more than one line, though. The application owner must run the evaluation set, check tools and structured outputs, compare speed and cost, and keep a rollback path.

**If they ask deeper:** The team that maintains the application owns the release. Codex can help find every model reference, update the code, adjust prompts when needed, run tests, and review the diff. It makes the engineering work much faster. It does not replace the release decision. I would test the new model on representative and difficult cases, compare it with the current model, then roll it out in stages. A stable API boundary keeps the change local, but model behavior can still change.

**Bridge back:** The feedback and benchmark cases collected in the proof of concept become the regression set for future upgrades.

### 4. How do you control hallucinations or unsupported recommendations?

**Likely buyer:** Both

**Short answer:** We cannot promise that a model will never make a mistake. We can make mistakes less likely, visible, and unable to trigger a sensitive action without review.

**If they ask deeper:** The model should work from approved source data and tools, not memory alone. Answers should show evidence and freshness. Important calculations or policy checks should be deterministic. Structured outputs help validate format. Server-side permissions keep sensitive data and tools out of scope. Benchmark tests measure failure rates. High-impact actions go to a named human. Citations help a reviewer inspect an answer, but a citation by itself does not guarantee that the conclusion is correct.

**Bridge back:** Our proof-of-concept scorecard includes source-backed answers, serious risks missed, correct tool use, and 100 percent human review for high-impact actions.

### 5. What happens when OpenAI deprecates a model or feature?

**Likely buyer:** Technical buyer

**Short answer:** Treat model and feature lifecycle like any other managed dependency. Monitor notices, keep configuration centralized, maintain regression tests, and migrate before the shutdown date.

**If they ask deeper:** OpenAI's current policy gives at least six months' notice for generally available model retirements. Specialized variants get at least three months, unless safety or compliance requires faster action. Preview features can have much shorter notice, sometimes around two weeks. I would not use a preview model for a business-critical workflow unless ZEISS can move quickly. The maintainer should track email and documentation notices, test the recommended replacement, run a staged rollout, and keep rollback ready. The same discipline applies to endpoints and platform features.

**Bridge back:** A small, reusable evaluation set and one central model registry make future migrations routine instead of emergency projects.

### 6. What is the time to value? Do we need professional services, and how many people do we need?

**Likely buyer:** Solution/economic buyer

**Short answer:** A focused proof of concept can produce a decision in about four weeks if the workflow and data boundary are narrow. It does not need a large ZEISS team. Professional services are optional and depend on integration complexity and available capacity.

**If they ask deeper:** I would ask Anna's organization for one sponsor, one process owner, two or three expert users, one source-system owner, and one identity or security contact. Most can contribute part-time. OpenAI Solutions Engineering can support architecture, model workflow, and evaluation. Professional services can add delivery capacity when there are several systems, custom connectors, or a tight production deadline. A hardened pilot may take another four to eight weeks after the proof of concept, depending on security and integration work.

**Bridge back:** Week zero should confirm the people, sources, measures, and approval boundary. That is what makes the four-week plan credible.

### 7. How do we control tokens, latency, and spend? Can an agent run forever?

**Likely buyer:** Both

**Short answer:** The server controls the loop. We set model and reasoning policy, limit output and tool turns, send only relevant context, apply rate and spend limits, and monitor usage. Users do not get an unlimited autonomous loop.

**If they ask deeper:** Cost control starts with workflow design. Use a faster model for simple work and a stronger model only where it adds value. Keep source context narrow. Cap generated output. Limit tool steps and retries. Cache stable prompt content where useful. Set separate projects and spend limits for test and production. Track usage by workflow and alert on abnormal patterns. In this prototype, the chat stops after a small number of steps, and action agents have a fixed maximum number of turns. The off-topic guardrail also prevents the app from becoming a general-purpose token sink.

**Bridge back:** The proof of concept should report cost and latency per completed case alongside the time saved and answer quality.

### 8. How would ZEISS SSO, privacy, retention, and source permissions work?

**Likely buyer:** Technical buyer

**Short answer:** ZEISS SSO authenticates the user. The server maps that identity to roles, fields, sources, and actions. API credentials stay on the server. The exact OpenAI retention, residency, and privacy setup must match the contracted product and ZEISS policy.

**If they ask deeper:** The browser should never be trusted to claim a role. Every request should be checked on the server. Tool calls should use a delegated or service identity with least privilege. Sensitive fields should be filtered before model context is built. Logs need their own access and retention rules. For OpenAI data handling, I would verify the current enterprise terms and available controls with the security team rather than answer from memory. We also need to decide what is stored by ZEISS: chat history, retrieved passages, traces, approvals, and feedback may have different retention needs.

**Bridge back:** The first architecture workshop should produce an identity map, data-flow diagram, field boundary, retention decision, and approval matrix for one workflow.

### 9. Can the agent execute actions on its own, and who is accountable if something goes wrong?

**Likely buyer:** Both

**Short answer:** An agent can execute the tools the company gives it. That does not mean every action should be autonomous. For this use case, high-impact actions stay behind a named human approval. The business owner remains accountable.

**If they ask deeper:** Low-risk, reversible actions may run automatically after testing. Examples might be creating a personal follow-up or preparing a draft. Supplier termination, purchase commitments, external messages, and material financial decisions should require review. The server enforces the action policy. The audit trail records the request, tools, result, reviewer, and final status. If a tool fails, the application should show failure and avoid pretending the action succeeded.

**Bridge back:** During the proof of concept, we will classify every action as allowed, draft-only, approval-required, or blocked.

### 10. How will we know the proof of concept worked?

**Likely buyer:** Solution/economic buyer

**Short answer:** We agree on the baseline before we start. Then we measure process speed, answer quality, technical reliability, user usefulness, cost, and human-review compliance.

**If they ask deeper:** For process value, compare case timestamps and manual effort. For decision quality, review answers against expert-approved cases and source evidence. For technical reliability, check the tool and trace logs. For adoption, collect user ratings and reasons. For governance, verify that every required approval is in the audit trail. For economics, separate hard time savings from avoided-risk estimates and record the attribution assumptions. The initial targets are at least 25 percent faster review, 80 percent useful, and 90 percent source-backed. We also target less than 5 percent serious risks missed, 95 percent correct workflow use, and human review for every high-impact action.

**Bridge back:** At the end of week four, those measures support a clear choice: scale, adjust, or stop.

## Appendix B — Product feedback for OpenAI

These points come from preparing this presentation and building the prototype. They are generic product observations, not ZEISS requirements or roadmap expectations.

### 1. Make product boundaries easier to explain

**What I found difficult:** One answer can involve a model, the Responses API, the Agents SDK, a provider SDK, custom tools, permissions, and UI code. It was hard to explain which OpenAI product did what without using too many technical words.

**What would help:** A simple, official attribution map for common enterprise patterns. It could show what belongs to the model, Responses API, Agents SDK, connectors or MCP, and the customer application.

### 2. Add a durable human-approval building block

**What I found difficult:** The Agents SDK makes tools and handoffs clear. I still had to build approval records, pending states, reviewer controls, recipient wording, retries, and persistence in the application.

**What would help:** A first-class durable approval object with an owner, reviewer, status, expiry, reason, audit events, and storage hooks. It should work across sessions and business systems.

### 3. Make traces useful to business reviewers

**What I found difficult:** Technical traces help developers. A buyer wants a simpler answer. Which source was used? How fresh was it? Which policy ran? Who approved the action?

**What would help:** A business-readable trace view or schema. It should make source identity, freshness, policy decisions, tool results, and human approvals easy to show in an audit panel.

### 4. Provide clearer enterprise policy patterns for models and reasoning

**What I found difficult:** The demo can expose model and reasoning choices, but that is not the right production experience for most employees. I had to explain how an administrator would restrict those choices by workflow.

**What would help:** Documented policy patterns for model routing, reasoning limits, user overrides, and approved fallbacks. An admin should be able to say which workflows may use which models and at what cost level.

### 5. Make model upgrades easier to prove

**What I found difficult:** Changing the model identifier is easy. Proving that prompts, tools, structured outputs, latency, and costs still behave well is the real work.

**What would help:** An upgrade-compatibility report that can run the same cases against two models and compare answer quality, tool calls, schemas, latency, and estimated cost. Codex could then propose the code and prompt changes from that evidence.

### 6. Unify per-workflow cost and latency controls

**What I found difficult:** Cost is spread across model choice, reasoning effort, input size, output length, tool loops, retries, and image generation. The controls and reporting live in several places.

**What would help:** One per-workflow budget policy with limits for tokens, reasoning, turns, tools, time, and cost. It should show an estimate before a run and actual usage afterward.

### 7. Shorten the path from feedback to regression tests

**What I found difficult:** Adding thumbs and comments was easy. Turning that feedback into reviewed cases, expected results, and a release gate required much more application work.

**What would help:** A standard feedback-to-evaluation flow. A reviewer could promote a bad response into a test case, label the expected behavior, and run it automatically against a new prompt or model.

### 8. Separate generated images from trusted data visuals more clearly

**What I found difficult:** For the presentation, I needed both a creative slide illustration and a data-faithful heat map. It was easy for the audience to assume both came from the same generation process.

**What would help:** Stronger platform patterns for chart-first routing and visible provenance labels. Generated illustrations, deterministic charts, and source-backed quantitative visuals should be clearly different in the tool result and UI.

## Official OpenAI references for follow-up

- [Building agents](https://developers.openai.com/tracks/building-agents)
- [Using tools with the OpenAI API](https://developers.openai.com/api/docs/guides/tools)
- [MCP and connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [Image generation](https://developers.openai.com/api/docs/guides/image-generation)
- [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
- [Production best practices and cost controls](https://developers.openai.com/api/docs/guides/production-best-practices)
- [API deprecations](https://developers.openai.com/api/docs/deprecations)
