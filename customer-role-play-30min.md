# 30-Minute Customer Role Play

Role: OpenAI Solutions Engineer  
Audience: CTO and Head of Innovation  
Context: Follow-up after last week's discovery call  
Goal: Validate pain, scope a first workflow, show the prototype, agree proof-of-value next steps

## 0:00-2:00 Opening

- Are you waiting on any members from your team to join or are we ready to kick off the meeting? 
- Ciaran, thanks again for our phone call last week that provided initial information on where you're currently at, nevertheless, I'd suggest we start with a short round of introductions. At OpenAI , the customer always comes first, so I'd hand over to you. 
- Thank you, as quick intro from my side, I'm Lucie, Solutions Engineer with OpenAI, I joined the company 2 years ago. Thanks to both of you for taking the time, it's great meeting you. 
- Ciaran, I used our conversation from last week as base to shape this follow-up. 

- So, what I took away is that ZEISS does not really lack supply-chain data. The challenge is rather turning fragmented data all over the place into decisions quickly enough. Did I get that correctly from our prior phone call?

< WAIT ON ANSWER >

- My idea for today's call was validating my assumptions from our prior convo, Ciaran, then showing you a prototype of how OpenAI's solution portfolio  could support a first workflow, and finally align on success criteria for a potential proof of value and next steps. I'll start sharing my screen (share screen)

- --> CLICK Share slide 01 <--- 

- But before we dive in, does that match your expectations for today's call? 

< WAIT ON ANSWER >

- Also, please feel free to interrupt or ask questions at any point while I'm talking. 

## 2:00-4:00 Executive Framing And ROI Hypothesis

- --> CLICK / Share slide 02 <--- 

- The idea is that OpenAI would add a decision layer on top of your systems of record (i.e. SAP, supplier tools, etc.) 
- You ask a question, retrieve context, reason across trade-offs, and route the next step.
- The overall ROI hypothesis is faster time from a disruption signal to a trusted decision. 

- The pain we're basically looking at is when a shipment or supplier issue escalates, the first meeting is often about reconstructing facts and bringing everyone on board -> different systems get checked, versions need to be aligned => causes expensive delays, not solely operational but common strategic risks such as loosing customer confidence
- In quality-sensitive manufacturing, the team also cannot simply pick the fastest alternative. They need to know whether an alternate is approved, whether incoming inspection is required, whether a deviation is needed, and who owns the review.

Customer interaction:

- Would you say that time to decision is a real pain pattern for you, or would you describe the bottleneck differently?

- --> CLICK / Share slide 03 <--- 

## 4:00-8:00 Interactive Discovery Validation

- took away three key assumptions from our prior conversation
- want to validate them with you before diving further into my proposed solution approach.

Assumtion 1 is that in other complex manufacturing environments, delivery-risk triage and supplier exception handling are often good first candidates for disruption management because they are recurring, time-sensitive, and measurable. Would that match your reality, or would you pick something different? 

Assumption 2 is that handoffs from procurement to logistics, supplier quality to production planning, or escalation into leadership can create the most friction. Am I missing something here? 

Assumption 3 is more about governance: Which recommendations would need explicit evidence before someone acts, e.g. expedite spend, alternate sourcing, supplier or end-customer communication?

- As priorly stated, my working assumption for a first workflow has been delivery-risk triage or supplier exception handling => because these are recurring issues that we also see with other customers in complex manufacturing environments.

- --> CLICK / Share slide 06 <--- 

## 8:00-10:00 Solution Proposal and Technical Architecture

- This is the proposed solution - Supply Chain Hub
- Communication interface where teams ask their relevant business questions.
- "The architecture is ground, reason, act."
- "Ground: retrieve approved context from SAP, logistics, supplier systems, documents, or policies."
- "Reason: compare risk, options, trade-offs, and constraints."
- "Act: prepare a recommendation, draft, task, or approval request."
- Based on OpenAI intelligence layer, it retrieves approved context from SAP, other supplier systems, documents, or policies while having role-based access in mind
- You can use MCP servers to connect into your existing infrastructure (Microsoft, SAP, Salesforce) or use API integrations where no connectors exist. Or build own API connectors with OpenAI Codex.
- How the solution works with the OpenAI Responses API and Agents SDK: 
- The OpenAI response API combines a stateful endpoint for the model, model reasoning, and web search, but also tool usage such as code execution, connecting to external systems in one API  
- The OpenAI Agents SDK provides a framework for building agentic applications. It wraps the model and tool loop and provides agents, handoffs, human-in-the-loop flows, and MCP integration

--> PAUSE FOR QUESTIONS <---

- I'd now like to show the usage of the OpenAI solution portfolio tailored to the discussed use case in a demo.

- ---> [Switch to Supply Chain Hub tool] <-----

## 12:00-22:00 Demo

### Demo Part 1: Risk Radar / CLICK FLOW 

[Tool: Risk Radar / Logistics Planner]

- "I'll start with the operational view."
- The Persona is logistics planner, so this user should not see any strategic or executive information.
- "Selected tools are SAP, carrier data, and warehouse context."
- "The question is: is there a delivery risk this week for the N-FK5 optical glass blanks?"
- "I chose optical glass intentionally because for a company like ZEISS, qualified materials are not interchangeable commodities. A late part can become a production, quality, and customer-commitment issue at the same time."

