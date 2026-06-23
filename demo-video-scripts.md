# Supply Chain Hub Slidev Demo Script

Target length: 6:00. Recording structure:

1. **Slidev Slide 5, camera visible**: "Supply Chain Hub as the enterprise decision interface."
2. **Switch to the live Supply Chain Hub frontend, camera hidden**: this should take most of the video.
3. **Return to Slidev Slide 6, camera visible**: explain the architecture and close with the cliff hanger.

## Script 3: Executive Business Value

**0:00-1:05 - Slide 5, Camera Visible**

Meet Supply Chain Hub: the enterprise decision interface for moving from fragmented supply-chain signals to governed action.

The business problem is simple to describe and expensive to live with. One disruption is interpreted differently by every function. Logistics sees a carrier milestone. Planning sees a production buffer. Procurement sees a supplier relationship. Leadership sees customer commitment risk. The result is manual effort, slower decisions, and avoidable escalation meetings.

Slide 5 shows the proposed answer in three layers. First, a communication interface: a ChatGPT-style app where executives and operators ask business questions, inspect evidence, and align on next steps. Second, an enterprise operating model: role scope, source ownership, approval paths, and auditability, so this becomes a governed way of working rather than a loose chatbot. Third, a system integration layer: OpenAI API and SDK connecting ZEISS systems, MCP tools, documents, and workflow actions without replacing systems of record.

The business outcome is the part I want to make concrete in the demo: reduce manual effort, improve decision precision with source-backed recommendations, and give leaders a reliable path from signal to action and approval.

Now I will switch from the slide into the live tool.

**1:05-4:45 - Live Tool, Camera Hidden**

I start with settings. A new user can configure which tools are available for the workflow: SAP for purchase orders and material data, shipping providers for DHL and FedEx milestones, EWM warehouse for stock, and Outlook for follow-up actions.

This is important because the enterprise value is not a generic chatbot. The value is a governed interface across trusted systems. The model does not get everything. It gets the approved sources for this user, this role, and this decision.

Now I ask the tool: "Show me potential delivery risks for this week."

The system identifies the relevant risk radar workflow and returns a focused answer. We have a delivery exception. DHL Freight shipment 00340434161094000012, carrying 480 N-FK5 optical glass blanks, missed its Leipzig hub departure. The ETA moved from 24 June to Thursday, 25 June.

Just as important, the answer includes the operational implication: current stock covers production until Thursday afternoon.

The records section makes the recommendation auditable. The DHL shipment is flagged for attention. The FedEx priority shipment is still on schedule and protects the line start. The finding is not just a model-generated statement. It is tied to source evidence the user can review.

For executives, this is the key difference between another dashboard and a decision tool. The interface does not only display data. It resolves the decision context: what changed, what is exposed, what still protects us, and what should happen next.

Now I trigger the operational next step. From the Actions menu, I can draft the DHL Freight email asking for recovery routing and confirmed ETA. I can create the Outlook follow-up task to track the recovery confirmation before noon. And I can send Dana Narid the summary for review.

This is human in the loop by design. Supply Chain Hub stages actions and routes approval. It does not silently change the supply chain. It packages the recommendation, evidence, owner, and next step so the responsible human can decide quickly and with context.

That is the business value of the workflow: one operational question becomes an evidence-backed recommendation and a controlled action path.

**4:45-6:00 - Slide 6, Camera Visible**

Back on Slide 6, this is the reference architecture behind what we just saw.

On the left, Supply Chain Hub is the ChatGPT-style front end: ask, review evidence, and align next steps. Next is the OpenAI API / SDK layer. That layer connects reasoning to ZEISS backend MCP integration, source context, and workflow actions. Then governance applies role scope, approved sources, financial masking, human review, and auditability. And on the right, ZEISS systems stay systems of record: SAP, logistics, supplier, warehouse, and document context.

The rail underneath is the operating pattern: ground, reason, act. Ground the answer in approved supply-chain context. Reason over risk, options, trade-offs, and assumptions. Act by routing high-impact recommendations to owners and approval paths.

The bottom row shows why this can scale: MCP tools for risk, scenario, supplier, and policy functions; retrieval over approved documents and operational records; and a scale path into procurement, quality, manufacturing, and finance.

So the cliff hanger is this: we saw one DHL delivery exception. But what lands on Dana Narid's desk next? Does her decision only recover one shipment, or does it change how ZEISS measures DHL reliability as a freight partner? And if the recovery fails, which alternate supplier, production, or executive workflow should fire next?

That is the story I will continue onsite at ZEISS HQ in Oberkochen next week.

## Slidev Recording Notes

Recommended recording flow:

1. Open the deck in Slidev and navigate directly to **Slide 5**.
2. Start recording with your camera visible on the slide.
3. Deliver the Slide 5 opening in about 65 seconds.
4. Switch from Slidev to the Supply Chain Hub frontend and hide the camera.
5. Spend most of the time in the tool: settings, prompt, answer, findings table, actions.
6. Switch back to Slidev on **Slide 6** and show your camera again.
7. Explain the architecture and close with the cliff hanger.

Timing guide:

- Slide 5: 0:00-1:05.
- Live tool: 1:05-4:45.
- Slide 6: 4:45-6:00.

Practical tips:

- Keep the tool browser zoom around 90-100% so the settings, assistant answer, findings table, and Actions menu are readable.
- Rehearse the two transitions: Slidev to tool, then tool back to Slidev Slide 6.
- Before recording, pre-load the tool and make sure the prompt field is ready.
- During the live tool section, do not mention that the camera is hidden; just let the screen focus on the product.
- End on Slide 6 after the cliff hanger rather than returning to the tool.
