from __future__ import annotations


IMAGES = {
    "cadrage": {
        "path": "services/site/public/photos/hero-whiteboard-1600.webp",
        "caption": "Framing workshop: mapping sources, uses and pain points before a single line of code gets written.",
        "brief": (
            "Landscape photograph (3:2), natural light, warm tones. Two to four people at a "
            "whiteboard covered in sticky notes and arrows. Faces in three-quarter view or "
            "from behind, no client branding legible. Documentary register, not a corporate "
            "staging."
        ),
    },
    "socle": {
        "path": "services/site/public/photos/reason-baremetal-1600.webp",
        "caption": "The execution layer: infrastructure decisions govern latency and unit cost long before the model is chosen.",
        "brief": (
            "Landscape photograph (3:2) of rack aisles or accelerator cards, cool lighting "
            "contrasting with the rest of the document. No vendor logo, no legible asset tag."
        ),
    },
    "architecture": {
        "path": "tools/whitepaper/papers/guide_ia_90_jours/assets/architecture-en.svg",
        "height": 132,
        "caption": "Example of a target architecture, annotated with the decisions and the reversibility points.",
        "brief": (
            "Vector diagram, background #F5F4EF. Target architecture of a data-driven "
            "system: data sources, data foundation and search index, inference gateway, "
            "models (managed and self-hosted), guardrails, application. Three numbered "
            "magenta #E11FD0 badges mark the reversibility points (model provider, index "
            "engine, hosting). Thin #201F1E strokes, white fills, Space Grotesk labels. No "
            "vendor logo, no client name. Source: diagrams/architecture.puml."
        ),
    },
    "exploitation": {
        "path": "services/site/public/photos/collab-1600.webp",
        "caption": "Operations review: incidents and user feedback feed a prioritised backlog, not a list of grievances.",
        "brief": (
            "Landscape photograph (3:2), same series as the framing workshop so the light "
            "matches. Two people in front of a screen, in a reviewing posture rather than a "
            "demo one. No legible data on screen."
        ),
    },
}