- The important thing is that the Supply Chain hub does not only write a nice answer, it connects role, source, evidence, and next action in one place. => this is the Response API in action with reasoning, interaction with integrated MCPs, all handled by the Responses API. It knows to which MCP server it's connected to and knows based on the questions which tools to connect to. If I only query a shipping information, it will automatically go to the shipping provider tool. If I ask a combination of things, i.e. delivery status of a shipment plus current stock levels, it also automatically knows to call the shipping provider MCP + the SAP MCP, e.g. 
- For a planner, the value is knowing which exception matters and also why it matters and what evidence supports it, and what can still be done based on that. That is where the Agents SDK gets in place: it can automatically trigger actions based on the evidence and reasoning provided by the Response API.

- => Let's assume Supply Chain Hub saves 20 minutes per escalation, the business case becomes concrete.
=> This is where I would measure manual effort reduction, thinking about how long does it currently take to reconstruct this view across SAP, carrier data, and warehouse stock?

Customer questions during demo:
- "Is there a source missing from this connected-tools list?"
- "What action would be acceptable here: draft email, task creation, SAP note, or no write-back at all?"

Using the AgentsSDK you can easily build a human-in-the-loop workflow where an employee can submit a request for approval to his or her supervisor to approve or deny certain requests. 

What we can also see here is that the procurement lead Dana as access to more tools based on her role permissions.

Dana can approve, Lukas sees that in his record 

### Demo Part 2: Executive Supplier Portfolio

[Tool: Executive Supplier Portfolio / Chief Logistics Officer]

- Now I'll switch to a more sensitive executive workflow. This is a common manufacturing trade-off: procurement wants to reduce complexity and capture savings, while operations and quality need resilience, qualification, and continuity.

- OpenAI helps accelerate the decision, but accountable humans still own high-impact action, the tool itself could not terminate a supplier contract. Lucia Lopez would see that as a draft in her outlook. The system can identify consolidation candidates, but it also protects strategic categories.
In manufacturing, supplier consolidation can look attractive in spend analytics but become risky when there is limited qualified capacity, specialized tooling, regional concentration, or long requalification cycles. So the ROI model must include avoided risk, not just cost reduction."

What interests me is your perspective on what you've seen so far: 
E.g. 
- What would make you trust or reject a certain recommendation?
- Who owns the final decision? Would procurement or legal need to provide additional approval? 

MAYBE Customer question:

- If we had to choose one first pilot, would delivery risk or supplier alternatives be closer to a real pain point?

## 22:00-26:00 Success Criteria And ROI

- --> CLICK / Share slide 09 <--- 

- Success criteria should validate that the workflow is usable and trusted.
- For manufacturing, I would separate hard savings from risk avoidance. Hard savings are things such as planner hours, while risk avoidance may be a better customer-promise protection, or fewer late mitigation decisions.

Suggested success criteria:

- 25% faster weekly risk-review cycle.
- 90% of answers cite trusted sources and assumptions.
- 80% of target users rate outputs useful.
- 100% of high-impact actions route to accountable review.

These come with suggested ROI measures:

- Manual effort saved.
- Better mitigation options identified earlier.
- Reduced leadership escalation time.
- Fewer decisions delayed by source reconciliation.
- Earlier identification of qualified alternates before the shortage becomes critical.

Customer interaction:

- "Which of these would matter most to you?"
- "What would you need to see after four weeks to defend the business case internally?"

## 26:00-30:00 Closing And Next Step

- --> CLICK / Share slide 11 <--- 

- My recommendation is a controlled proof of value.
- Choosing one workflow where fragmented context is costing ZEISS time today which is top of mind for you with a named business owner, clear approval boundaries and measureable success criteria.
- We can then measure workflow improvement prove whether OpenAI can help the team move from signal to evidence-backed, governed action faster.and decide where to scale, because, if it works, the blueprint can expand on other departments such as quality, finance, and R&D.
 
- That is the pattern I would expect to work best in complex enterprise manufacturing: start with a painful, measurable workflow; keep the data boundary narrow; prove trust; then scale the blueprint.

Final customer question:

- Which workflow woud you prefer to start? Also, let's already block some times in our calendar for the next steps.

## If You Do Not Know The Answer

RepsonesAPI - what is it? 
low-level API , model reasoning and tool calling, connect to external systems 

AgentsSDK - what is it? 
higher-level API, built on top of Responses API, provides a more user-friendly interface for building agents

Technical unknown:

- "I do not want to guess on that. I would validate the current product capability with our specialist team and come back with the exact integration path."

Security unknown:

- "For a security question, I would rather be precise than fast. I would confirm the current OpenAI control, the customer-side requirement, and the recommended architecture before answering definitively."

Connector unknown:

- "I know the pattern we would use, but I would want to verify whether there is an existing connector, a partner path, or whether we should treat this as a custom MCP/API integration."

Product roadmap unknown:

- "I cannot speak for roadmap commitments in this setting. What I can do is separate what is available today from what we would design as a customer-side architecture."

Use of agent:

- "I can also check this with my technical agent after the session and send a precise follow-up with source links, because I do not want to rely on memory for a platform detail."

Implementation estimate:

- "I would need to scope the source systems, identity model, approval requirements, and data freshness needs before giving a credible estimate."
