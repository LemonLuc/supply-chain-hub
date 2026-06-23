# Supply Chain Hub Slidev Demo Script

Executive Business Value

**0:00-0:45 - Model Overview, Camera Visible**

Hello, I am Lucie, an OpenAI Solutions Engineer, and I am delighted to present Supply Chain Hub, a Logistics solution built for Carl Zeiss AG.

Supply Chain Hub is for leaders, logistics planners, and procurement teams who need one trusted view of operational risk. The pain is thatone disruption is often split across several databases, files, tools, and team inboxes. Before teams can act, they first have to reconstruct what is true, which costs time, creates conflicting interpretations, and delays the moment where someone can make a confident decision.

This model shows the operating idea: a conversation layer for asking and reviewing evidence, an intelligence layer that turns questions into options, operating controls for roles and review paths, and ZEISS systems as sources of truth.

I will show one workflow: from a delivery-risk question, to evidence, to action. The full onsite demo goes much deeper, but this should make the business purpose clear.

**0:45-5:15 - Live Tool, Camera Hidden**

Here we are in the Supply Chain Hub tool, set at ZEISS Oberkochen HQ. At the top, the demo identity shows we are currently acting as Lukas Weber, a Logistics Planner. The same tool can also be shown through a Procurement Team Lead or Chief Logistics Officer persona, which is important because each role sees different workflows, permissions, and decision rights.

I start with the recommendations at the top. They show what the tool represents: proactive shortcuts into work that matters right now. It can point the user to the DHL tracking delay for the N-FK5 shipment, the Oberkochen receiving buffer, or the purchase order promised date before the user even starts searching.

Next I open settings. A new user can configure tools: SAP for purchase orders and material data, shipping providers for DHL and FedEx milestones, EWM warehouse for stock, and Outlook for follow-up actions. I keep SAP, carrier data, and warehouse stock selected, and enable Outlook because I want the workflow to move from analysis into controlled follow-up. The model does not get everything. It gets the approved sources for this user, role, and decision.

Now I ask the tool: "Show me potential delivery risks for this week."

The system identifies the risk radar workflow and returns a focused answer. We have a delivery exception. DHL Freight shipment ending 0012, carrying 480 N-FK5 optical glass blanks, missed its Leipzig hub departure. The ETA moved one day from 24 June to Thursday, 25 June.

Just as important, the answer includes the operational implication: current stock covers production until Thursday afternoon.

The records section makes the recommendation auditable. The DHL shipment is flagged for attention. The FedEx priority shipment is still on schedule and protects the line start. The finding is tied to source evidence the user can review.

For executives, this is the difference between another dashboard and a decision tool. The interface resolves the context: what changed, what is exposed, what still protects us, and what should happen next, without asking every function to open five systems.

Now I, as Lukas Weber, Logistics Planner, trigger the next step. From Actions, I can request DHL recovery routing, create an Outlook recovery task to track DHL confirmation, FedEx backup status, and the Oberkochen receiving cutoff, or write the procurement team lead for review. I can also log the DHL exception on the purchase order while holding promised-date changes until the recovery ETA is confirmed.

For this walkthrough, I choose the Outlook recovery task.

This is human in the loop by design. Supply Chain Hub stages actions and routes approval. It packages the recommendation, evidence, owner, and next step so the responsible human can decide quickly.

And this is only one path. In the full demo, we can also explore role-based views, workbook grounding, approval queues, supplier alternatives, and executive portfolio decisions. The same pattern repeats: ask, ground, reason, act.

**5:15-6:00 - Model Close, Camera Visible**

Coming back to the model, this is why the architecture matters. The tool does not replace ZEISS systems. It gives teams a governed decision layer on top. OpenAI fits through the Responses API for grounded answers and the Agents SDK for tool-backed workflows and reviewer handoffs.

We saw one DHL delivery exception. But what lands on the procurement team lead's desk next? Does that decision recover one shipment, or change how ZEISS measures DHL reliability? And if recovery fails, which alternate supplier, production, or executive workflow fires next?

If this is what Supply Chain Hub can do from one logistics signal, what can it do across ZEISS supply-chain operations? That is the story I will continue in the full onsite demo at ZEISS HQ in Oberkochen next week.
