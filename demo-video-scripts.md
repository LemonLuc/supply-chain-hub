Hi, I am Lucie, an OpenAI Solutions Engineer, and I am delighted to present Supply Chain Hub, a Logistics solution built for Carl Zeiss.

Supply Chain provides one trusted view of operational and strategic risk. 
The pain for leaders, logistics planners, and procurement teams is that one disruption in the supply chain is often split across several different databases, files, tools, and team inboxes. Before teams or individuals can act, they first have to gather all the relevant information, which costs a lot of time and can have significant financial impacts.

This model shows the operating idea: 
a conversation layer for asking and reviewing evidence
an intelligence layer that turns questions into options
operating controls for roles and review paths
and of course ZEISS systems as sources of truth.

Let's show this live. 

We are in the Supply Chain Hub tool. At the top, the demo identity shows we are currently acting as Lukas Weber, a Logistics Planner.
The same tool can also be shown through a Procurement Team Lead or Chief Logistics Officer persona, which is important because each role sees different workflows, permissions, and decision rights. For the team lead or the C-level exec, they would also see the strategic and financial implications of logistics disruptions.

In production, this would be tied to ZEISS single sign-on. When someone opens Supply Chain Hub from the intranet, their corporate identity and role determines which workflows, sources, and actions they can access.

We have a few recommendations at the top depending on the user's role. They show proactive shortcuts into work that is most relevant to the user's current responsibilities.

The Chat UI is the heart of the tool. It's where users ask questions, get answers, and take action.
Next I open settings. A new user can configure tools: SAP for purchase orders and material data, shipping providers for DHL and FedEx milestones, and also Outlook for follow-up actions. I will also enable Outlook to demonstrate how the tool can create follow-up actions.

Now I ask the tool: "Show me potential delivery risks for this week."

The system identifies the risk radar workflow and returns a focused answer. We have a delivery exception. DHL Freight shipment ending 0012, missed its Leipzig hub departure. The ETA moved one day. 

Just as important, the answer already includes the operational implication: current stock covers production until Thursday afternoon.

The findings section at the bottom makes the recommendation auditable. The DHL shipment is flagged for attention. The FedEx priority shipment is still on schedule and protects the line start. The finding is tied to source evidence the user can review.

The interface resolves the context: what changed, what is exposed, what still protects us, and what should happen next, without asking every function to open five systems.

Now I, as Lukas Weber, Logistics Planner, trigger the next step. From Actions, I can request DHL recovery routing, create an Outlook recovery task to track DHL confirmation or write the procurement team lead for review. 

For this walkthrough, I choose the Outlook recovery task. This is then created in Lukas Outlook Task list and also added to his personal Supply Chain Hub task list. The idea is of course, that he solves these open tasks by interacting with the tool.

And this is only one path. In the full demo, we will also explore role-based views, approval queues, supplier alternatives, and executive portfolio decisions. 

--- MODEL 

Coming back to the model, this tool does not replace ZEISS systems. It gives teams a governed decision layer on top. 
OpenAI fits through the Responses API for grounded answers and the Agents SDK for tool-backed workflows and reviewer handoffs.

We saw one DHL delivery exception. But what lands on the procurement team lead's desk? Has this happened severeal times now? Does this change how ZEISS measures DHL's reliability? Which workflows trigger for the procurement lead or the Chief Logistics Officer? 

So, if this is what Supply Chain Hub can do from one logistics signal, what can it do across ZEISS supply-chain operations? 
Answers to these questions will be provided in the full onsite demo at ZEISS HQ in Oberkochen next week. 
Looking forward to it. Thank you!