BLOCKS: list[dict] = [
    {"t": "h1", "title": "Introduction"},
    {
        "t": "p",
        "text": "This document is for anyone who wants to understand, without going into excessive technical depth, how we at **Computeflux** design, build and put a data-driven system into production in ninety days.",
    },
    {
        "t": "p",
        "text": "It draws on our practice of AI engineering and data engineering. We design inference chains, data pipelines and agentic systems meant to run under real traffic, under latency, cost and compliance requirements.",
    },
    {
        "t": "p",
        "text": "Our proposition is simple: turn a promising AI feature into **a service that is measured, bounded in cost and operable by your own teams**.",
    },
    {
        "t": "p",
        "text": "The context has not changed much. Assembling a model, a handful of documents and an interface now takes a few days. Language models have shortened that time further, even if the resulting source code is harder to digest, and we can agree the demo has ‘become easy’. What remains hard has not moved: holding the compute load and the latency, proving the quality of the output, containing cost, fixing without regressing, and leaving the whole thing operable by a team that did not write the code.",
    },
    {
        "t": "p",
        "text": "It is this gap, between the proof of concept and the service in production, that this method sets out to close.",
    },
    {
        "t": "p",
        "text": "**Getting a data-driven system into production is not a model problem.** It is a matter of engineering, of organisation and of change management. A poorly framed implementation produces three recognisable symptoms: an inference cost nobody can explain, a level of quality nobody can demonstrate, and a service nobody dares to wire into the customer journey.",
    },
    {
        "t": "p",
        "text": "This guide describes a trajectory in three movements: one month of framing and architecture, one month building the foundation, one month of release and operations. The durations are indicative and adjust to context. The sequence does not.",
    },
    {"t": "figure", "key": "plan90", "caption": "The ninety-day trajectory."},
    # ======================================================================
    {"t": "section", "num": "1", "title": "Our philosophy", "accent": "blue"},
    {
        "t": "lead",
        "text": "Our approach fits in one sentence: you only steer what you measure. The choice of model, of hosting and the degree of automation follow from that, and never the other way round.",
    },
    {"t": "h2", "num": "1.1", "title": "Founding principles"},
    {
        "t": "p",
        "text": "Six principles shape every engagement. They are barely negotiable and never decorative: they are what sets the order of the work.",
    },
    {
        "t": "bullets",
        "items": [
            "**Measure before optimising.** A data-driven system without an evaluation dataset is not improvable, only modifiable. From the framing phase we establish an explicit definition of what a good answer is, and the set of cases that lets us check it on every change.",
            "**The model is only one component.** Most of the reliability is decided around it. Preparing and retrieving context, guardrails, error handling, caching and rate limiting are the engineering practices that separate a demo from a service.",
            "**Unit cost is a design constraint.** Cost per request, or per business task handled, is decided in the architecture and not when the invoice lands. We estimate it while drafting the scenarios, then track it as a production indicator in its own right.",
            "**Modularity and reversibility.** The model provider, when used as an external service, sits behind a stable interface so it can be swapped without rewriting the application. No component should become irreplaceable, technically or contractually.",
            "**Proportionate sovereignty.** The level of control — a managed service, European hosting, or execution on your own infrastructure — is chosen from the sensitivity of the data and the regulatory obligations. It is never a posture.",
            "**Team autonomy.** Our goal is that your teams operate the system without us. Documentation, upskilling and start-up support are part of the scope.",
        ],
    },
    {"t": "h2", "num": "1.2", "title": "How we measure the success of a project"},
    {
        "t": "p",
        "text": "Evaluating a data-driven system is trickier than evaluating a conventional application. The output can be probabilistic, what counts as ‘correct’ depends on the business, and a visible improvement on one case can degrade the others. So we keep a narrow set of indicators, defined **before** construction and adapted to the context:",
    },
    {
        "t": "bullets",
        "items": [
            "quality measured on a representative evaluation dataset, tracked version after version.",
            "end-to-end latency at the 95th percentile, over the whole journey and not just the model call.",
            "cost per request, or per business task handled.",
            "the failure and retry rate: errors, timeouts, answers rejected by the guardrails.",
            "service availability and time to recovery after an incident.",
            "actual adoption: the share of users or flows that genuinely go through the system.",
        ],
    },
    {
        "t": "p",
        "text": "The point is not to multiply metrics but to keep three to five that inform a decision. An indicator that never triggers an action is not an indicator, it is decoration.",
    },
    {
        "t": "application",
        "title": "A support copilot and the two metrics that prioritised the fixes",
        "text": "To steer the first months of a copilot built for internal support, we tracked two operational metrics: the draft acceptance rate and the cost per conversation.\n\nThe acceptance rate measures the share of answers proposed by the copilot that the agent sends without significant edits. It relies on no declarative survey: for every draft we compare the generated text with the message actually sent, and a similarity score above a defined threshold counts as an accepted answer. Broken down by contact reason, the metric showed that drafts about cancellation requests were rewritten far more often than the rest. The team therefore fixed the sources, the business rules and the generation instructions specific to that journey first.\n\nCost, in turn, is computed at the scale of a conversation rather than a model call. A single conversation can trigger several requests: rephrasing the request, document retrieval, generating the draft, tool calls, or a fresh generation after the agent intervenes. Since every call carries the same OpenTelemetry trace, token and inference costs are then aggregated by conversation identifier. That revealed that a significant share of the spend came from near-identical questions already handled earlier the same day.\n\nAdding a semantic cache in Redis removed the need for an exact text match: the system compares vector representations instead. If a new question is close enough to one already resolved, the copilot reuses the cached answer, provided the context and the sources are still valid.\n\nTwo Grafana panels were then enough to drive decisions: acceptance rate segmented by contact reason, to spot the journeys that needed hardening, and average cost per conversation, split between generated answers and answers served from cache, to follow the effect of the optimisation.",
    },
    {"t": "h2", "num": "1.3", "title": "What we do not do"},
    {
        "t": "p",
        "text": "Honest framing means stating the limits of the approach as well.",
    },
    {
        "t": "bullets",
        "items": [
            "**We do not train foundation models.** We only reach for specialising an existing model once the evaluation shows that no amount of tuning the context, the retrieval or the instructions will do.",
            "**We do not deliver a platform without a use case.** A platform built before the first use produces an immediate invoice and hypothetical value.",
            "**We do not install tooling your teams will not be able to operate.** The sophistication of an architecture is paid for every month, in operations.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "2", "title": "Month one:\nFraming and architecture", "accent": "magenta"},
    {
        "t": "lead",
        "text": "The first month produces no production code. It produces decisions, and the material that lets you defend them.",
    },
    {
        "t": "p",
        "text": "This phase aligns the technical solution with the strategic objectives, the business needs and the constraints of the organisation. It takes stock of existing data and uses, and clarifies what the stakeholders expect before the first euro of infrastructure is committed.",
    },
    {"t": "h2", "num": "2.1", "title": "Framing and understanding the context"},
    {
        "t": "p",
        "text": "We run workshops with the departments concerned, analyse the existing documentation and map the data sources and the priority use cases. The work produces a **framing note** setting out the objectives of the engagement, the scope, the priorities, the identified risks and the schedule.",
    },
    {
        "t": "p",
        "text": "One point deserves particular attention: the nature of the task handed to the system. Assisting an operator who keeps the decision, or automating a treatment end to end, do not call for the same level of quality, the same guardrails or the same budget. Settling it early avoids rebuilding late.",
    },
    {"t": "image", "key": "cadrage"},
    {"t": "h2", "num": "2.2", "title": "Defining ‘correct’: the evaluation dataset as the first deliverable"},
    {
        "t": "p",
        "text": "This is the main difference between a data-driven project and a conventional software project, and the point most often skipped. Before building, we assemble with your domain experts an **evaluation dataset**: a set of real, representative cases, each with the expected result and the criterion that decides whether an answer is acceptable.",
    },
    {
        "t": "p",
        "text": "That dataset covers nominal operation, edge cases, and the cases where the system must refuse to answer or hand over to a human. It becomes the project's shared reference: every change (a new model, a new instruction, a new retrieval strategy) is measured against it.",
    },
    {
        "t": "application",
        "title": "Defining a reliable answer for a contract analysis assistant",
        "text": "For an insurer, answering the question ‘is this claim covered?’ is not just about producing a plausible answer. The answer has to be traceable to the applicable clauses of the contract, and must flag explicitly the cases where the contract does not settle the matter.\n\nThe team defined three evaluation criteria.\n\n1. The answer must cite an existing, relevant clause. Every generated citation carries a structured reference (article number, clause title or passage identifier) that is checked automatically against the version of the contract supplied to the system. A reference absent from the document, or pointing at a different passage, fails the check.\n\n2. The answer must separate the general rule from its exclusions and conditions. A cover may, for instance, include a type of damage in principle while excluding certain uses, capping the payout or requiring a specific condition. This is assessed by a checking model that compares the answer with the contractual excerpts. Its behaviour is measured and tuned on a corpus annotated by domain specialists, to verify that it really does catch the material omissions.\n\n3. When the available documents are insufficient or ambiguous, the assistant must say so and route the file to a case handler. This requirement is scored as a binary decision: does the assistant abstain when the reference case states that no conclusion can be drawn from the contract?\n\nThe evaluation dataset is built from real files, anonymised and reviewed. It deliberately contains cases with no certain answer (incomplete clauses, missing claim information, contradictory covers, or exclusions whose applicability depends on something not supplied). In those situations the right answer is not a coverage decision: it is a request for further information, or a handover to a case handler.\n\nEvery evaluation run is recorded in an experiment tracker, MLflow-style: model version, instructions, documents used, per-criterion results and generated outputs. Two versions can therefore be replayed on exactly the same corpus. Without the abstention cases, an over-assertive system could score well on the easy questions while giving unfounded answers in precisely the situations where it should decline to conclude.",
    },
    {
        "t": "p",
        "text": "Without a shared evaluation reference, the choice between two approaches usually rests on individual perceptions: an answer looks better, a change feels faster, a model gives an impression of reliability. Regressions then only surface after release, on contact with users and real cases.\n\nWith a versioned dataset of cases, explicit criteria and results that are comparable from one run to the next, architecture decisions can be examined against measurable evidence. It becomes possible, for instance, to verify that a new model cuts cost or latency without degrading citation quality, the handling of exclusions, or the system's ability to abstain.",
    },
    {"t": "h2", "num": "2.3", "title": "Assumptions, constraints and non-functional requirements"},
    {
        "t": "p",
        "text": "We identify the **technical, legal, security, environmental and regulatory** constraints, then state quantified assumptions: data volumes, expected traffic, budget, deadlines, team size and skills. All of it in order to derive an explicit operating envelope.",
    },
    {
        "t": "p",
        "text": "Three requirements weigh especially heavily on the architecture of a data-driven system:",
    },
    {
        "t": "bullets",
        "items": [
            "**Acceptable latency**, which decides where the model sits in the journey, how much context is passed to it, and whether batch processing is an option.",
            "**Data confidentiality**, which governs where the model runs and what the retained logs may contain.",
            "**The operating budget**, which sets the trade-off between the quality sought and the cost per request.",
        ],
    },
    {
        "t": "p",
        "text": "These requirements are recorded, dated and versioned. They form a shared frame of reference for assessing changes to the system. When a requirement moves — a new level of traceability, of accuracy, or a tighter response time — that change is examined explicitly and reflected in the architecture, the data, the evaluations and the control mechanisms. The architecture therefore does not drift through a succession of exceptions and implicit choices: its evolutions stay tied to identified, documented needs.",
    },
    {
        "t": "application",
        "title": "Two architectures for one business need",
        "text": "A logistics platform wanted to produce a summary of the exchanges attached to a delivery file. That summary serves two distinct uses, over the same information, but they do not impose the same timing constraints.\n\nThe first use is operational. When an operator is on the phone with a customer, they need an up-to-date summary of the file within seconds. The system therefore passes the model only the useful context, for instance the latest messages and the main events on the file. A compact model, served in-house by an inference engine such as vLLM, produces the answer at low latency. That kind of engine can handle several requests concurrently and reuse part of the computation when requests share a common context prefix.\n\nThe second use is analytical. At the end of the day the company generates summaries for activity tracking, incident analysis, or to feed a datalake. Here a delay of several minutes is acceptable. A scheduled job, orchestrated by Airflow or Temporal, processes the files in batches with a more capable model and writes the results to the datalake.\n\nBoth chains use the same evaluation dataset to verify that the summaries stay faithful to the exchanges, keep the material information, and introduce no facts absent from the file. They differ in their infrastructure, their model, their processing mode and their cost. So it is not the model that determines the architecture in the first place: it is the latency requirement attached to each business use.",
    },
    {"t": "h2", "num": "2.4", "title": "The six components of a data-driven system in production"},
    {
        "t": "p",
        "text": "For each component we compare the available solutions against functional, technical, operational, compliance and cost criteria established in the previous steps. The result is a **reasoned comparison table**, backed by a weighted matrix that documents the criteria and justifies the final recommendation.",
    },
    {"t": "figure", "key": "bricks", "caption": "The six components of a data-driven system in production."},
    {
        "t": "p",
        "text": "This breakdown also serves as a reading grid for what already exists. In most organisations two or three of these components are already in place and do not need rebuilding.",
    },
    {"t": "h2", "num": "2.5", "title": "Architecture scenarios"},
    {
        "t": "p",
        "text": "We then draft several scenarios answering different priorities. None is superior in itself: each optimises one variable at the expense of another, and the choice belongs to the client, informed by the documents we hand over.",
    },
    {
        "t": "table",
        "caption": "Three common architecture scenarios, to compare against data sensitivity, traffic levels and operating constraints.",
        "cols": ["Scenario", "What it optimises", "What it implies", "Typical context"],
        "widths": [30, 44, 44, 44],
        "rows": [
            [
                "Managed service",
                "Time to market, simplicity of deployment and a lighter operational load.",
                "Significant dependence on the provider, a mostly variable cost, and limited room for manoeuvre on the infrastructure and the available models.",
                "First use case, moderate traffic, data that is not very sensitive or that can be handled within the confidentiality requirements.",
            ],
            [
                "Sovereign platform",
                "Control of the data, choice of infrastructure, and unit cost under control once volumes are high and stable.",
                "A larger upfront investment, in-house skills to operate the platform, and direct responsibility for its availability, its security and its updates.",
                "Regulated or sensitive data, sustained and predictable traffic, strong requirements on location, traceability or customisation.",
            ],
            [
                "Hybrid",
                "Fine adjustment across options: using the model, the environment and the service level best suited to each task.",
                "A more complex routing architecture, more observation machinery, and explicit rules deciding which data and which requests may take each path.",
                "A heterogeneous portfolio of use cases, varied data constraints, and requirements combining responsiveness, control and room to evolve.",
            ],
        ],
    },
    {
        "t": "p",
        "text": "Each scenario is costed on the same traffic assumptions, evaluated on the same dataset of cases, and comes with its exit plan: what it would take, and at what cost, to move away from it in a year.",
    },
    {"t": "h2", "num": "2.6", "title": "Decision and deliverables at the end of month one"},
    {
        "t": "p",
        "text": "The decision freezes the target architecture, the tooling and the construction roadmap. It is taken in committee, recorded, and accompanied by the criteria that would justify revisiting it.",
    },
    {"t": "image", "key": "architecture"},
    {
        "t": "panel",
        "title": "Deliverables of month one",
        "items": [
            "Framing note: objectives, scope, priorities, risks, schedule.",
            "Initial evaluation dataset and a shared definition of the acceptable answer.",
            "Register of assumptions, constraints and non-functional requirements.",
            "Reasoned comparison of the solutions and a weighted decision matrix.",
            "Target architecture (high level design), adoption plan and, where needed, migration plan.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "3", "title": "Month two:\nBuilding the foundation", "accent": "amber"},
    {
        "t": "lead",
        "text": "With the target architecture and the roadmap settled, construction can start. The aim of month two is to turn a theoretical architecture into an operational foundation.",
    },
    {"t": "h2", "num": "3.1", "title": "Infrastructure and environments"},
    {
        "t": "p",
        "text": "We deploy the infrastructure as code, with Terraform, Ansible or their equivalents, so that it stays reproducible, and we define the development, test and production environments. Secret management, network segmentation, access policy and storage requirements are settled at this stage.",
    },
    {
        "t": "p",
        "text": "When the chosen scenario relies on specific hardware such as GPUs, this step is not only about picking an infrastructure. It includes sizing the capacity against expected traffic, model size, latency targets and the availability level sought. It also sets the resource allocation rules: capacity reserved for critical services, capacity shared across teams or use cases, processing priorities and consumption limits.\n\nBehaviour under saturation has to be decided explicitly too. Depending on the context, a request can be queued, served by a lighter model, routed to alternative capacity, or refused with an understandable message. These mechanisms protect the priority uses, keep a traffic spike from degrading every service at once, and make both cost and quality of service more predictable.",
    },
    {"t": "image", "key": "socle"},
    {"t": "h2", "num": "3.2", "title": "Data foundation and context management"},
    {
        "t": "p",
        "text": "The quality of a data-driven system is first the quality of the context it is given. This step covers:",
    },
    {
        "t": "bullets",
        "items": [
            "Building the **ingestion pipelines** that move data reliably from a source to a destination.",
            "**Normalising and chunking the documents**, the precondition for relevant retrieval: bad chunking degrades quality more surely than a bad model.",
            "**Building the search index** and tuning the retrieval strategy, evaluated on the dataset of cases rather than on hand-picked examples.",
            "**Handling liveness**: what happens when a document changes, is deleted, or becomes confidential?",
            "**Propagating access rights** down to document level, so that a user never obtains, through the system, information they are not entitled to.",
            "Defining **data contracts** that stabilise the interfaces between producers and consumers.",
        ],
    },
    {
        "t": "application",
        "title": "When access rights get lost in the index",
        "text": "An HR intranet held general staff notices and individual files containing sensitive information in the same search system. The system looked correct: the documents it displayed respected each user's access rights. Yet a manager could sometimes obtain, inside a generated answer, elements taken from an individual file they were not authorised to see.\n\nThe cause was that the sensitive information was not necessarily surfaced as an identifiable document. It could be reconstructed by the model from fragments retrieved during search. Filtering after generation was therefore not enough: the unauthorised fragment had already been passed to the model and could shape the answer.\n\nThe fix was to move the access rules into the index itself. Every stored fragment carries, alongside its vector representation and its metadata, the groups or users allowed to read it. At search time the vector database applies that authorisation filter before selecting the fragments handed to the model. Only content the user may see can contribute to the answer.\n\nThat protection has to stay in step with the identity system. Entitlement changes — someone joining a team, a change of role, an access being revoked — are carried over a message queue. They trigger the update or the reindexing of the affected fragments. Without that mechanism the rights held in the index gradually diverge from the real ones, usually without the drift being immediately visible.",
    },
    {"t": "h2", "num": "3.3", "title": "The inference sequence"},
    {
        "t": "p",
        "text": "The inference sequence is the set of treatments a request goes through, from arrival to the answer returned. Designing it explicitly, rather than letting it emerge, is what makes it possible to place the tracing, replay and cost-control points.",
    },
    {"t": "figure", "key": "chain", "caption": "The path of a request, from arrival to answer."},
    {
        "t": "p",
        "text": "Four levers are tuned together, because they interact: **caching** recurring results and contexts, **routing** to a model proportionate to the difficulty of the task, **batching** non-interactive requests, and **falling back** to a degraded path when the main provider is unavailable.",
    },
    {
        "t": "application",
        "title": "Route rather than oversize",
        "text": "An assistant tasked with qualifying inbound requests mostly received short, simple messages: classify a request, route it to the right team, or acknowledge receipt. A small share of the traffic did require reading attachments, working through a longer history, or reasoning over several steps.\n\nInitially every request went through the same model, sized for the hardest cases. That guaranteed broad functional coverage, but it imposed the cost, the latency and the capacity of an advanced model on all traffic, including the simplest requests.\n\nThe fix was to introduce an inference gateway in front of the models. The gateway first applies a lightweight classifier to identify the nature of the request. Common cases are served by a smaller, self-hosted model suited to short answers. Only requests meeting explicit escalation criteria are passed to a more capable model: an attachment present, an unusually long thread, detected ambiguity, a need for multimodal processing, or a failed first pass.\n\nThe gateway also centralises quotas, priority rules, fallback to an alternative when a provider is unavailable, and cost measurement per request type. The main challenge is not putting the routing in place. It is defining escalation criteria that are clear and checkable, then tracking how often they fire. If that rate climbs with no identifiable business reason, it can signal a drop in the small model's quality, an over-cautious classifier, or a shift in traffic that undermines the architecture's initial assumptions.",
    },
    {"t": "h2", "num": "3.4", "title": "Guardrails, security and compliance"},
    {
        "t": "p",
        "text": "A data-driven system exposed to users, internal or external, has an attack and drift surface of its own. We put in place input and output validation, detection of attempts to subvert the instructions, segmentation of the tools the system is allowed to call, and full logging of decisions for traceability.",
    },
    {
        "t": "p",
        "text": "Personal data handling is framed at this stage: minimisation, log retention, anonymisation, and where processing takes place. When the use falls into a regulated category, the required documentation is produced during construction, when it is cheap, rather than afterwards, when it blocks a release.",
    },
    {"t": "h2", "num": "3.5", "title": "Industrialisation and continuous evaluation"},
    {
        "t": "p",
        "text": "Industrialisation is what lets a team change the system without fear. It rests on continuous integration and delivery — automated tests, code review, controlled deployments — and on one practice specific to data-driven systems: **evaluation replayed on every change**.",
    },
    {"t": "figure", "key": "loop", "caption": "The continuous evaluation loop makes sure no change ships without having been measured."},
    {
        "t": "p",
        "text": "A change of instruction, a new model version or a shift in retrieval strategy trigger exactly what a code change triggers: a run of the evaluation dataset, a comparison with the previous version, and a documented decision. The evaluation dataset grows in return from the real cases met in production.",
    },
    {
        "t": "application",
        "title": "The fix that breaks something else",
        "text": "To make answers look consistent, a team adds ‘always answer in three bullet points’ to the system instruction. The originally problematic case is indeed fixed. But an instruction never acts only on the example that prompted the change: it shapes the model's behaviour across the board.\n\nBecause instructions are versioned with the code, every change triggers an automatic run of the evaluation dataset in the continuous integration pipeline. The report then surfaces the side effects: answers that used to fit in one sentence become needlessly long, while some cases where the system was supposed to abstain now produce three artificial or speculative points in order to satisfy the new format instruction.\n\nThe evaluation compares each case against the version currently in production, rather than keeping only an aggregate score. That detailed comparison is essential: an unchanged average can simultaneously hide an improvement on one scenario, an answer gone too verbose on another, and a more serious regression on the abstention cases. Those deviations carry neither the same weight nor the same level of risk.\n\nA non-regression threshold is then applied: if the new version degrades critical cases beyond the defined tolerance, the merge is blocked. Without that mechanism a local fix can ship as an apparent improvement while quietly introducing failures elsewhere.",
    },
    {"t": "h2", "num": "3.6", "title": "Observability and cost control"},
    {
        "t": "p",
        "text": "We instrument the system end to end to produce full traces of a request, quality, latency and error metrics, and **the cost attached to each call**. Cost then stops being a monthly invoice line and becomes operational data, analysable by use, by team and by version.",
    },
    {
        "t": "p",
        "text": "That instrumentation serves two audiences: the technical teams who diagnose, and the leadership who arbitrate. It is the precondition for a FinOps practice that actually steers usage rather than observing it.",
    },
    {"t": "h2", "num": "3.7", "title": "Documentation and skills transfer"},
    {
        "t": "p",
        "text": "Our aim is that **your teams are fully autonomous on the system and master what we produced**. The point is not to create a dependency but to hand over an operational foundation that is clear, documented and yours to own. The transfer has three strands:",
    },
    {
        "t": "bullets",
        "items": [
            "**Documentation**: architecture and decisions, data catalogue and lineage, operating procedures, use-case oriented guides.",
            "**Upskilling**: role-based training and peer-programming sessions on real changes, so the teams take the lead on actual evolutions.",
            "**Start-up support**: operating rituals, pre-release reviews, handling of the first alerts.",
        ],
    },
    {
        "t": "panel",
        "title": "Deliverables of month two",
        "items": [
            "Infrastructure as code, separate environments, secret and access management.",
            "Ingestion pipelines, search index and data contracts in operation.",
            "Instrumented inference sequence: cache, routing, batching, replays.",
            "Guardrails, logging and compliance documentation.",
            "Continuous delivery pipeline including the automatic run of the evaluation dataset.",
            "Operating documentation and an upskilling plan under way.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "4", "title": "Month three:\nGetting to production", "accent": "blue"},
    {
        "t": "lead",
        "text": "With the foundation in place, the task is to prove its value quickly on a real scope, then install the operating regime that will let it grow.",
    },
    {"t": "h2", "num": "4.1", "title": "Choosing the scope of the first release"},
    {
        "t": "p",
        "text": "We favour a use that resolves an identified pain point, whose result is visible to the business and measurable without extra instrumentation. That first tangible result acts as a demonstrator, builds support and brings people along with the approach.",
    },
    {
        "t": "p",
        "text": "A good launch scope has three properties. It needs enough volume for the measurements to mean something, a user population that is identified and reachable, and a manual fallback path if the system is unavailable.",
    },
    {"t": "h2", "num": "4.2", "title": "Progressive rollout"},
    {
        "t": "p",
        "text": "The switch never happens in one go. We proceed in stages, each with its go criterion and its stop criterion:",
    },
    {
        "t": "numbered",
        "items": [
            "**Shadow running**: the system processes real traffic without exposing its answers to end users. Its results are compared with existing practice, with human decisions, or with the system already in service. This stage lets us check answer quality, behavioural differences and real operating conditions without introducing operational risk.",
            "**Progressive opening**: a limited share of the traffic is actually served by the new system. The rollout is watched closely through quality, latency, error rate, cost and user feedback. The scope or the traffic share only grows once the defined criteria are met.",
            "**Generalisation**: the system is extended to the whole intended scope, while a rollback mechanism stays available, documented and regularly tested. Being able to return quickly to the previous solution is part of the deployment strategy, not an afterthought.",
        ],
    },
    {
        "t": "p",
        "text": "At each stage, the decision to continue, to hold, or to roll back rests on the indicators defined in the first month of the project. A rollback should not be read as a failure: it is the mechanism that makes a progressive rollout possible under controlled conditions. To be useful it has to be technically feasible, fast enough, and known to the teams on duty.",
    },
    {"t": "h2", "num": "4.3", "title": "Operations: incidents, on-call and procedures"},
    {
        "t": "p",
        "text": "A data-driven system has failure modes that go beyond the usual technical incidents. Quality can degrade with no visible error, input data can shift, an external provider can become unavailable or change its behaviour, and cost can climb quickly under traffic or a routing change. Operations must therefore define the alerts that match those risks, the thresholds that fire them, who is called, and the associated intervention procedures.",
    },
    {
        "t": "p",
        "text": "The procedures have to answer simple operational questions in advance. What do we do if the main provider is unavailable — which fallback is used, and for which uses? What do we do if quality drops when no deployment took place: do we suspend a flow, restrict access to a feature, or revert to manual handling? What do we do if the daily cost passes the agreed threshold? These decisions should not be improvised during the incident.",
    },
    {
        "t": "application",
        "title": "The drift no technical alert was watching for",
        "text": "A provider updates the version of its model while keeping the same call reference. From the infrastructure's point of view no technical indicator signals a problem. Requests keep flowing, latency is stable and cost does not move noticeably. Yet the model's functional behaviour has changed: some fields the application expects are no longer consistently populated in the answers.\n\nThe problem is only found several days later, when the business teams notice incomplete files appearing. Alerts based purely on HTTP errors, availability or response time cannot see this drift. The service works technically, but it no longer does its business job.\n\nThree measures cut that risk sharply. The first is to pin the model version explicitly rather than depend on an alias that can move without any change to the application code. The second is to validate every answer against an expected schema, then watch the failure rate of that validation as a production indicator in its own right: a successful HTTP response that is structurally unusable must count as a functional failure.\n\nThe third is to replay periodically, in production, a representative subset of the evaluation dataset. Those checks catch a behavioural change even when the answers stay technically valid. Finally, the precise model version should be recorded as a trace attribute on every call. When something degrades, that information pins the switchover to the minute instead of leaving it to be inferred after the fact from the symptoms.",
    },
    {"t": "image", "key": "exploitation"},
    {"t": "h2", "num": "4.4", "title": "Measurement and continuous improvement"},
    {
        "t": "p",
        "text": "The success of the use is tracked through the indicators defined upfront: quality, latency, unit cost, availability, adoption. Execution traces and user feedback feed a backlog of improvements that is prioritised and planned on a regular cadence.",
    },
    {
        "t": "p",
        "text": "The problematic cases met in production are added to the evaluation dataset. The system therefore becomes harder to regress as it ages.",
    },
    {"t": "h2", "num": "4.5", "title": "Governance and sustainability"},
    {
        "t": "p",
        "text": "We structure the governance so the system lasts. Responsibilities on each component have to be explicit, along with the demand management process and the lifecycle of models and instructions. It also has to be settled who changes them, through which procedure, and with what approval.",
    },
    {
        "t": "panel",
        "title": "Deliverables of month three",
        "items": [
            "First use in production, on a defined and measured scope.",
            "Progressive rollout procedure and a tested rollback.",
            "Documented alerts, thresholds and operating procedures.",
            "Tracking dashboard: quality, latency, cost, availability, adoption.",
            "Governance model: responsibilities, forums, demand management.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "5", "title": "And after the 90 days?", "accent": "magenta"},
    {
        "t": "p",
        "text": "In ninety days we go **from framing to a first use in production**, securing the architecture choices, building an industrialised foundation and delivering a measurable result.",
    },
    {
        "t": "p",
        "text": "This incremental approach, guided by visible results, proves the value quickly and brings the business along around shared indicators.",
    },
    {
        "t": "p",
        "text": "But **the foundation is not an end in itself**. What follows is growing it into a mature platform: able to take on new data domains, to expose capabilities as reusable products and interfaces, to process information in real time as responsiveness becomes a requirement, to let agentic systems chain actions together, and to optimise inference as volume grows.",
    },
    {
        "t": "callout",
        "title": "In short",
        "text": "In ninety days we design, build and put into service a data-driven system that delivers measurable value while preparing what comes next. Architecture, industrialisation and adoption advance together, so that data becomes a durable lever for decisions rather than one more demo.",
        "accent": "magenta",
    },
    {"t": "h3", "title": "Your roadmap, as a decision maker"},
    {
        "t": "p",
        "text": "If you are a CTO, a CPO, an innovation director or the head of a business line, building this foundation is the occasion to lay durable groundwork without overinvesting or overcomplicating. Seven questions are enough to locate your organisation:",
    },
    {
        "t": "numbered",
        "items": [
            "Can we state, on real cases, what a good answer from our system is?",
            "Do we know the cost of a request, and where it goes if traffic doubles?",
            "Can we change model provider without rewriting the application?",
            "Is a change of instruction traced, tested and reversible like a code change?",
            "Can we detect a drop in quality before users report it?",
            "Does our sensitive data leave the organisation, and under what contractual guarantees?",
            "If our supplier left tomorrow, would our team be able to operate the system?",
        ],
    },
    {
        "t": "p",
        "text": "A negative answer is not a problem but a starting point, and the order of these questions gives the order of the work.",
    },
    {"t": "h3", "title": "Need support on your data-driven projects?"},
    {
        "t": "p",
        "text": "Computeflux is a French engineering studio. We provide the AI engineers, data engineers and architects your project needs to reach production, with method, measurement and a sense of the concrete.",
    },
    {
        "t": "contact",
        "lines": [
            ("Write", "gabriel.mougard@gmail.com", "mailto:gabriel.mougard@gmail.com"),
            ("Website", "computeflux.xyz", "https://computeflux.xyz"),
            ("Book a call", "computeflux.xyz/book", "https://computeflux.xyz/book"),
            ("LinkedIn", "linkedin.com/company/computeflux-xyz", "https://www.linkedin.com/company/computeflux-xyz"),
        ],
        "note": "Maturity assessment, architecture workshop or extra engineering capacity: tell us where you stand and we will tell you where to start.",
    },
]

# ---------
# Last page
# ---------

RESOURCES = {
    "title": "Resources",
    "intro": "To carry on reading, a few Computeflux publications on the topics this guide covers.",
    "groups": [
        {
            "title": "Articles",
            "items": [
                ("What AI engineering actually is", "computeflux.xyz/en/articles/what-is-ai-engineering", "https://computeflux.xyz/en/articles/what-is-ai-engineering"),
                ("Agents: from demo to production", "computeflux.xyz/en/articles/agent-demo-vs-production", "https://computeflux.xyz/en/articles/agent-demo-vs-production"),
                ("The inference optimisations that hold in production", "computeflux.xyz/en/articles/inference-optimizations-that-work", "https://computeflux.xyz/en/articles/inference-optimizations-that-work"),
            ],
        },
        {
            "title": "Case studies",
            "items": [
                ("Edge e-commerce: payment is the product", "computeflux.xyz/en/studies/mobile-money-payment-processor", "https://computeflux.xyz/en/studies/mobile-money-payment-processor"),
                ("Edge e-commerce: the catalogue as an artefact", "computeflux.xyz/en/studies/edge-serving-layer", "https://computeflux.xyz/en/studies/edge-serving-layer"),
                ("Edge e-commerce: first-party signals, no tracker", "computeflux.xyz/en/studies/first-party-signal-dco-newsletter", "https://computeflux.xyz/en/studies/first-party-signal-dco-newsletter"),
            ],
        },
        {
            "title": "Our expertise",
            "items": [
                ("AI engineering", "computeflux.xyz/en/expertise/ai-engineering", "https://computeflux.xyz/en/expertise/ai-engineering"),
                ("Data engineering", "computeflux.xyz/en/expertise/data-engineering", "https://computeflux.xyz/en/expertise/data-engineering"),
                ("Inference optimisation", "computeflux.xyz/en/expertise/inference-optimization", "https://computeflux.xyz/en/expertise/inference-optimization"),
            ],
        },
    ],
}

FIGURES = {
    "plan90": {
        "kind": "columns",
        "columns": [
            {
                "label": "MONTH 01",
                "title": "Framing and architecture",
                "items": [
                    "Framing note",
                    "Evaluation dataset",
                    "Scenarios and decision",
                    "Target architecture",
                ],
                "accent": "blue",
            },
            {
                "label": "MONTH 02",
                "title": "Building the foundation",
                "items": [
                    "Infrastructure as code",
                    "Data and context",
                    "Inference sequence",
                    "Guardrails and CI/CD",
                ],
                "accent": "magenta",
            },
            {
                "label": "MONTH 03",
                "title": "Getting to production",
                "items": [
                    "Progressive rollout",
                    "Operations and alerts",
                    "Measurement and backlog",
                    "Governance",
                ],
                "accent": "amber",
            },
        ],
        "axis": ("Decide", "Build", "Operate"),
    },
    "bricks": {
        "kind": "grid",
        "items": [
            ("01", "Sources and ingestion", "Collect business data reliably."),
            ("02", "Data foundation and context", "Normalise, chunk and index what the model will work on."),
            ("03", "Models and inference", "Serve the models: cache, routing, batching, fallback."),
            ("04", "Orchestration and agents", "Chain the steps, call the tools, handle retries."),
            ("05", "Guardrails and security", "Validate inputs and outputs, segment, trace."),
            ("06", "Observability and FinOps", "Measure quality, latency and cost per request."),
        ],
    },
    "chain": {
        "kind": "pipeline",
        "steps": [
            "Request",
            "Gateway and quotas",
            "Input guardrails",
            "Context retrieval",
            "Cache and routing",
            "Model",
            "Output guardrails",
            "Answer",
        ],
        "rail_top": "End-to-end logging and traceability",
        "rail_bottom": "Measurement: quality, latency, cost per request",
    },
    "loop": {
        "kind": "cycle",
        "steps": [
            ("Change", "Instruction, model, retrieval or code."),
            ("Evaluation", "The dataset of cases is replayed automatically."),
            ("Comparison", "Deviation measured against the live version."),
            ("Decision", "Ship, fix or drop."),
        ],
        "feedback": "Cases met in production feed the evaluation dataset",
    },
}

# Labels for the PlantUML schematics (diagrams/*.puml). Structure and styling
# live in the template; only the words are here.
DIAGRAM_LABELS = {
    "architecture": {
        "data_pkg": "CONTEXT (THE DATA PATH)",
        "sources_title": "Business sources",
        "sources_note": "applications, files, APIs",
        "ingest_title": "Ingestion and quality",
        "chunk_title": "Normalisation and splitting",
        "index_title": "Search index",
        "index_note": "replaceable engine",
        "service_pkg": "SERVICE (THE REQUEST PATH)",
        "app_title": "Business application",
        "guards_title": "Input and output guardrails",
        "guards_note": "validation, segmentation, logs",
        "gateway_title": "Inference gateway",
        "gateway_note": "quotas, cache, routing, fallback",
        "managed_title": "Managed model",
        "selfhosted_title": "Self-hosted model",
        "infra_pkg": "EXECUTION LAYER",
        "iac_title": "Infrastructure as code, separate environments, secrets and access",
        "iac_note": "reversible hosting",
        "edge_context": "context",
    },
}
