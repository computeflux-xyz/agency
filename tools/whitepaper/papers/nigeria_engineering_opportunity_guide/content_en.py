from __future__ import annotations


IMAGES = {
    "opportunity_recognition": {
        "path": "tools/whitepaper/papers/nigeria_engineering_opportunity_guide/assets/opportunity-recognition.svg",
        "height": 120,
        "caption": "A useful introduction starts with a business symptom, then follows the evidence to an engineering decision.",
        "brief": "PlantUML source: diagrams/opportunity-recognition.puml.",
    },
    "intervention_method": {
        "path": "tools/whitepaper/papers/nigeria_engineering_opportunity_guide/assets/intervention-method.svg",
        "height": 115,
        "caption": "The Computeflux intervention path. Every engagement begins and ends with evidence.",
        "brief": "PlantUML source: diagrams/intervention-method.puml.",
    },
    "payment_reliability": {
        "path": "tools/whitepaper/papers/nigeria_engineering_opportunity_guide/assets/payment-reliability.svg",
        "height": 135,
        "caption": "For an asynchronous payment rail, API acceptance is not final completion. Durable state, status recovery and reconciliation protect uncertain outcomes.",
        "brief": "PlantUML source: diagrams/payment-reliability.puml.",
    },
    "resilient_platform": {
        "path": "tools/whitepaper/papers/nigeria_engineering_opportunity_guide/assets/resilient-platform.svg",
        "height": 132,
        "caption": "A resilient service separates the interactive path, asynchronous work and system of record, while tracing all three.",
        "brief": "PlantUML source: diagrams/resilient-platform.puml.",
    },
    "qualification_flow": {
        "path": "tools/whitepaper/papers/nigeria_engineering_opportunity_guide/assets/qualification-flow.svg",
        "height": 138,
        "caption": "Qualification protects both companies from starting with a vague complaint and ending with an unbounded project.",
        "brief": "PlantUML source: diagrams/qualification-flow.puml.",
    },
    "proof_of_value": {
        "path": "tools/whitepaper/papers/nigeria_engineering_opportunity_guide/assets/proof-of-value.svg",
        "height": 126,
        "caption": "The complimentary diagnostic is a decision gate, not a disguised implementation project.",
        "brief": "PlantUML source: diagrams/proof-of-value.puml.",
    },
}


FIGURES: dict[str, dict] = {}


