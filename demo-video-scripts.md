# Supply Chain Hub Slidev Demo Script

Executive Business Value

**0:00-0:45 - Slide 5, Camera Visible**

Meet Supply Chain Hub: the enterprise decision interface for moving from fragmented supply-chain signals to governed action.

This tool is built for supply-chain leaders, logistics planners, and procurement teams who need one trusted view of operational risk. The pain is that the same disruption is usually split across SAP, carrier updates, warehouse stock, supplier context, documents, and email. Teams spend time reconstructing the truth before they can act.

Slide 5 frames the solution: an executive-grade conversation surface, a governed operating model, and an integration layer that connects ZEISS systems, documents, business tools, and workflow actions while keeping sources of truth up to date.

We are starting at the proposal view, and now I will show the workflow behind it: from a delivery-risk question to evidence, action, and human review.

**0:45-5:15 - Live Tool, Camera Hidden**

I start with settings. A new user can configure which tools are available: SAP for purchase orders and material data, shipping providers for DHL and FedEx milestones, EWM warehouse for stock, and Outlook for follow-up actions.

I keep SAP, carrier data, and warehouse stock selected, and I enable Outlook because I want the workflow to move from analysis into controlled follow-up. This is the key design point: the model does not get everything. It gets the approved sources for this user, this role, and this decision.

Now I ask the tool: "Show me potential delivery risks for this week."

The system identifies the risk radar workflow and returns a focused answer. We have a delivery exception. DHL Freight shipment ending 0012, carrying 480 N-FK5 optical glass blanks, missed its Leipzig hub departure. The ETA moved one day from 24 June to Thursday, 25 June.

Just as important, the answer includes the operational implication: current stock covers production until Thursday afternoon.

The records section makes the recommendation auditable. The DHL shipment is flagged for attention. The FedEx priority shipment is still on schedule and protects the line start. The finding is tied to source evidence the user can review.

For executives, this is the difference between another dashboard and a decision tool. The interface resolves the context: what changed, what is exposed, what still protects us, and what should happen next.

Now I, as Lukas Weber, Logistics Planner, trigger the operational next step. From the Actions menu, I can request DHL recovery routing, create an Outlook recovery task to track DHL confirmation, FedEx backup status, and the Oberkochen receiving cutoff before noon, or write Dana Narid, the procurement team lead, for review. I can also log the DHL exception on the purchase order while holding any promised-date change until the recovery ETA is confirmed.

For this walkthrough, I choose the Outlook recovery task.

This is human in the loop by design. Supply Chain Hub stages actions and routes approval. It packages the recommendation, evidence, owner, and next step so the responsible human can decide quickly and with context.

That is the business value of the workflow: one operational question becomes an evidence-backed recommendation and a controlled action path.

**5:15-6:00 - Slide 6, Camera Visible**

Back on Slide 6, this is the architecture behind what we just saw. Supply Chain Hub is the conversation layer. The intelligence layer turns questions into options and next steps. Operating controls keep roles, sources, masking, and review paths clear, while ZEISS systems remain the sources of truth.

The pattern is ground, reason, act: pull context, compare trade-offs, then route recommendations. OpenAI fits through the Responses API for grounded answers and the Agents SDK for tool-backed workflows and reviewer handoffs.

We saw one DHL delivery exception. But what lands on Dana Narid's desk next? Does her decision recover one shipment, or change how ZEISS measures DHL reliability? And if recovery fails, which alternate supplier, production, or executive workflow fires next?

That is the story I will continue onsite at ZEISS HQ in Oberkochen next week.