BLOCKS: list[dict] = [
    {"t": "h1", "title": "Introduction"},
    {
        "t": "callout",
        "title": "The question this guide answers",
        "text": (
            "If a partner identifies a potential client in Nigeria, what specific "
            "problems can Computeflux solve, how would we solve them, and what measurable "
            "value should the client expect?"
        ),
        "accent": "magenta",
    },
    {
        "t": "p",
        "text": (
            "Computeflux works on systems where performance, reliability, data movement, "
            "integration or infrastructure design has become a business constraint. We are "
            "most useful when the problem crosses components and cannot be resolved by "
            "installing one more product. The work may involve an API, a database, a payment "
            "rail, a deployment pipeline, a cloud environment, a data platform, or a critical "
            "piece of code. The unit of work is the problem, not the technology."
        ),
    },
    {
        "t": "p",
        "text": (
            "A partner should bring proximity to the market, knowledge of the business context "
            "and access to the right decision makers. Computeflux brings engineering diagnosis, "
            "architecture and implementation. The partnership works when those roles meet "
            "around a problem with visible commercial or operational consequences."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "**Recognise the signal.** Identify a concrete symptom and its business impact.",
            "**Collect enough evidence.** Establish scale, environment, history and urgency.",
            "**Qualify the fit.** Decide whether the problem requires Computeflux's strongest engineering capabilities.",
            "**Introduce the opportunity.** Bring the client, context and initial evidence into one focused technical conversation.",
            "**Measure the intervention.** Agree the baseline and success criteria before implementation begins.",
        ],
    },
    {"t": "image", "key": "opportunity_recognition"},

    # ======================================================================
    {"t": "section", "num": "1", "title": "Spotting a Computeflux\nopportunity", "accent": "blue"},
    {
        "t": "lead",
        "text": (
            "A strong opportunity has more than technical complexity. It has consequence, "
            "evidence, ownership and a result that can be measured."
        ),
    },
    {"t": "h2", "num": "1.1", "title": "The profile of a strong opportunity"},
    {
        "t": "p",
        "text": (
            "Headcount does not determine system consequence or engineering complexity. The "
            "useful qualification criteria are criticality, scale, evidence, ownership and "
            "measurable impact. The central question is whether software and infrastructure now "
            "sit on the critical path of revenue, service delivery, regulatory duty or growth."
        ),
    },
    {
        "t": "table",
        "caption": "Signals that an opportunity deserves technical investigation.",
        "cols": ["Signal", "What it sounds like", "Why it matters"],
        "widths": [39, 61, 62],
        "rows": [
            [
                "Visible business impact",
                "Transactions fail, customers leave, staff reconcile by hand, launches slip, or infrastructure cost erodes margin.",
                "Engineering effort can be tied to revenue, risk, capacity or operating cost.",
            ],
            [
                "Persistent technical symptom",
                "The issue has survived routine fixes, vendor support, extra servers, or repeated incident response.",
                "The root cause may cross application, data, network and infrastructure boundaries.",
            ],
            [
                "Meaningful operating scale",
                "The platform handles material users, transactions, events, data volumes or business-critical workflows.",
                "Reliability and efficiency gains compound with volume and consequence.",
            ],
            [
                "Decision owner",
                "A CTO, CIO, head of engineering, product leader or operations owner accepts the problem and can sponsor access.",
                "Diagnosis fails when nobody can approve evidence access or act on the result.",
            ],
            [
                "Evidence exists",
                "Logs, metrics, traces, bills, incident records, architecture notes or transaction samples can be made available.",
                "A baseline can be established without guessing.",
            ],
        ],
    },
    {"t": "h2", "num": "1.2", "title": "Initial sectors"},
    {
        "t": "p",
        "text": (
            "The following sectors are starting points, not restrictions. They share one trait: "
            "software is not administrative support. It carries money, communication, customer "
            "access, operational decisions or regulated data."
        ),
    },
    {
        "t": "table",
        "caption": "Where Computeflux capabilities are most likely to create value.",
        "cols": ["Sector", "Problems a west african partner may hear", "Likely engineering territory"],
        "widths": [34, 65, 63],
        "rows": [
            [
                "Fintech and payments",
                "Failed or delayed transactions, duplicate debits, unstable integrations, reconciliation backlogs, rising latency.",
                "Idempotency, ledgers, asynchronous workflows, integration gateways, tracing, capacity and resilience.",
            ],
            [
                "Financial services",
                "Legacy systems block new products, batch windows overrun, controls are manual, recovery is uncertain.",
                "Incremental modernisation, secure APIs, event integration, data controls, recovery testing and auditability.",
            ],
            [
                "Telecoms",
                "Subscriber systems degrade under load, integrations are brittle, operations depend on manual deployment or diagnosis.",
                "High-throughput services, data pipelines, automation, observability, failover and supplier-boundary engineering.",
            ],
            [
                "E-commerce",
                "Mobile pages are slow, traffic spikes cause failure, checkout is fragile, media is heavy, cloud cost follows every visit.",
                "Edge delivery, caching, media pipelines, payment integration, load shaping and cost-aware architecture.",
            ],
            [
                "Marketplaces and digital platforms",
                "Search, inventory, orders, matching or notifications disagree as the platform grows.",
                "Distributed state, queues, search systems, event contracts, consistency boundaries and service reliability.",
            ],
            [
                "Technology companies",
                "A successful prototype cannot survive real traffic, deployments are risky, or one vendor constrains the roadmap.",
                "Production architecture, platform engineering, performance work, portability and operational ownership.",
            ],
        ],
    },
    {"t": "h2", "num": "1.3", "title": "Additional sectors worth watching", "toc": False},
    {
        "t": "bullets",
        "items": [
            "**Logistics and mobility.** Dispatch, tracking, routing and proof-of-delivery systems depend on timely events, intermittent-network handling and reliable integration across operators.",
            "**Energy and utility technology.** Metering, field operations, billing and telemetry create large event flows and difficult reconciliation boundaries.",
            "**Health and insurance platforms.** Sensitive data, identity, auditability and high-consequence workflows make access control and recovery first-class engineering requirements.",
            "**Large digital operations in any sector.** A manufacturer, retailer or service group can be a strong fit when its internal platform, data or integration estate has become complex enough to affect the business.",
        ],
    },
    {"t": "h2", "num": "1.4", "title": "Nigeria-specific conditions without stereotypes", "toc": False},
    {
        "t": "p",
        "text": (
            "Nigeria is not one technical environment. A Lagos fintech, a national telecom "
            "operator, a regional retailer and a public-sector platform face different users, "
            "networks, regulation and operating constraints. We therefore test conditions at "
            "the client instead of treating broad market observations as architecture facts."
        ),
    },
    {
        "t": "bullets",
        "items": [
            "**Payment flows cross organisations.** Banks, processors, NIBSS services, mobile channels and third parties can all sit on one customer journey. Timeouts and status disagreements require explicit state and reconciliation.",
            "**Network quality is part of the product.** For mobile-first journeys, payload size, round trips, retry behaviour and degraded operation can affect conversion as much as server speed.",
            "**Cloud cost deserves architectural treatment.** Exchange-rate exposure, data transfer, idle capacity and managed-service premiums can turn a technically acceptable design into an uneconomic one.",
            "**Regulation changes engineering work.** The Nigeria Data Protection Act requires risk-proportionate controls. CBN and NCC frameworks add sector-specific expectations around resilience, incident response, supplier risk and recovery.",
            "**Data transfer is a design question, not a slogan.** Nigerian law does not impose one blanket localisation rule for all personal data. Transfer basis, sector rules, client risk and contractual safeguards must be mapped precisely.",
            "**Operational simplicity matters.** Every added component creates operational or governance work: monitoring, access control, backup and recovery, supplier management, and patching where self-managed. We add machinery only when the workload can justify it.",
        ],
    },
    {
        "t": "panel",
        "title": "What a partner should bring to an introduction",
        "items": [
            "One sentence describing the technical symptom.",
            "One sentence describing the business consequence.",
            "System scale: users, requests, transactions, events or data volume.",
            "Current environment and important third-party integrations.",
            "Duration, urgency and what has already been attempted.",
            "Name and role of the person who owns the problem.",
        ],
    },
    {"t": "h2", "num": "1.5", "title": "Clear non-fits", "toc": False},
    {
        "t": "p",
        "text": "Saying no early protects trust. Computeflux is unlikely to be the right first call when:",
    },
    {
        "t": "bullets",
        "items": [
            "the request is ordinary website construction, generic IT support, device procurement or staff augmentation with no defined engineering outcome.",
            "the only requirement is to resell a predetermined product or cloud contract.",
            "the company cannot describe any business impact and will provide no technical evidence.",
            "the desired answer has already been chosen and the assessment is expected to justify it.",
            "the engagement depends on claiming guaranteed gains before a baseline exists.",
            "the client needs legal certification or an audit opinion rather than engineering implementation and evidence.",
        ],
    },

    # ======================================================================
    {"t": "section", "num": "2", "title": "Recognising the\nproblem behind the symptom", "accent": "magenta"},
    {
        "t": "lead",
        "text": (
            "Clients report symptoms and engineers must find causes and in our view, the quality of the engagement "
            "depends on never confusing the two."
        ),
    },
    {"t": "h2", "num": "2.1", "title": "When a client says the platform is slow"},
    {
        "t": "p",
        "text": (
            "Slow can mean a heavy mobile page, a distant network path, a saturated service, "
            "lock contention, an inefficient query, a cold cache, an overloaded third-party API, "
            "or work that should never have been placed on the interactive path. Buying larger "
            "servers before separating those causes often raises cost without changing the user experience."
        ),
    },
    {
        "t": "table",
        "caption": "How a vague performance complaint becomes an investigation.",
        "cols": ["Question", "Evidence", "Possible intervention"],
        "widths": [47, 53, 62],
        "rows": [
            [
                "Which action is slow, for whom and from where?",
                "User journey, location, device and connection type, browser timings.",
                "Separate client, network, edge and server time before changing architecture.",
            ],
            [
                "Is the median slow, or only the tail?",
                "p50, p95 and p99 latency by endpoint and dependency.",
                "Trace slow paths, isolate queueing and remove tail amplifiers.",
            ],
            [
                "Does latency rise with traffic?",
                "Request rate, concurrency, queue depth, CPU, memory, disk and connection pools.",
                "Remove bottlenecks, bound concurrency, add capacity only where saturation is proven.",
            ],
            [
                "Is data access dominant?",
                "Query plans, lock waits, cache hit rate, rows scanned, remote calls.",
                "Change indexes or data shape, cache deliberately, move work off the request path.",
            ],
        ],
    },
    {
        "t": "application",
        "label": "Illustrative example",
        "title": "An e-commerce page that is fast in the office and slow for buyers",
        "text": (
            "Suppose the server dashboard shows acceptable response time, so the team concludes that the "
            "application is healthy. Buyers still abandon product pages. A journey trace separates "
            "server response, asset transfer and browser rendering. It shows that large source images "
            "are resized only after reaching the handset and that each product request performs a "
            "database round trip to another region.\n\nThe intervention would not be a larger application "
            "server. Product images would be transformed into device-sized variants, stored under immutable "
            "versioned keys and served from an edge location. A published catalogue snapshot removes "
            "the remote database query from page rendering. Success would be measured from Nigerian client "
            "locations using page weight, largest contentful paint, server time and conversion through "
            "the affected journey."
        ),
    },
    {"t": "h2", "num": "2.2", "title": "When reliability is the complaint"},
    {
        "t": "p",
        "text": (
            "Reliability is not the absence of a dramatic outage. A service can return HTTP 200 and "
            "still lose a payment, duplicate an order, serve stale inventory or leave a workflow stuck "
            "for days. We define the correct business state first, then inspect how each dependency can "
            "delay, repeat, reorder or lose a transition."
        ),
    },
    {
        "t": "bullets",
        "items": [
            "Map the full state machine, including pending, uncertain, failed, reversed and manually resolved states.",
            "Make retries safe with idempotency keys and durable request identity.",
            "Treat callbacks and webhooks as deliveries that can arrive late, more than once, or not at all.",
            "Add status queries and reconciliation where an external system remains authoritative.",
            "Define service-level indicators around completed business operations, not only server uptime.",
            "Test restoration from backups and failover paths against agreed recovery time and recovery point objectives.",
        ],
    },
    {"t": "h2", "num": "2.3", "title": "Payment and integration failures"},
    {
        "t": "p",
        "text": (
            "Payment systems expose a common distributed-systems trap: transport success is not "
            "business success. A provider may accept an instruction and settle it later. Another may "
            "return a business refusal inside a technically successful response. A callback may disappear "
            "after money moved. A customer may resubmit because the handset showed no confirmation."
        ),
    },
    {
        "t": "p",
        "text": (
            "Computeflux investigates the contract at every boundary: identifiers, timeout semantics, "
            "retry classes, callback authentication, status transitions, ledger writes and operator "
            "procedures. We may implement a typed integration service in Go, a durable state machine, "
            "idempotency storage, reconciliation jobs, a dead-letter path, signed webhook validation and "
            "transaction-level tracing. The exact design follows the rail, volume and failure modes."
        ),
    },
    {
        "t": "p",
        "text": (
            "Nigeria Inter-Bank Settlement System (NIBSS) describes Nigeria Instant Payment (NIP) "
            "services including name enquiry, direct credit, direct debit and "
            "transaction-status query. That last surface matters because uncertain transactions must be "
            "recovered through state verification, not assumptions. Current integration specifications "
            "and participant requirements must always be obtained from the relevant provider before work begins."
        ),
    },
    {"t": "image", "key": "payment_reliability"},
    {"t": "h2", "num": "2.4", "title": "When the system cannot scale economically", "toc": False},
    {
        "t": "p",
        "text": (
            "A platform has a scalability problem when additional load causes latency, failure or cost "
            "to grow beyond its operating envelope. This does not automatically require microservices, "
            "Kubernetes or a distributed database. Those choices may add more failure modes than they remove."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "Profile the workload and identify which resource saturates first.",
            "Remove accidental work such as repeated queries, duplicate encoding, excessive payloads or unnecessary network calls.",
            "Move delay-tolerant work to bounded asynchronous execution.",
            "Cache results only where invalidation and ownership are explicit.",
            "Rewrite a proven hot path in Go or Rust when runtime overhead is materially responsible.",
            "Scale the smallest component that needs it, then repeat the measurement.",
        ],
    },
    {
        "t": "application",
        "label": "Decision rule",
        "title": "Use the smallest operational system that clears the requirement",
        "text": (
            "A PostgreSQL queue using SKIP LOCKED can be the right answer for a moderate background "
            "workload because it reuses transactional storage the team already operates. Redpanda or "
            "Kafka becomes reasonable when independent consumers, replay, partitioned throughput and "
            "retention justify a dedicated event backbone. The second architecture is not more modern. "
            "It solves a larger class of problem at a larger permanent operating cost."
        ),
    },
    {"t": "h2", "num": "2.5", "title": "Data systems that cannot be trusted", "toc": False},
    {
        "t": "p",
        "text": (
            "A data problem often arrives as a reporting dispute: finance, product and operations show "
            "different numbers for the same event. Other signs include pipelines that miss their window, "
            "silent schema changes, records that cannot be traced to source, or dashboards that are fresh "
            "only after manual repair."
        ),
    },
    {
        "t": "bullets",
        "items": [
            "Introduce explicit, versioned data contracts at producer boundaries.",
            "Measure freshness, completeness, uniqueness and reconciliation, not a generic quality score.",
            "Keep raw history replayable so a fixed pipeline can repair past output.",
            "Choose storage from access patterns: PostgreSQL for transactions, ClickHouse for sustained analytical queries, Parquet with DuckDB for compact analytical workloads.",
            "Use Kafka, Redpanda or another event backbone only when ordering, replay and independent consumption are real requirements.",
            "Assign ownership for each data product and make lineage visible from source to decision.",
        ],
    },
    {"t": "h2", "num": "2.6", "title": "Deployment, observability, security and recovery", "toc": False},
    {
        "t": "p",
        "text": (
            "These concerns are often described separately but fail together. A risky deployment becomes "
            "a long incident when traces are absent. A backup becomes false reassurance when restoration is "
            "never tested. An administrator account becomes a business risk when actions are not attributable."
        ),
    },
    {"t": "image", "key": "resilient_platform"},
    {
        "t": "table",
        "caption": "Operational symptoms and concrete engineering responses.",
        "cols": ["Symptom", "Assessment focus", "Typical intervention", "Success measure"],
        "widths": [35, 41, 48, 38],
        "rows": [
            [
                "Deployments regularly cause incidents",
                "Change history, test gaps, release shape, rollback time.",
                "CI/CD gates, progressive release, immutable artifacts, tested rollback.",
                "Lead time, change failure rate, rollback time.",
            ],
            [
                "Nobody can explain an outage",
                "Trace coverage, log context, metric cardinality, ownership.",
                "OpenTelemetry traces, service indicators, structured events, actionable alerts.",
                "Detection time and mean time to recovery.",
            ],
            [
                "Access is broad and shared",
                "Identity, privilege, secrets, audit records, service accounts.",
                "Least privilege, short-lived credentials, secret rotation, append-only or tamper-evident audit records.",
                "Fewer shared accounts and excess privileges; more attributable privileged actions.",
            ],
            [
                "Recovery exists only on paper",
                "Dependency map, backup integrity, RTO, RPO, supplier failure.",
                "Automated restore, failover exercises, runbooks, recovery evidence.",
                "Observed restore time and observed data loss against RPO.",
            ],
        ],
    },
    {
        "t": "panel",
        "title": "Phrases that should trigger a second question",
        "items": [
            "It only fails during busy periods.",
            "We retry until it works.",
            "The provider says the API call succeeded.",
            "We added servers but users still complain.",
            "Only one engineer understands the deployment.",
            "Finance cannot explain this month's cloud bill.",
            "We have backups, but we have never restored the full service.",
            "The prototype works, but we cannot expose it to customers.",
        ],
    },

    # ======================================================================
    {"t": "section", "num": "3", "title": "What Computeflux\nwould actually do", "accent": "amber"},
    {
        "t": "lead",
        "text": (
            "Our method is stable even when the technology changes: establish the consequence, "
            "measure the system, isolate the cause, make the smallest effective change, and prove the result."
        ),
    },
    {"t": "image", "key": "intervention_method"},
    {
        "t": "p",
        "text": (
            "The sector scenarios below are illustrative intervention paths, not claims of prior "
            "Nigerian client delivery. They show what Computeflux would investigate and implement "
            "when a prospect presents the stated evidence. Prior delivery evidence appears in Part 5."
        ),
    },
    {"t": "h2", "num": "3.1", "title": "Fintech: payment latency and uncertain settlement"},
    {
        "t": "p",
        "text": (
            "**Illustrative client problem.** Customers see payment requests time out. Some retry. Operations staff "
            "then find transactions that moved at the provider but remain pending internally. Support "
            "cannot tell whether to wait, reverse or ask the customer to pay again."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "**Assessment.** Trace transaction samples across gateway, provider and ledger. Classify response codes, timeout points, duplicate attempts, callback delays and manual adjustments. Reconstruct the state machine from code and records.",
            "**Engineering solution.** Define durable transaction identity, idempotent submission, explicit pending and uncertain states, callback authentication, status polling and reconciliation. Separate transport errors from provider business decisions.",
            "**Implementation.** Introduce the state machine behind a controlled interface, migrate active states carefully, add a reconciliation worker and expose an operator queue for exceptions. Roll out by payment route or traffic share.",
            "**Measurement.** Track end-to-end p95 and p99 completion time, duplicate instruction rate, time spent pending, reconciliation backlog, callback loss and manual interventions per thousand transactions.",
            "**Outcome to validate.** Fewer ambiguous transactions, safer retries, faster operator resolution and a measurable account of where payment time is spent.",
        ],
    },
    {
        "t": "p",
        "text": (
            "For Deposit Money Banks (DMBs) and Payment Service Banks (PSBs), architecture must also "
            "fit applicable Central Bank of Nigeria (CBN) controls. The 2024 cybersecurity framework for "
            "DMBs and PSBs includes third-party risk, continuity testing and notification to CBN within "
            "24 hours of detecting defined cyber incidents. That clock is distinct from Nigeria Data "
            "Protection Act breach duties. "
            "Scope and reporting decisions remain the client's legal and compliance responsibility; the "
            "system must make evidence and escalation possible."
        ),
    },
    {"t": "h2", "num": "3.2", "title": "Telecoms: a subscriber platform that degrades under load"},
    {
        "t": "p",
        "text": (
            "**Illustrative client problem.** A subscriber-facing service works at normal traffic but slows or fails "
            "during campaigns, billing events or network incidents. Teams scale whole clusters because "
            "they cannot identify the limiting component."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "**Assessment.** Build a dependency map from entry point to downstream systems. Correlate request rate, concurrency, queue depth, connection pools, CPU, memory, storage latency and third-party response time. Reproduce the load shape rather than a flat synthetic average.",
            "**Engineering solution.** Bound work at the edge, protect dependencies with concurrency limits and circuit breakers, isolate asynchronous tasks, remove hot queries, and define degraded behaviour for unavailable suppliers.",
            "**Implementation.** Add end-to-end traces, capacity tests and service-level indicators first. Change the proven bottleneck, then stage a load test and progressive release. A Go or Rust component may replace a runtime-heavy hot path, but only after profiling identifies it.",
            "**Measurement.** Track successful business operations per second, p95 and p99 latency, saturation, queue age, dependency error and timeout rate, load-shedding rate and recovery time.",
            "**Outcome to validate.** Predictable behaviour during peaks, targeted capacity spending and incident diagnosis that identifies a component rather than blaming the whole platform.",
        ],
    },
    {
        "t": "p",
        "text": (
            "For communications network facility and service providers in Nigeria, disaster recovery "
            "is an operating obligation. Nigerian Communications Commission (NCC) guidelines issued "
            "in 2023 require an approved disaster-recovery plan and comprehensive testing at least "
            "twice yearly. The direct duty belongs to covered providers, but platforms dependent on telecom "
            "providers should still map carrier failure into service behaviour, supplier escalation and "
            "customer communication."
        ),
    },
    {"t": "h2", "num": "3.3", "title": "E-commerce: mobile performance and traffic spikes"},
    {
        "t": "p",
        "text": (
            "**Illustrative client problem.** Product pages are slow on mobile connections and promotional traffic "
            "causes database saturation. Images dominate transfer size. The team pays for more application "
            "capacity even though most page content changes only when the catalogue is published."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "**Assessment.** Measure real page journeys from representative Nigerian networks and devices. Separate DNS, connection, server, asset and rendering time. Profile database work per page and identify content with publish-time rather than request-time semantics.",
            "**Engineering solution.** Transform media once, serve immutable variants near users, publish a versioned catalogue snapshot, and keep checkout and inventory on controlled dynamic paths. Protect origin services with caching and request limits.",
            "**Implementation.** Build the media and publication pipeline alongside the existing storefront. Validate snapshot agreement, switch a small traffic share, and retain a direct rollback to the previous serving path.",
            "**Measurement.** Track bytes per journey, largest contentful paint, origin requests per page, database load, cache effectiveness, checkout completion and infrastructure cost per thousand visits.",
            "**Outcome to validate.** Faster mobile journeys, reduced origin pressure, safer catalogue releases and cost that grows more slowly than traffic.",
        ],
    },
    {"t": "h2", "num": "3.4", "title": "Financial services: modernising around a legacy core"},
    {
        "t": "p",
        "text": (
            "**Illustrative client problem.** New products require direct changes to a legacy core, batch exports and "
            "shared privileged accounts. Integration takes months because ownership and data contracts are "
            "unclear. A full replacement would create unacceptable operational risk."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "**Assessment.** Map business capabilities, interfaces, batch schedules, data ownership, privileged paths, failure recovery and consumers. Identify which core behaviours are stable and which changes block delivery.",
            "**Engineering solution.** Encapsulate the legacy boundary with typed APIs or events, introduce an anti-corruption layer, propagate identity, and build an audit trail. Move one business capability at a time instead of duplicating the entire core.",
            "**Implementation.** Shadow existing outputs, reconcile old and new paths, migrate a bounded consumer, and keep rollback until results agree for an accepted period. Document every contract and owner.",
            "**Measurement.** Track integration lead time, reconciliation differences, privileged manual actions, failed batches, deployment frequency and recovery time.",
            "**Outcome to validate.** Faster product integration, lower migration risk, clearer control boundaries and a modernisation path that does not depend on a big-bang replacement.",
        ],
    },
    {"t": "h2", "num": "3.5", "title": "Marketplace: inconsistent orders, inventory and notifications", "toc": False},
    {
        "t": "p",
        "text": (
            "**Illustrative client problem.** A marketplace has grown from one application into several services. "
            "An order can be accepted while inventory remains unchanged, or a seller receives a notification "
            "for a transaction later reversed. Teams attempt to solve disagreement by adding retries everywhere."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "**Assessment.** Identify the system of record for each business fact. Trace event production and consumption, delivery guarantees, retry policies, duplicate handling and repair procedures.",
            "**Engineering solution.** Define ownership, transactional outbox or equivalent durable publication, idempotent consumers, versioned event contracts and reconciliation between critical stores.",
            "**Implementation.** Instrument lag and duplicate outcomes, migrate one event family, replay controlled history and introduce dead-letter handling with an operator path.",
            "**Measurement.** Track event age, duplicate side effects, disagreement between systems, repair backlog and time from business action to consistent downstream state.",
            "**Outcome to validate.** Fewer contradictory customer states, recoverable event processing and clearer responsibility when a workflow stalls.",
        ],
    },
    {"t": "h2", "num": "3.6", "title": "Prototype to production", "toc": False},
    {
        "t": "p",
        "text": (
            "**Illustrative client problem.** A technology company has a prototype that demonstrates the product but "
            "cannot meet customer traffic, access-control, recovery or cost requirements. The code changes "
            "quickly, yet nobody can state which release produced an output or how to roll it back."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "**Assessment.** Define the production operating envelope: load, latency, availability, data sensitivity, unit economics and team capacity. Profile the prototype and list every implicit dependency.",
            "**Engineering solution.** Keep validated product logic, then add stable interfaces, controlled configuration, testable infrastructure, observability, deployment gates and failure handling proportionate to risk.",
            "**Implementation.** Build one reproducible environment, instrument one full journey, run realistic load, release progressively and transfer operations to the client's team.",
            "**Measurement.** Track successful journeys, latency, failure rate, cost per business operation, deployment lead time and recovery exercise results.",
            "**Outcome to validate.** A service with known limits, repeatable delivery and a team able to operate it without permanent dependency on Computeflux.",
        ],
    },
    {
        "t": "panel",
        "title": "Possible deliverables selected during scoping",
        "items": [
            "Technical assessment and evidence-backed problem statement.",
            "Current-state dependency and architecture map.",
            "Performance, reliability or data analysis with a reproducible baseline.",
            "Prioritised remediation plan with cost, risk and sequencing.",
            "Target architecture and recorded technical decisions.",
            "Production implementation, tests and migration where commissioned.",
            "Infrastructure as code and controlled deployment pipeline.",
            "Operational dashboards, alerts, runbooks and recovery procedures.",
            "Security and access-control improvements within engineering scope.",
            "Documentation, pairing and knowledge transfer. The statement of work defines included deliverables and acceptance criteria.",
        ],
    },

    # ======================================================================
    {"t": "section", "num": "4", "title": "Qualifying and\nassessing a client", "accent": "blue"},
    {
        "t": "lead",
        "text": (
            "Good qualification does not solve the problem before the introduction. It collects enough "
            "context to decide whether a technical investigation is justified."
        ),
    },
    {"t": "h2", "num": "4.1", "title": "The first conversation"},
    {
        "t": "p",
        "text": (
            "Begin with the business event, not the desired tool. If a prospect asks for Kubernetes, "
            "a data lake or a rewrite, ask what changed and what outcome the proposed technology is meant "
            "to produce. The following checklist is designed for a thirty-minute conversation."
        ),
    },
    {
        "t": "numbered",
        "items": [
            "What exactly is happening that should not happen?",
            "Which customers, staff, transactions or processes are affected?",
            "What is the financial, operational, regulatory or reputational impact?",
            "How long has the problem existed, and did it begin after a known change?",
            "Is it constant, intermittent, location-specific or linked to peak traffic?",
            "How many users, requests, transactions or events does the system handle now?",
            "What growth or peak load must it handle over the next twelve months?",
            "Which applications, clouds, data centres, databases and networks are involved?",
            "Which banks, payment providers, mobile operators, SaaS products or other third parties sit on the path?",
            "What latency, error, availability, backlog or cost figures are available?",
            "What was normal before the problem, and what target would count as success?",
            "What has the team already tried, and what happened?",
            "Are there security, licensing, data-transfer, audit or residency constraints?",
            "What access can be provided to architecture, code, logs, traces, metrics, bills and incident records?",
            "Who owns the system technically, and who owns the business outcome?",
            "Is there a deadline driven by growth, a launch, an audit, a contract or repeated incidents?",
            "Who can approve confidentiality terms and access to the required evidence?",
            "Who is the economic sponsor, and is there a funding path for a paid proof or implementation if the diagnosis supports one?",
            "What procurement, vendor-onboarding or contracting steps could affect the schedule?",
        ],
    },
    {"t": "h2", "num": "4.2", "title": "Information needed before diagnosis"},
    {
        "t": "table",
        "caption": "Evidence Computeflux may request. Not every engagement needs every item.",
        "cols": ["Area", "Useful material", "What it establishes"],
        "widths": [35, 70, 57],
        "rows": [
            [
                "Business flow",
                "Journey map, transaction states, operating procedure, impact estimate.",
                "What correctness and success mean outside the code.",
            ],
            [
                "Architecture",
                "Service map, network path, deployment topology, data stores, third parties.",
                "Boundaries, ownership and likely failure propagation.",
            ],
            [
                "Runtime evidence",
                "Metrics, structured logs, traces, queue depth, query plans, profiles.",
                "Where time, errors and resources accumulate.",
            ],
            [
                "History",
                "Incident timeline, release log, configuration changes, support tickets.",
                "Whether the symptom correlates with a change or traffic pattern.",
            ],
            [
                "Scale and cost",
                "Traffic shape, concurrency, data growth, invoices, reservations, utilisation.",
                "Current operating envelope and unit economics.",
            ],
            [
                "Controls",
                "Identity model, privileges, retention, backup, restore tests, supplier SLAs.",
                "Security and recovery constraints around any intervention.",
            ],
        ],
    },
    {"t": "h2", "num": "4.3", "title": "Metrics that help locate the problem"},
    {
        "t": "table",
        "cols": ["Concern", "Technical indicators", "Business indicator"],
        "widths": [34, 78, 50],
        "rows": [
            [
                "Performance",
                "p50, p95 and p99 latency; queue time; query time; client rendering; dependency time.",
                "Completion or abandonment of the affected journey.",
            ],
            [
                "Reliability",
                "Error and timeout rate; retry rate; stuck states; failover and restore time.",
                "Successful business operations and manual recovery volume.",
            ],
            [
                "Capacity",
                "Throughput; concurrency; saturation; backlog age; headroom under peak shape.",
                "Demand served without delay or rejection.",
            ],
            [
                "Data",
                "Freshness; completeness; duplicates; reconciliation difference; schema failures.",
                "Decisions or reports produced correctly and on time.",
            ],
            [
                "Delivery",
                "Lead time; deployment frequency; change failure rate; rollback and recovery time.",
                "Time to ship a product or regulatory change safely.",
            ],
            [
                "Cost",
                "Cost by service, request, transaction, tenant or data volume; idle and transfer cost.",
                "Gross margin or operating cost per completed outcome.",
            ],
        ],
    },
    {"t": "h2", "num": "4.4", "title": "How root cause is established"},
    {
        "t": "numbered",
        "items": [
            "**Define the failed outcome.** State one observable difference between expected and actual behaviour.",
            "**Build the timeline.** Align business events, releases, configuration, traffic and dependency incidents.",
            "**Reproduce or select examples.** Use a controlled test or a representative set of real failures.",
            "**Trace the whole path.** Follow one operation through client, edge, service, queue, database and third party.",
            "**Form competing hypotheses.** Keep network, application, data and supplier causes separate until evidence eliminates them.",
            "**Change one variable.** Profile, shadow, replay or load-test a bounded component without mistaking correlation for causation.",
            "**Confirm the cause.** A fix must change the target metric and survive representative traffic or replay.",
            "**Check displacement.** Confirm the intervention did not move latency, cost or failure into another part of the journey.",
        ],
    },
    {"t": "image", "key": "qualification_flow"},
    {"t": "h2", "num": "4.5", "title": "The opportunity brief sent to Computeflux", "toc": False},
    {
        "t": "panel",
        "title": "One-page handoff template",
        "items": [
            "Company, sector and decision owner.",
            "Problem in the client's own words.",
            "Business impact and affected workflow.",
            "System scale and traffic pattern.",
            "Current stack, hosting and material integrations.",
            "Available measurements and one representative incident.",
            "Previous attempts and known constraints.",
            "Desired outcome, urgency and access available for assessment.",
            "Economic sponsor, funding path and procurement constraints for any next phase.",
            "Authority to approve confidentiality terms and evidence access.",
        ],
    },
    {"t": "h2", "num": "4.6", "title": "Go, investigate, or decline", "toc": False},
    {
        "t": "table",
        "caption": "A practical decision after the first technical conversation.",
        "cols": ["Decision", "Meaning", "Next step"],
        "widths": [30, 78, 54],
        "rows": [
            [
                "Go",
                "Impact, evidence, sponsor, access authority, funding path and Computeflux fit are clear enough to scope work.",
                "Agree baseline, deliverables, access, commercial scope and success criteria.",
            ],
            [
                "Investigate",
                "Problem may fit, but evidence is missing or several causes remain plausible.",
                "Run the bounded complimentary diagnostic or instrument first.",
            ],
            [
                "Decline",
                "No meaningful impact, no owner, no evidence access, or work falls outside core capability.",
                "Explain the reason early and avoid manufacturing a project.",
            ],
        ],
    },

    # ======================================================================
    {"t": "section", "num": "5", "title": "From proof\nto engagement", "accent": "magenta"},
    {
        "t": "lead",
        "text": (
            "Trust is strongest when a small piece of evidence changes a real decision. The first "
            "engagement should prove understanding before it asks the client to fund a large programme."
        ),
    },
    {"t": "h2", "num": "5.1", "title": "A complimentary diagnostic"},
    {
        "t": "p",
        "text": (
            "Subject to Computeflux acceptance, a qualified opportunity may "
            "receive a complimentary diagnostic capped at two engineer-days in total. Qualification occurs "
            "before this scope begins. The two days may be scheduled across more than two calendar days and "
            "include the workshop, evidence review, readout and short written note. The diagnostic covers one "
            "system and one stated problem using evidence the client already has. It does not include production "
            "changes, a full security audit, certification, migration or an open-ended code review."
        ),
    },
    {"t": "image", "key": "proof_of_value"},
    {
        "t": "table",
        "caption": "Shape of the initial proof-of-service engagement.",
        "cols": ["Stage", "Work", "Output"],
        "widths": [31, 76, 55],
        "rows": [
            [
                "Prerequisite",
                "Confirm owner, consequence, bounded system, available evidence and Computeflux fit.",
                "Accepted diagnostic question before complimentary scope begins, or an early no.",
            ],
            [
                "Engineer-day one",
                "Focused workshop, architecture walk-through and read-only review of existing evidence.",
                "Problem statement, timeline, evidence map and competing hypotheses.",
            ],
            [
                "Engineer-day two",
                "Analyse agreed evidence, present findings and decide whether a proof of value is justified.",
                "Short written note with likely cause, confidence, missing evidence, baseline plan and next step.",
            ],
        ],
    },
    {
        "t": "p",
        "text": (
            "The diagnostic can conclude that Computeflux should not proceed. It can also conclude that "
            "instrumentation is required before anyone can make a responsible recommendation. Both are "
            "useful results because they prevent a larger engagement from being built on guesswork."
        ),
    },
    {"t": "h2", "num": "5.2", "title": "The paid proof of value"},
    {
        "t": "p",
        "text": (
            "When diagnosis identifies a tractable cause, the next step is a small implementation that "
            "can move one agreed metric without exposing the whole platform to change. A useful proof of "
            "value has a baseline, a bounded intervention, representative traffic or replay, a stop rule "
            "and a decision it will inform."
        ),
    },
    {
        "t": "bullets",
        "items": [
            "Instrument one critical user or transaction journey end to end.",
            "Optimise one proven latency or compute hot path.",
            "Make one payment integration idempotent and reconcilable in a test or shadow environment.",
            "Move one heavy read path to a versioned edge snapshot.",
            "Rebuild one failing data pipeline with contracts and replay.",
            "Automate restore and run one measured recovery exercise.",
            "Replace one manual deployment path with a controlled, reversible release.",
        ],
    },
    {"t": "h2", "num": "5.3", "title": "How a client knows the engagement succeeded"},
    {
        "t": "p",
        "text": (
            "Targets are agreed only after a baseline exists. A statement such as lower latency is not "
            "enough. The scorecard must name the journey, percentile, traffic conditions, measurement "
            "window and guardrail metric that must remain stable."
        ),
    },
    {
        "t": "table",
        "caption": "Outcome categories and evidence of success.",
        "cols": ["Outcome", "Evidence", "Guardrail"],
        "widths": [35, 72, 55],
        "rows": [
            [
                "Lower latency",
                "Before-and-after p95 and p99 for the same journey and representative load.",
                "Error rate and correctness do not regress.",
            ],
            [
                "Better reliability",
                "More completed business operations, fewer stuck states, shorter recovery time.",
                "Retries do not create duplicate side effects.",
            ],
            [
                "Increased capacity",
                "Higher sustained throughput within the target latency and resource envelope.",
                "No hidden backlog or dependency saturation.",
            ],
            [
                "Lower cost",
                "Lower cost per request, transaction, job or unit of data under comparable demand.",
                "Service level and operational burden stay acceptable.",
            ],
            [
                "Faster delivery",
                "Shorter lead time, more frequent safe releases, shorter rollback time.",
                "Change failure rate does not increase.",
            ],
            [
                "Better control",
                "More complete traces, attributable access, tested restoration and current runbooks.",
                "Sensitive data and privileges remain bounded.",
            ],
        ],
    },
    {"t": "h2", "num": "5.4", "title": "Relevant experience: mobile-money payments in the DRC", "toc": False},
    {
        "t": "application",
        "label": "Anonymised delivery",
        "title": "Building the payment processor the market required",
        "text": (
            "**Situation.** An e-commerce platform serving the Democratic Republic of Congo needed a "
            "checkout built around Mobile Money rather than assuming a card-first journey.\n\n**Problem.** "
            "The M-Pesa DRC interface used expiring sessions, asynchronous confirmation and business "
            "response codes that could arrive inside successful HTTP transport. A buyer could submit "
            "again while waiting for handset confirmation, and a callback could fail after the instruction "
            "was accepted.\n\n**Engineering approach.** Computeflux built a Go client and payment use-case "
            "layer with early session refresh, concurrency control, durable idempotency, generated correlation "
            "identifiers, explicit processing states, raw callback journaling, status recovery and a reconciliation "
            "path. Operator tooling exposed pending, completed, failed and reversed transactions.\n\n**Result.** "
            "The platform gained a complete server-side Mobile Money path designed for safe retries, asynchronous "
            "settlement and auditable disputes. It remained behind a product feature flag at the time documented. "
            "We state that distinction because building a payment method and releasing it to customers are separate events."
        ),
    },
    {"t": "h2", "num": "5.5", "title": "Relevant experience: publishing a versioned catalogue to the edge", "toc": False},
    {
        "t": "application",
        "label": "Same programme, second problem",
        "title": "Publishing a versioned catalogue snapshot near its users",
        "text": (
            "**Situation.** The same commerce programme needed to deliver a media-heavy catalogue to "
            "mobile users far from the relational database while giving operators precise control over "
            "what was live.\n\n**Problem.** The original design synchronised changes through twenty-eight "
            "database triggers and eighteen functions. Product edits fanned out into edge writes, and source "
            "images from real suppliers included malformed files that failed normal processing.\n\n**Engineering "
            "approach.** Computeflux separated authoring, media and published zones. A Go worker pool claimed "
            "jobs from PostgreSQL with SKIP LOCKED, sanitised and resized images through libvips, then wrote "
            "immutable variants to object storage. Operators previewed a content-hash diff and published a "
            "versioned catalogue snapshot to the edge. Product-page reads use that published snapshot and "
            "do not query the relational database.\n\n**Result.** The published zone became rebuildable, releases became attributable "
            "and reversible, and page delivery no longer depended on a cross-region database query. This work "
            "and the payment processor belong to one programme; they are not presented as separate clients."
        ),
    },
    {"t": "h2", "num": "5.6", "title": "How a Nigerian partner and Computeflux work together", "toc": False},
    {
        "t": "table",
        "caption": "Clear ownership keeps qualification fast and client communication coherent.",
        "cols": ["Nigeria", "Shared", "Computeflux"],
        "widths": [54, 54, 54],
        "rows": [
            [
                "Identify sectors, companies and decision makers with a visible business problem.",
                "Agree opportunity language, confidentiality and client expectations.",
                "Test technical fit and identify evidence required for diagnosis.",
            ],
            [
                "Provide local operating context, stakeholder access and commercial relationship.",
                "Run the first problem-framing conversation and define next decision.",
                "Lead architecture, engineering assessment and technical communication.",
            ],
            [
                "Keep the opportunity brief current and avoid promising an unmeasured result.",
                "Maintain one account of scope, progress, risk and success criteria.",
                "Implement, measure, document and transfer the commissioned solution.",
            ],
        ],
    },
    {"t": "h2", "num": "5.7", "title": "The ideal first opportunity", "toc": False},
    {
        "t": "callout",
        "title": "A clear yes",
        "text": (
            "A Nigerian company operates a revenue-critical or regulated digital system. It has a persistent "
            "performance, reliability, integration, data or infrastructure problem with visible business impact. "
            "The team has tried ordinary fixes, a technical owner can provide evidence, leadership wants a measured "
            "outcome, and the problem requires specialist diagnosis or remediation that routine product "
            "support has not resolved. That is exactly the kind "
            "of opportunity Computeflux should investigate."
        ),
        "accent": "magenta",
    },
    {
        "t": "p",
        "text": (
            "The first joint success does not need to be the largest contract. It should be a problem with "
            "before-and-after results that engineers and business leaders can verify. A trustworthy result "
            "creates the evidence for the next engagement."
        ),
    },
    {"t": "h3", "title": "Bring us one concrete problem", "toc": False},
    {
        "t": "p",
        "text": (
            "Start with one affected journey, one business consequence and whatever evidence already exists. "
            "Computeflux will help decide whether the right next step is a diagnostic, instrumentation, a bounded "
            "proof of value, or an honest no."
        ),
    },
    {
        "t": "contact",
        "lines": [
            ("Write", "gabriel.mougard@gmail.com", "mailto:gabriel.mougard@gmail.com"),
            ("Website", "computeflux.xyz/en", "https://computeflux.xyz/en"),
            ("Book a call", "computeflux.xyz/en/book", "https://computeflux.xyz/en/book"),
            ("LinkedIn", "linkedin.com/company/computeflux", "https://www.linkedin.com/company/computeflux"),
        ],
        "note": (
            "For partner introductions, include the problem, business impact, system scale, owner and "
            "available evidence."
        ),
    },
]


RESOURCES = {
    "title": "Resources",
    "intro": (
        "Primary Nigerian sources and Computeflux case studies used to ground this guide. "
        "Regulatory scope should be confirmed for each client and engagement."
    ),
    "groups": [
        {
            "title": "Nigeria: data, payments and resilience",
            "items": [
                (
                    "Nigeria Data Protection Act 2023",
                    "ndpc.gov.ng / Nigeria Data Protection Act",
                    "https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf",
                ),
                (
                    "NDP Act General Application and Implementation Directive 2025",
                    "ndpc.gov.ng / GAID 2025",
                    "https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf",
                ),
                (
                    "CBN payment-system risk and information-security framework",
                    "cbn.gov.ng / Payments System Supervision",
                    "https://www.cbn.gov.ng/PaymentsSystem/",
                ),
                (
                    "CBN open-banking operational guidelines",
                    "cbn.gov.ng / Payments System Supervision",
                    "https://www.cbn.gov.ng/PaymentsSystem/",
                ),
                (
                    "CBN cybersecurity framework for DMBs and PSBs",
                    "web.archive.org / archived CBN publication",
                    "https://web.archive.org/web/20240629191938/https://www.cbn.gov.ng/Out/2024/BSD/CBN%20Risk-Based%20Cybersecurity%20Framework%20for%20DMBs%20and%20PSBs_2024.pdf",
                ),
                (
                    "NIBSS overview of NIP services",
                    "contactcentre.nibss-plc.com.ng / NIP services",
                    "https://contactcentre.nibss-plc.com.ng/support/solutions/articles/47001265115-what-are-the-services-under-nip-that-customers-can-utilize-",
                ),
                (
                    "NCC disaster-recovery guidelines for the communications industry",
                    "ncc.gov.ng / disaster recovery 2023",
                    "https://www.ncc.gov.ng/media/140/view",
                ),
            ],
        },
        {
            "title": "DRC delivery evidence: one programme, two studies",
            "items": [
                (
                    "Edge e-commerce: payment is the product",
                    "computeflux.xyz/en/studies/mobile-money-payment-processor",
                    "https://computeflux.xyz/en/studies/mobile-money-payment-processor",
                ),
                (
                    "Edge e-commerce: the catalogue is a build artifact",
                    "computeflux.xyz/en/studies/edge-serving-layer",
                    "https://computeflux.xyz/en/studies/edge-serving-layer",
                ),
            ],
        },
        {
            "title": "Computeflux service descriptions",
            "items": [
                (
                    "Data engineering",
                    "computeflux.xyz/en/expertise/data-engineering",
                    "https://computeflux.xyz/en/expertise/data-engineering",
                ),
                (
                    "Bare metal and compute",
                    "computeflux.xyz/en/expertise/bare-metal",
                    "https://computeflux.xyz/en/expertise/bare-metal",
                ),
                (
                    "Inference and performance optimisation",
                    "computeflux.xyz/en/expertise/inference-optimization",
                    "https://computeflux.xyz/en/expertise/inference-optimization",
                ),
            ],
        },
    ],
}
